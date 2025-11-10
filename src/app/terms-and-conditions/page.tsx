export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-4 text-center drop-shadow-sm">
          ⚖️ Terms and Conditions
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-4" />
        <p className="relative z-10 text-base md:text-md text-[#333] text-center max-w-2xl">
          Welcome to Avid Explorers! By booking any trip, trek, or experience with us, you agree to abide by the following terms and conditions.
        </p>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. General Terms</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• All bookings made through our website, phone, or authorized agents are considered final only after receiving full or partial payment.</p>
                <p>• The participant must be at least 18 years old to make a booking. Minors must be accompanied by a parent or legal guardian.</p>
                <p>• The itinerary provided on our website or brochure is subject to change depending on weather conditions, roadblocks, or other unforeseen situations.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Health and Safety</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Treks and adventures involve physical exertion. Participants are responsible for ensuring that they are medically fit and capable of undertaking the activity.</p>
                <p>• Any medical condition must be disclosed to our team in advance.</p>
                <p>• Our guides and trek leaders have full authority to deny participation to anyone deemed unfit for the activity for safety reasons.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Travel and Insurance</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Travel insurance is highly recommended for all participants.</p>
                <p>• Avid Explorers is not responsible for loss, injury, or damage to any person or property arising from events beyond our control, including accidents, theft, or natural disasters.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Code of Conduct</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Participants are expected to follow the instructions of trek leaders and guides.</p>
                <p>• Any behavior deemed disrespectful, harmful, or unsafe will lead to immediate expulsion from the trip without refund.</p>
                <p>• Littering, alcohol, drugs, or disrespecting local culture and environment are strictly prohibited.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Photography &amp; Media Use</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• By participating in Avid Explorers trips, you grant us permission to use photos and videos taken during the event for promotional or social media purposes, unless you notify us otherwise in writing.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Liability Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Avid Explorers and its representatives shall not be held liable for any accident, delay, loss, injury, or damage that occurs during the trip due to factors beyond our control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
