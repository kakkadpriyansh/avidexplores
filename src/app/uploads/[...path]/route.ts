import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath);

    // Check if file exists
    try {
      await stat(fullPath);
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Get the MIME type
    const mimeType = lookup(fullPath) || 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}