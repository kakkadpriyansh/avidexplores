export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-4 text-center drop-shadow-sm">
          🧾 Cancellation &amp; Refund Policy
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-4" />
        <p className="relative z-10 text-base md:text-md text-[#333] text-center max-w-2xl">
          We strive to make our cancellation and refund process as smooth and fair as possible.
        </p>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Trip Cancellations by Participants</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Cancellations made <strong>15 days or more</strong> prior to the trip departure date will be eligible for a <strong>full refund</strong>, minus any transaction or processing fees.</p>
                <p>• Cancellations made between <strong>8 to 14 days</strong> prior to departure will be eligible for a <strong>50% refund</strong> of the total trip cost.</p>
                <p>• Cancellations made <strong>within 7 days</strong> of the trip departure date, or in case of a no-show, will <strong>not be eligible for any refund</strong>.</p>
                <p>• Refunds will be issued through the original mode of payment and may take <strong>7–10 working days</strong> to reflect in your account.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Trip Cancellation by Avid Explorers</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Avid Explorers reserves the right to cancel or postpone any trip due to:</p>
                <div className="pl-4 space-y-2">
                  <p>• Natural calamities (landslides, heavy rains, floods, etc.)</p>
                  <p>• Political unrest or government restrictions</p>
                  <p>• Operational or logistical issues</p>
                  <p>• Low participation (minimum group size not met)</p>
                </div>
                <p className="pt-2">In such cases, participants will be offered:</p>
                <div className="pl-4 space-y-2">
                  <p>• A <strong>100% refund</strong>, or</p>
                  <p>• A transfer to another batch/date or trip, as per their preference.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Refund Exceptions</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>No refund will be provided for:</p>
                <div className="pl-4 space-y-2">
                  <p>• Participants leaving the trip midway due to personal reasons, medical issues, or violation of group rules.</p>
                  <p>• Delays or cancellations caused by external factors such as transportation strikes, weather conditions, or government orders.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. How to Request a Cancellation</h2>
              <p className="text-muted-foreground">
                Please email us at <a href="mailto:info@avidexplorers.in" className="text-primary hover:underline font-semibold">info@avidexplorers.in</a> or contact our customer service team with your booking ID and trip name. Our support team will confirm the cancellation and initiate the refund process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
