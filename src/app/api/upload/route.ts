import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, access } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

// Helper function to validate image dimensions
async function validateImageDimensions(buffer: Buffer): Promise<{ width: number; height: number; valid: boolean }> {
  try {
    // Basic image header validation for common formats
    const uint8Array = new Uint8Array(buffer);
    
    // PNG validation
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
      const width = (uint8Array[16] << 24) | (uint8Array[17] << 16) | (uint8Array[18] << 8) | uint8Array[19];
      const height = (uint8Array[20] << 24) | (uint8Array[21] << 16) | (uint8Array[22] << 8) | uint8Array[23];
      return { width, height, valid: width > 0 && height > 0 && width <= 4096 && height <= 4096 };
    }
    
    // JPEG validation
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      // For JPEG, we'll do a basic validation
      return { width: 0, height: 0, valid: true }; // Simplified for now
    }
    
    // WebP validation
    if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46) {
      return { width: 0, height: 0, valid: true }; // Simplified for now
    }
    
    // GIF validation
    if ((uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) ||
        (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46)) {
      return { width: 0, height: 0, valid: true }; // Simplified for now
    }
    
    return { width: 0, height: 0, valid: false };
  } catch (error) {
    console.error('Image validation error:', error);
    return { width: 0, height: 0, valid: false };
  }
}

// Helper function to sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Helper function to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const replaceUrl = formData.get('replaceUrl') as string; // Optional: URL of file to replace

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file name
    if (!file.name || file.name.length > 255) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
          allowedTypes: ALLOWED_TYPES
        },
        { status: 400 }
      );
    }

    // Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { 
          error: 'Invalid file extension. Only jpg, jpeg, png, webp, and gif are allowed.',
          allowedExtensions: ALLOWED_EXTENSIONS
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size
        },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image content
    const imageValidation = await validateImageDimensions(buffer);
    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid or corrupted image file' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedName = sanitizeFilename(file.name.split('.')[0]);
    const filename = `${timestamp}-${randomString}-${sanitizedName}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      );
    }

    const filePath = join(uploadsDir, filename);

    // Check if file already exists (very unlikely but good to check)
    if (await fileExists(filePath)) {
      return NextResponse.json(
        { error: 'File with this name already exists. Please try again.' },
        { status: 409 }
      );
    }

    // Save file
    try {
      await writeFile(filePath, buffer);
      console.log('File successfully written to:', filePath);
    } catch (error) {
      console.error('Failed to write file:', error);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }

    // If replacing an existing file, try to delete the old one
    if (replaceUrl && replaceUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = replaceUrl.replace('/uploads/', '');
        const oldFilePath = join(uploadsDir, oldFilename);
        if (await fileExists(oldFilePath)) {
          await unlink(oldFilePath);
          console.log('Successfully deleted old file:', oldFilename);
        }
      } catch (error) {
        console.warn('Failed to delete old file:', error);
        // Don't fail the upload if we can't delete the old file
      }
    }

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      dimensions: imageValidation.width && imageValidation.height ? {
        width: imageValidation.width,
        height: imageValidation.height
      } : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        return NextResponse.json(
          { error: 'Insufficient disk space' },
          { status: 507 }
        );
      }
      if (error.message.includes('EACCES')) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

// Add DELETE endpoint for cleaning up unused images
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    const filename = fileUrl.replace('/uploads/', '');
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadsDir, filename);

    if (await fileExists(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ success: true, message: 'File deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}