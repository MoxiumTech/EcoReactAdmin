import { NextResponse } from 'next/server';
import { storage, ID, getMaskedImageUrl, getFileIdFromUrl } from '@/lib/appwrite-config';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    // Verify admin authentication
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access. Admin authentication required.'
      }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        message: 'URL is required'
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
      return NextResponse.json({
        success: false,
        message: 'Storage not configured'
      }, { status: 500 });
    }

    // Extract file ID from the URL
    const fileId = getFileIdFromUrl(url);
    if (!fileId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid image URL'
      }, { status: 400 });
    }

    // Delete from Appwrite
    await storage.deleteFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      fileId
    );

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('[DELETE_FILE_ERROR]', error);

    if (error?.code === 401 || error?.code === 403) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 });
    }

    if (error?.code === 404) {
      return NextResponse.json({
        success: false,
        message: 'File not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access. Admin authentication required.'
      }, { status: 401 });
    }

    // Validate Content-Type
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        message: 'Content type must be multipart/form-data'
      }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: 'File must be an image'
      }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
      return NextResponse.json({
        success: false,
        message: 'Storage not configured'
      }, { status: 500 });
    }

    // Upload to Appwrite
    const result = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );

    // Get masked URL for the uploaded file
    const maskedUrl = getMaskedImageUrl(result.$id);

    return NextResponse.json({
      success: true,
      fileId: result.$id,
      url: maskedUrl
    });

  } catch (error: any) {
    console.error('[UPLOAD_ERROR]', error);

    // Return meaningful error messages
    if (error?.code === 401 || error?.code === 403) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 });
    }

    if (error?.code === 413) {
      return NextResponse.json({
        success: false,
        message: 'File size too large'
      }, { status: 413 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
