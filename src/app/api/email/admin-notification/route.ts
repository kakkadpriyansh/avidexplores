import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/email/admin-notification - Send admin notification (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Send admin notification
    await sendAdminNotification(subject, content);

    return NextResponse.json({
      success: true,
      message: 'Admin notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to send admin notification' },
      { status: 500 }
    );
  }
}