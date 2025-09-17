import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import TransactionLog from '@/models/TransactionLog';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/transactions - Get transaction logs with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication and admin role using NextAuth session
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
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;
    
    // Filters
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
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Amount filters
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    
    // Build filter object
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
    
    // Get transactions
    const transactions = await (TransactionLog as Model<any>).find(filter)
      .populate('userId', 'name email')
      .populate('bookingId', 'bookingId eventId')
      .populate('eventId', 'title slug')
      .populate('promoCodeId', 'code')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reconciledBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await (TransactionLog as Model<any>).countDocuments(filter);
    
    // Get summary statistics for the filtered results
    const summaryStats = await (TransactionLog as Model<any>).aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount.gross' },
          totalNet: { $sum: '$amount.net' },
          totalTax: { $sum: '$amount.tax' },
          totalFees: { $sum: { $add: ['$amount.processingFee', '$amount.platformFee'] } },
          totalDiscount: { $sum: '$amount.discount' },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $in: ['$status', ['failed', 'cancelled']] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0] }
          },
          reconciledTransactions: {
            $sum: { $cond: ['$isReconciled', 1, 0] }
          }
        }
      }
    ]);
    
    // Get payment method breakdown
    const paymentMethodStats = await (TransactionLog as Model<any>).aggregate([
      { $match: { ...filter, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.gross' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summaryStats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        totalNet: 0,
        totalTax: 0,
        totalFees: 0,
        totalDiscount: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        reconciledTransactions: 0
      },
      paymentMethodStats,
      filters: {
        type,
        status,
        paymentMethod,
        currency,
        userId,
        bookingId,
        isReconciled,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        search
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction log (Internal use)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins or system can create transaction logs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Add creator info
    body.createdBy = session.user.id;
    body.updatedBy = session.user.id;
    
    // Create transaction log
    const transaction = new TransactionLog(body);
    await transaction.save();
    
    // Populate references
    await transaction.populate([
      { path: 'userId', select: 'name email' },
      { path: 'bookingId', select: 'bookingId eventId' },
      { path: 'eventId', select: 'title slug' },
      { path: 'promoCodeId', select: 'code' },
      { path: 'createdBy', select: 'name email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Transaction log created successfully',
      data: transaction
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction log:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate transaction ID
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Transaction ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create transaction log' },
      { status: 500 }
    );
  }
}