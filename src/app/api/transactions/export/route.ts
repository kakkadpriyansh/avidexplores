import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TransactionLog from '@/models/TransactionLog';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/transactions/export - Export transaction logs as CSV or Excel (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Export format
    const format = searchParams.get('format') || 'csv'; // csv or excel
    
    // Filters (same as GET /api/transactions)
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const currency = searchParams.get('currency');
    const userId = searchParams.get('userId');
    const bookingId = searchParams.get('bookingId');
    const isReconciled = searchParams.get('isReconciled');
    const search = searchParams.get('search');
    
    // Date filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Amount filters
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    
    // Export options
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const maxRecords = Math.min(parseInt(searchParams.get('maxRecords') || '10000'), 50000);
    
    // Build filter object (same logic as GET route)
    const filter: any = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (currency) filter.currency = currency;
    if (userId) filter.userId = userId;
    if (bookingId) filter.bookingId = bookingId;
    if (isReconciled !== null && isReconciled !== undefined) {
      filter.isReconciled = isReconciled === 'true';
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter['amount.gross'] = {};
      if (minAmount) filter['amount.gross'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['amount.gross'].$lte = parseFloat(maxAmount);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { gatewayTransactionId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get transactions for export
    const transactions = await (TransactionLog as Model<any>).find(filter)
      .populate('userId', 'name email')
      .populate('bookingId', 'bookingId')
      .populate('eventId', 'title slug')
      .populate('promoCodeId', 'code')
      .sort({ createdAt: -1 })
      .limit(maxRecords)
      .lean();
    
    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found for export' },
        { status: 404 }
      );
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transactions_export_${timestamp}`;
    
    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(transactions, includeMetadata);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
          'Cache-Control': 'no-cache'
        }
      });
    } else if (format === 'excel') {
      // For Excel format, we'll return JSON that can be processed by frontend
      // In a real implementation, you'd use a library like xlsx to generate actual Excel files
      const excelData = generateExcelData(transactions, includeMetadata);
      
      return NextResponse.json({
        success: true,
        format: 'excel',
        filename: `${filename}.xlsx`,
        data: excelData,
        totalRecords: transactions.length,
        message: 'Excel data generated successfully. Process on frontend with xlsx library.'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, excel' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}

// Helper function to generate CSV content
function generateCSV(transactions: any[], includeMetadata: boolean): string {
  // Define CSV headers
  const baseHeaders = [
    'Transaction ID',
    'Booking ID',
    'User Name',
    'User Email',
    'Type',
    'Status',
    'Gross Amount',
    'Net Amount',
    'Tax',
    'Processing Fee',
    'Platform Fee',
    'Discount',
    'Currency',
    'Payment Method',
    'Payment Gateway',
    'Gateway Transaction ID',
    'Event Title',
    'Promo Code',
    'Description',
    'Initiated At',
    'Processed At',
    'Completed At',
    'Is Reconciled',
    'Reconciled At',
    'Created At'
  ];
  
  const metadataHeaders = [
    'IP Address',
    'User Agent',
    'Device Info',
    'Country',
    'State',
    'City',
    'Risk Score',
    'Fraud Flags'
  ];
  
  const headers = includeMetadata ? [...baseHeaders, ...metadataHeaders] : baseHeaders;
  
  // Generate CSV rows
  const rows = transactions.map(transaction => {
    const baseRow = [
      transaction.transactionId || '',
      transaction.bookingId?.bookingId || '',
      transaction.userId?.name || '',
      transaction.userId?.email || '',
      transaction.type || '',
      transaction.status || '',
      transaction.amount?.gross || 0,
      transaction.amount?.net || 0,
      transaction.amount?.tax || 0,
      transaction.amount?.processingFee || 0,
      transaction.amount?.platformFee || 0,
      transaction.amount?.discount || 0,
      transaction.currency || '',
      transaction.paymentMethod || '',
      transaction.paymentGateway || '',
      transaction.gatewayTransactionId || '',
      transaction.eventId?.title || '',
      transaction.promoCodeId?.code || '',
      transaction.description || '',
      transaction.initiatedAt ? new Date(transaction.initiatedAt).toISOString() : '',
      transaction.processedAt ? new Date(transaction.processedAt).toISOString() : '',
      transaction.completedAt ? new Date(transaction.completedAt).toISOString() : '',
      transaction.isReconciled ? 'Yes' : 'No',
      transaction.reconciledAt ? new Date(transaction.reconciledAt).toISOString() : '',
      transaction.createdAt ? new Date(transaction.createdAt).toISOString() : ''
    ];
    
    const metadataRow = includeMetadata ? [
      transaction.metadata?.ipAddress || '',
      transaction.metadata?.userAgent || '',
      transaction.metadata?.deviceInfo || '',
      transaction.metadata?.location?.country || '',
      transaction.metadata?.location?.state || '',
      transaction.metadata?.location?.city || '',
      transaction.metadata?.riskScore || '',
      (transaction.metadata?.fraudFlags || []).join('|')
    ] : [];
    
    return [...baseRow, ...metadataRow];
  });
  
  // Combine headers and rows into CSV string
  const csvRows = [headers.join(','), ...rows.map(row => row.map(value => {
    // Escape commas, quotes, and newlines
    const str = String(value).replace(/"/g, '""');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str}"`;
    }
    return str;
  }).join(','))];
  
  return csvRows.join('\n');
}

// Helper function to generate Excel-like JSON data
function generateExcelData(transactions: any[], includeMetadata: boolean) {
  const data = transactions.map(transaction => ({
    transactionId: transaction.transactionId || '',
    bookingId: transaction.bookingId?.bookingId || '',
    userName: transaction.userId?.name || '',
    userEmail: transaction.userId?.email || '',
    type: transaction.type || '',
    status: transaction.status || '',
    grossAmount: transaction.amount?.gross || 0,
    netAmount: transaction.amount?.net || 0,
    tax: transaction.amount?.tax || 0,
    processingFee: transaction.amount?.processingFee || 0,
    platformFee: transaction.amount?.platformFee || 0,
    discount: transaction.amount?.discount || 0,
    currency: transaction.currency || '',
    paymentMethod: transaction.paymentMethod || '',
    paymentGateway: transaction.paymentGateway || '',
    gatewayTransactionId: transaction.gatewayTransactionId || '',
    eventTitle: transaction.eventId?.title || '',
    promoCode: transaction.promoCodeId?.code || '',
    description: transaction.description || '',
    initiatedAt: transaction.initiatedAt ? new Date(transaction.initiatedAt).toISOString() : '',
    processedAt: transaction.processedAt ? new Date(transaction.processedAt).toISOString() : '',
    completedAt: transaction.completedAt ? new Date(transaction.completedAt).toISOString() : '',
    isReconciled: !!transaction.isReconciled,
    reconciledAt: transaction.reconciledAt ? new Date(transaction.reconciledAt).toISOString() : '',
    createdAt: transaction.createdAt ? new Date(transaction.createdAt).toISOString() : ''
  }));

  if (includeMetadata) {
    return data.map((row, idx) => ({
      ...row,
      ipAddress: transactions[idx].metadata?.ipAddress || '',
      userAgent: transactions[idx].metadata?.userAgent || '',
      deviceInfo: transactions[idx].metadata?.deviceInfo || '',
      country: transactions[idx].metadata?.location?.country || '',
      state: transactions[idx].metadata?.location?.state || '',
      city: transactions[idx].metadata?.location?.city || '',
      riskScore: transactions[idx].metadata?.riskScore || '',
      fraudFlags: (transactions[idx].metadata?.fraudFlags || []).join('|')
    }));
  }

  return data;
}