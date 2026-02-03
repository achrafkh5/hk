import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    console.log("🗑️ Delete file request received");
    
    const { url, publicId, resourceType } = await req.json();

    // If publicId is provided directly, use it (more reliable)
    if (publicId) {
      console.log("✅ Using provided public_id:", publicId);
      console.log("📁 Using provided resource_type:", resourceType);

      // Verify Cloudinary config
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("❌ Cloudinary credentials not configured");
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
      }

      // Try to delete using the provided public_id
      console.log("🔧 Attempting deletion with provided public_id");
      
      let result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType || 'raw',
        invalidate: true
      });

      console.log("✅ Cloudinary delete result:", JSON.stringify(result, null, 2));

      if (result.result === 'ok') {
        return NextResponse.json({ 
          success: true, 
          message: 'File deleted successfully from Cloudinary',
          result: result.result
        });
      } else if (result.result === 'not found') {
        // Try with Admin API
        console.log("⚠️ First attempt failed, trying with Admin API...");
        try {
          const adminResult = await cloudinary.api.delete_resources([publicId], {
            resource_type: resourceType || 'raw',
            type: 'upload'
          });
          
          console.log("✅ Admin API result:", JSON.stringify(adminResult, null, 2));
          
          if (adminResult.deleted && adminResult.deleted[publicId] === 'deleted') {
            return NextResponse.json({ 
              success: true, 
              message: 'File deleted successfully from Cloudinary using Admin API',
              result: 'ok'
            });
          }
        } catch (adminError) {
          console.error("❌ Admin API error:", adminError);
        }

        console.log("⚠️ File not found in Cloudinary");
        return NextResponse.json({ 
          success: false, 
          message: 'Could not delete file from Cloudinary. File may still exist but API lacks permissions to delete it.',
          result: result.result,
          warning: 'File was not deleted from Cloudinary - you may need to delete it manually from the Cloudinary console'
        });
      }
    }

    // Fallback to URL extraction if publicId not provided
    if (!url) {
      console.error("❌ No URL or publicId provided");
      return NextResponse.json({ error: "No URL or publicId provided" }, { status: 400 });
    }

    console.log("🔍 URL to delete:", url);

    // Verify Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary credentials not configured");
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{folder}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      console.error("❌ Invalid Cloudinary URL format");
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // Detect resource type from URL (image, video, raw, etc.)
    const extractedResourceType = urlParts[uploadIndex - 1]; // 'image', 'raw', 'video'
    console.log("📁 Resource type:", extractedResourceType);

    // Get everything after 'upload/' including version
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    
    // Check if there's a version part (v followed by numbers)
    const hasVersion = /^v\d+\//.test(pathAfterUpload);
    if (hasVersion) {
      // Skip the version part
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    }
    
    // Remove file extension
    let extractedPublicId = pathAfterUpload.split('.')[0];

    console.log("🆔 Extracted public_id:", extractedPublicId);
    console.log("🔧 Attempting deletion with resource_type:", extractedResourceType);
    console.log("📝 Full path after upload:", pathAfterUpload);

    // First, check if the resource exists
    console.log("🔍 Checking if resource exists in Cloudinary...");
    let resourceExists = false;
    try {
      const resourceInfo = await cloudinary.api.resource(extractedPublicId, {
        resource_type: extractedResourceType || 'raw',
        type: 'upload'
      });
      resourceExists = true;
      console.log("✅ Resource found:", JSON.stringify(resourceInfo, null, 2));
    } catch (checkError) {
      console.log("❌ Resource check failed:", checkError.message);
      if (checkError.error && checkError.error.http_code === 404) {
        console.log("⚠️ Resource does not exist in Cloudinary (404)");
      }
    }

    // Try to delete from Cloudinary with appropriate resource type
    let result = await cloudinary.uploader.destroy(extractedPublicId, {
      resource_type: extractedResourceType || 'raw',
      invalidate: true
    });

    console.log("✅ Cloudinary delete result:", JSON.stringify(result, null, 2));

    // If not found, try with different approaches
    if (result.result === 'not found') {
      console.log("⚠️ First attempt failed, trying alternative methods...");
      
      // Try using Admin API for resources
      console.log("🔄 Trying with Admin API...");
      try {
        const adminResult = await cloudinary.api.delete_resources([extractedPublicId], {
          resource_type: extractedResourceType || 'raw',
          type: 'upload'
        });
        
        console.log("✅ Admin API result:", JSON.stringify(adminResult, null, 2));
        
        if (adminResult.deleted && adminResult.deleted[publicId] === 'deleted') {
          result = { result: 'ok' };
        }
      } catch (adminError) {
        console.error("❌ Admin API error:", adminError);
      }
    }

    // If still not found, the file might not exist or was already deleted
    if (result.result === 'ok') {
      return NextResponse.json({ 
        success: true, 
        message: 'File deleted successfully from Cloudinary',
        result: result.result,
        resourceExisted: resourceExists
      });
    } else if (result.result === 'not found') {
      console.log("⚠️ File not found in Cloudinary");
      console.log("📋 Summary:");
      console.log("  - URL:", url);
      console.log("  - Public ID:", extractedPublicId);
      console.log("  - Resource Type:", extractedResourceType);
      console.log("  - Resource existed before deletion attempt:", resourceExists);
      console.log("⚠️ NOTE: File may exist but API credentials lack delete permissions");
      
      return NextResponse.json({ 
        success: false, 
        message: 'Could not delete file from Cloudinary. File may still exist but API lacks permissions to delete it.',
        result: result.result,
        resourceExisted: resourceExists,
        warning: 'File was not deleted from Cloudinary - you may need to delete it manually from the Cloudinary console',
        details: {
          url,
          publicId: extractedPublicId,
          resourceType: extractedResourceType
        }
      });
    } else {
      throw new Error(`Unexpected Cloudinary result: ${result.result}`);
    }

  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
