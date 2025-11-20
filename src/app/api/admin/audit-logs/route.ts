import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuditLogs, getAuditStatistics } from '@/lib/adminAudit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/audit-logs - Get audit logs with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const adminId = searchParams.get('adminId') || undefined;
    const action = searchParams.get('action') || undefined;
    const targetType = searchParams.get('targetType') || undefined;
    const targetId = searchParams.get('targetId') || undefined;
    const success = searchParams.get('success') ? searchParams.get('success') === 'true' : undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Get audit logs
    const result = await getAuditLogs({
      adminId,
      action,
      targetType,
      targetId,
      success,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    });

    // Get statistics if requested
    let statistics = null;
    if (includeStats) {
      const statsDays = parseInt(searchParams.get('statsDays') || '30');
      statistics = await getAuditStatistics(statsDays);
    }

    return NextResponse.json({
      ...result,
      ...(statistics && { statistics })
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}