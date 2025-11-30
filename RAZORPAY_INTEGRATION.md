# Razorpay Payment Integration

## Overview
Razorpay payment gateway has been integrated into the bookings page, allowing users to complete payments for their pending bookings.

## Changes Made

### 1. Environment Variables (.env.local)
- Added Razorpay test credentials:
  - `RAZORPAY_KEY_ID=rzp_test_RiJUS1wq4Lm1iA`
  - `RAZORPAY_KEY_SECRET=ONcZer33M16GfIvR61ZbjEgf`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RiJUS1wq4Lm1iA`

### 2. Bookings Page (src/app/bookings/page.tsx)
- Added Razorpay script loading in useEffect
- Added `processingPayment` state to track payment processing
- Added `handleRazorpayPayment` function to initiate Razorpay checkout
- Updated payment method display to only show when payment method is not 'PENDING'
- Added "Pay with Razorpay" button for pending bookings with pending payment status
- Integrated payment verification flow

### 3. Layout (src/app/layout.tsx)
- Added Razorpay checkout script to the head for global availability

### 4. Booking API (src/app/api/bookings/route.ts)
- Changed initial payment method from 'RAZORPAY' to 'PENDING'
- Payment method will be updated to 'RAZORPAY' only after successful payment

## Payment Flow

1. **Booking Creation**: When a user creates a booking, it's saved with:
   - Status: `PENDING`
   - Payment Status: `PENDING`
   - Payment Method: `PENDING`

2. **Payment Initiation**: On the bookings page, users see a "Pay with Razorpay" button for pending bookings
   - Clicking the button calls `/api/payment/create-order`
   - Creates a Razorpay order with booking details

3. **Razorpay Checkout**: Opens Razorpay payment modal with:
   - Order details
   - Pre-filled user information
   - Multiple payment options (cards, UPI, netbanking, etc.)

4. **Payment Verification**: After successful payment:
   - Razorpay returns payment details
   - Frontend calls `/api/payment/verify` with signature verification
   - Backend verifies the payment signature
   - Updates booking status to `CONFIRMED`
   - Updates payment status to `SUCCESS`
   - Updates payment method to `RAZORPAY`

5. **Confirmation**: User sees success toast and booking list refreshes

## API Endpoints

### POST /api/payment/create-order
Creates a Razorpay order for a booking
- **Input**: `{ bookingId, amount }`
- **Output**: `{ success, id, amount, currency, receipt }`

### POST /api/payment/verify
Verifies Razorpay payment signature
- **Input**: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }`
- **Output**: `{ success, message, booking }`

## Testing

### Test Credentials
- Key ID: `rzp_test_RiJUS1wq4Lm1iA`
- Key Secret: `ONcZer33M16GfIvR61ZbjEgf`

### Test Cards
Razorpay provides test cards for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1112
- CVV: Any 3 digits
- Expiry: Any future date

### Test Flow
1. Navigate to http://localhost:3000/events/spiti-valley-roadtrip/book?departureIndex=0
2. Fill in participant details
3. Click "Proceed to Payment"
4. You'll be redirected to http://localhost:3000/bookings
5. Find your pending booking
6. Click "Pay with Razorpay" button
7. Use test card details to complete payment
8. Verify booking status changes to CONFIRMED

## Display Logic

### Payment Method Display
- Only shows payment method (with $ icon) when `paymentMethod !== 'PENDING'`
- For pending bookings, payment method is not displayed
- After successful Razorpay payment, shows "RAZORPAY" with $ icon

### Payment Button
- "Pay with Razorpay" button appears only when:
  - Booking status is `PENDING`
  - Payment status is `PENDING`
- Button is disabled during payment processing
- Shows "Processing..." text while payment is in progress

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256 signature
2. **User Authentication**: Only authenticated users can create orders and verify payments
3. **Booking Ownership**: Users can only pay for their own bookings
4. **Server-side Validation**: All payment verification happens on the server

## Production Deployment

Before deploying to production:

1. Replace test credentials with live credentials in `.env.production`:
   ```
   RAZORPAY_KEY_ID=your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_live_key_id
   ```

2. Enable webhooks in Razorpay dashboard for:
   - Payment success
   - Payment failure
   - Refunds

3. Test thoroughly with live credentials in staging environment

4. Set up proper error logging and monitoring

## Support

For issues or questions:
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
