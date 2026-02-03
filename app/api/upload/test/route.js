import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    // Test Cloudinary configuration
    const config = cloudinary.config();
    
    return NextResponse.json({
      success: true,
      configured: !!(config.cloud_name && config.api_key && config.api_secret),
      cloud_name: config.cloud_name || "NOT SET",
      api_key: config.api_key ? "SET (hidden)" : "NOT SET",
      api_secret: config.api_secret ? "SET (hidden)" : "NOT SET",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
