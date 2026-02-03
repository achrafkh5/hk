import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    console.log("📤 Upload request received");
    
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "uploads";

    console.log("📁 Folder:", folder);
    console.log("📄 File:", file ? `${file.name} (${file.type}, ${file.size} bytes)` : "No file");

    if (!file) {
      console.error("❌ No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Get file information
    const fileName = file.name || '';
    const fileType = file.type || '';
    const fileSize = file.size || 0;
    
    console.log("📊 File details:", {
      name: fileName,
      type: fileType,
      size: `${fileSize} bytes`
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Verify buffer has content
    if (buffer.length === 0) {
      console.error("❌ Buffer is empty!");
      return NextResponse.json({ 
        error: "File is empty or corrupted" 
      }, { status: 400 });
    }
    
    console.log("✅ Buffer created:", `${buffer.length} bytes`);
    
    // Determine resource type based on file type
    let resourceType = 'auto';
    const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    
    if (fileType.startsWith('image/')) {
      resourceType = 'image';
    } else if (fileType.startsWith('video/')) {
      resourceType = 'video';
    } else if (isPDF) {
      resourceType = 'raw';
    } else {
      resourceType = 'raw';
    }

    console.log("☁️ Uploading to Cloudinary...");
    console.log("Resource type:", resourceType);
    console.log("File type:", fileType);
    console.log("Is PDF:", isPDF);

    let result;

    // For PDFs and raw files, use upload_stream to preserve binary integrity
    // This ensures PDFs are viewable in browser
    if (resourceType === 'raw') {
      console.log("📄 Using upload_stream for binary file (PDF/raw)");
      
      result = await new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: folder,
          resource_type: 'raw',
          use_filename: true,
          unique_filename: true,
          type: 'upload',
          access_mode: 'public',
        };

        // For PDFs specifically, add format to ensure proper handling
        if (isPDF) {
          uploadOptions.format = 'pdf';
          console.log("📋 Setting format to PDF for proper handling");
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("❌ Upload stream error:", error);
              reject(error);
            } else {
              console.log("✅ Upload stream successful");
              console.log("📄 PDF URL:", result.secure_url);
              resolve(result);
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(buffer);
      });
    } else {
      // For images and videos, use base64 data URI (works well for these)
      console.log("🖼️ Using data URI for image/video");
      const base64String = buffer.toString('base64');
      const dataUri = `data:${fileType};base64,${base64String}`;

      result = await cloudinary.uploader.upload(dataUri, {
        folder: folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      });
    }

    console.log("✅ Upload successful:", result.secure_url);

    return NextResponse.json(
      {
        success: true,
        public_id: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type,
        format: result.format,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: "Upload failed", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
