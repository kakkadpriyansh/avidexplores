import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';

// POST /api/payment/webhook - Handle Razorpay webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    await connectDB();

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      case 'payment.dispute.created':
        await handlePaymentDispute(event.payload.dispute.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment capture
async function handlePaymentCaptured(payment: any) {
  try {
    const { id: paymentId, order_id: orderId, amount, status } = payment;
    
    // Find booking by order ID (stored in razorpayOrderId)
    const booking = await (Booking as Model<IBooking>).findOne({
      'paymentInfo.razorpayOrderId': orderId
    });

    if (!booking) {
      console.error('Booking not found for order:', orderId);
      return;
    }

    // Update booking with payment success
    await (Booking as Model<IBooking>).findByIdAndUpdate(booking._id, {
      'paymentInfo.paymentStatus': 'SUCCESS',
      'paymentInfo.paymentId': paymentId,
      'paymentInfo.transactionId': paymentId,
      'paymentInfo.paidAt': new Date(),
      status: 'CONFIRMED',
      confirmationSent: false // Will trigger email notification
    });

    console.log(`Payment captured for booking ${booking.bookingId}:`, paymentId);
    
    // Update confirmation sent flag
      booking.confirmationSent = true;
      await booking.save();
      
      // TODO: Send confirmation email to user
      // TODO: Send notification to admin
      console.log(`Payment confirmed for booking: ${booking.bookingId}`);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(payment: any) {
  try {
    const { id: paymentId, order_id: orderId, error_code, error_description } = payment;
    
    // Find booking by order ID
    const booking = await (Booking as Model<IBooking>).findOne({
      'paymentInfo.razorpayOrderId': orderId
    });

    if (!booking) {
      console.error('Booking not found for failed payment:', orderId);
      return;
    }

    // Update booking with payment failure
    await (Booking as Model<IBooking>).findByIdAndUpdate(booking._id, {
      'paymentInfo.paymentStatus': 'FAILED',
      'paymentInfo.paymentId': paymentId,
      'paymentInfo.failureReason': `${error_code}: ${error_description}`,
      status: 'PENDING' // Keep as pending for retry
    });

    console.log(`Payment failed for booking ${booking.bookingId}:`, error_description);
    
    // TODO: Send payment failed email to user
      // TODO: Send notification to admin
      console.log(`Payment failed for booking: ${booking.bookingId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle order paid (backup for payment captured)
async function handleOrderPaid(order: any) {
  try {
    const { id: orderId, amount_paid, status } = order;
    
    // Find booking by order ID
    const booking = await (Booking as Model<IBooking>).findOne({
      'paymentInfo.razorpayOrderId': orderId
    });

    if (!booking) {
      console.error('Booking not found for paid order:', orderId);
      return;
    }

    // Only update if not already confirmed
    if (booking.paymentInfo.paymentStatus !== 'SUCCESS') {
      await (Booking as Model<IBooking>).findByIdAndUpdate(booking._id, {
        'paymentInfo.paymentStatus': 'SUCCESS',
        'paymentInfo.paidAt': new Date(),
        status: 'CONFIRMED',
        confirmationSent: false
      });

      console.log(`Order paid for booking ${booking.bookingId}:`, orderId);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

// Handle payment dispute
async function handlePaymentDispute(dispute: any) {
  try {
    const { payment_id: paymentId, amount, reason_code } = dispute;
    
    // Find booking by payment ID
    const booking = await (Booking as Model<IBooking>).findOne({
      'paymentInfo.paymentId': paymentId
    });

    if (!booking) {
      console.error('Booking not found for disputed payment:', paymentId);
      return;
    }

    // Add dispute information to booking
    await (Booking as Model<IBooking>).findByIdAndUpdate(booking._id, {
      'paymentInfo.disputeInfo': {
        disputeId: dispute.id,
        amount: amount,
        reasonCode: reason_code,
        createdAt: new Date()
      }
    });

    console.log(`Payment dispute created for booking ${booking.bookingId}:`, dispute.id);
    
    // TODO: Send notification to admin about dispute
      console.log(`Payment dispute created for booking: ${booking.bookingId}`);
  } catch (error) {
    console.error('Error handling payment dispute:', error);
  }
}

// Verify webhook signature (utility function)
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}