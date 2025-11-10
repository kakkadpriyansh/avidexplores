export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-4 text-center drop-shadow-sm">
          🚚 Shipping Policy
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-4" />
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">For Travel Bookings:</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Upon successful payment, you will receive a booking confirmation email within 24–48 hours.</p>
                <p>• The email will include details of your trip itinerary, inclusions, payment receipt, and reporting instructions.</p>
                <p>• All communication and tickets are delivered electronically — no physical documents are shipped.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">For Merchandise (if applicable):</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Merchandise orders (like t-shirts, badges, stickers, etc.) are usually processed within 3–5 business days after order confirmation.</p>
                <p>• Delivery time depends on your location and courier service, typically within 5–10 working days.</p>
                <p>• You'll receive an email or SMS with tracking details once your order is shipped.</p>
                <p>• Avid Explorers is not responsible for delays caused by courier partners, incorrect addresses, or unforeseen logistical issues.</p>
                <p>• If you do not receive your merchandise within 10 days, please contact us at <a href="mailto:info@avidexplorers.in" className="text-primary hover:underline font-semibold">info@avidexplorers.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
