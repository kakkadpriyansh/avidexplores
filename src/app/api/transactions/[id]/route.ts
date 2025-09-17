import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TransactionLog from '@/models/TransactionLog';
import { Model } from 'mongoose';

// GET /api/transactions/[id] - Get transaction by ID (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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

    const { id } = params;

    // Find transaction by ID
    const transaction = await (TransactionLog as Model<any>).findById(id)
      .populate('userId', 'name email phone')
      .populate('bookingId', 'bookingId status totalAmount')
      .populate('eventId', 'title slug price')
      .populate('promoCodeId', 'code discountType discountValue')
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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

    const { id } = params;
    const body = await request.json();

    // Find existing transaction
    const existingTransaction = await (TransactionLog as Model<any>).findById(id);
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Define updatable fields (limited for security)
    const updatableFields = [
      'status',
      'description',
      'isReconciled',
      'reconciledAt',
      'reconciledBy',
      'notes',
      'tags',
      'metadata.internalNotes',
      'metadata.adminFlags'
    ];

    const updateData: any = {};

    // Only allow updates to specific fields
    updatableFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields
        const [parent, child] = field.split('.');
        if (body[parent] && body[parent][child] !== undefined) {
          if (!updateData[parent]) updateData[parent] = {};
          updateData[parent][child] = body[parent][child];
        }
      } else {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
    });

    // Special handling for status changes
    if (updateData.status && updateData.status !== existingTransaction.status) {
      const now = new Date();
      
      switch (updateData.status) {
        case 'PROCESSING':
          updateData.processedAt = now;
          break;
        case 'COMPLETED':
        case 'SUCCESS':
          updateData.completedAt = now;
          if (!existingTransaction.processedAt) {
            updateData.processedAt = now;
          }
          break;
        case 'FAILED':
        case 'CANCELLED':
          updateData.failedAt = now;
          break;
      }
    }

    // Handle reconciliation
    if (updateData.isReconciled === true && !existingTransaction.isReconciled) {
      updateData.reconciledAt = new Date();
      updateData.reconciledBy = session.user.id;
    } else if (updateData.isReconciled === false && existingTransaction.isReconciled) {
      updateData.reconciledAt = null;
      updateData.reconciledBy = null;
    }

    // Add audit trail
    const auditEntry = {
      action: 'UPDATE',
      performedBy: session.user.id,
      performedAt: new Date(),
      changes: updateData,
      reason: body.auditReason || 'Manual update by admin'
    };

    updateData.$push = {
      auditTrail: auditEntry
    };

    // Update transaction
    const updatedTransaction = await (TransactionLog as Model<any>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone')
      .populate('bookingId', 'bookingId status totalAmount')
      .populate('eventId', 'title slug price')
      .populate('promoCodeId', 'code discountType discountValue')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction (Admin only, with restrictions)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const reason = searchParams.get('reason') || 'Deleted by admin';

    // Find transaction
    const transaction = await (TransactionLog as Model<any>).findById(id);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if transaction can be deleted
    const canDelete = (
      transaction.status === 'PENDING' ||
      transaction.status === 'FAILED' ||
      transaction.status === 'CANCELLED' ||
      force
    );

    if (!canDelete) {
      return NextResponse.json({
        error: 'Cannot delete completed or processing transactions without force flag',
        suggestion: 'Use ?force=true to force delete, or update status instead'
      }, { status: 400 });
    }

    // For successful transactions, require additional confirmation
    if (transaction.status === 'SUCCESS' || transaction.status === 'COMPLETED') {
      if (!force) {
        return NextResponse.json({
          error: 'Cannot delete successful transactions without force flag',
          warning: 'This may affect financial reconciliation',
          suggestion: 'Use ?force=true&reason=<reason> to force delete'
        }, { status: 400 });
      }
    }

    // Add final audit entry before deletion
    const auditEntry = {
      action: 'DELETE',
      performedBy: session.user.id,
      performedAt: new Date(),
      reason: reason,
      transactionSnapshot: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        type: transaction.type
      }
    };

    await (TransactionLog as Model<any>).findByIdAndUpdate(id, {
      $push: { auditTrail: auditEntry }
    });

    // Delete transaction
    await (TransactionLog as Model<any>).findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      deletedTransaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}