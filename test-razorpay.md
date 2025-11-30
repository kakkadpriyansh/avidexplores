# Testing Razorpay Integration

## Prerequisites
1. Make sure the development server is running: `npm run dev`
2. Ensure you have a user account created and logged in
3. Have at least one event with available dates

## Test Steps

### Step 1: Create a Booking
1. Navigate to: http://localhost:3000/events/spiti-valley-roadtrip/book?departureIndex=0
2. Fill in all required participant details:
   - Full Name
   - Age
   - Gender
   - Phone Number
   - Email Address
   - Emergency Contact details
3. Select a month and date
4. Select a transport option
5. Click "Proceed to Payment"
6. You should be redirected to http://localhost:3000/bookings

### Step 2: View Pending Booking
1. On the bookings page, you should see your newly created booking
2. Verify the following:
   - Status badge shows "PENDING" (yellow)
   - Payment Status badge shows "PENDING" (yellow)
   - Payment method ($ icon) should NOT be visible
   - "Pay with Razorpay" button should be visible
   - "Cancel Booking" button should be visible

### Step 3: Initiate Payment
1. Click the "Pay with Razorpay" button
2. Razorpay checkout modal should open
3. Verify pre-filled information:
   - Name should be pre-filled
   - Email should be pre-filled
   - Phone should be pre-filled

### Step 4: Complete Test Payment
Use Razorpay test card details:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: 123
- **Expiry**: Any future date (e.g., 12/25)
- **Cardholder Name**: Test User

Or use other test payment methods:
- **UPI**: success@razorpay
- **Netbanking**: Select any bank and use credentials provided

### Step 5: Verify Payment Success
1. After successful payment, you should see a success toast notification
2. The booking list should automatically refresh
3. Verify the updated booking:
   - Status badge should show "CONFIRMED" (green)
   - Payment Status badge should show "SUCCESS" (green)
   - Payment method should now be visible showing "RAZORPAY" with $ icon
   - "Pay with Razorpay" button should no longer be visible
   - "Cancel Booking" button should no longer be visible

### Step 6: Test Payment Failure (Optional)
1. Create another booking following Step 1
2. Click "Pay with Razorpay"
3. Use failure test card: 4111 1111 1111 1112
4. Payment should fail
5. Booking should remain in PENDING status
6. You can retry payment

## Expected Behavior

### Before Payment
```
Status: PENDING (yellow badge)
Payment Status: PENDING (yellow badge)
Payment Method: Not displayed
Actions: [Pay with Razorpay] [Cancel Booking] [Download Receipt] [Contact Support]
```

### After Successful Payment
```
Status: CONFIRMED (green badge)
Payment Status: SUCCESS (green badge)
Payment Method: $ RAZORPAY (displayed)
Actions: [Download Receipt] [Contact Support]
```

### After Completion
```
Status: COMPLETED (blue badge)
Payment Status: SUCCESS (green badge)
Payment Method: $ RAZORPAY (displayed)
Actions: [Write Review] [Download Receipt] [Contact Support]
```

## Troubleshooting

### Razorpay Modal Not Opening
- Check browser console for errors
- Verify Razorpay script is loaded: Check Network tab for `checkout.js`
- Ensure NEXT_PUBLIC_RAZORPAY_KEY_ID is set in .env.local

### Payment Verification Failed
- Check server logs for signature verification errors
- Verify RAZORPAY_KEY_SECRET is correctly set in .env.local
- Ensure the booking exists and belongs to the logged-in user

### Payment Method Not Showing
- Verify payment was successful
- Check that paymentInfo.paymentMethod is set to 'RAZORPAY' in database
- Refresh the page

### Button Still Shows After Payment
- Check that booking status was updated to 'CONFIRMED'
- Check that paymentInfo.paymentStatus is 'SUCCESS'
- Refresh the bookings page

## Database Verification

You can verify the payment in MongoDB:

```javascript
// Connect to MongoDB
use avid-explores

// Find the booking
db.bookings.findOne({ bookingId: "YOUR_BOOKING_ID" })

// Check these fields:
// - status: should be "CONFIRMED"
// - paymentInfo.paymentStatus: should be "SUCCESS"
// - paymentInfo.paymentMethod: should be "RAZORPAY"
// - paymentInfo.transactionId: should contain Razorpay payment ID
// - paymentInfo.paidAt: should have payment timestamp
```

## API Testing with cURL

### Create Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "bookingId": "YOUR_BOOKING_ID",
    "amount": 10000
  }'
```

### Verify Payment
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx",
    "bookingId": "YOUR_BOOKING_ID"
  }'
```

## Notes
- All test payments are in TEST mode and no real money is charged
- Test credentials are already configured in .env.local
- Payment data is stored in your local MongoDB database
- You can create multiple bookings to test different scenarios
