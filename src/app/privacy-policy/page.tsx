export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-4 text-center drop-shadow-sm">
          🔒 Privacy Policy
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-4" />
        <p className="relative z-10 text-base md:text-md text-[#333] text-center max-w-2xl">
          Your privacy is very important to us. This Privacy Policy explains how Avid Explorers collects, uses, and safeguards your personal information.
        </p>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We may collect personal information such as:</p>
                <div className="pl-4 space-y-2">
                  <p>• Name, email address, and contact number</p>
                  <p>• Emergency contact details</p>
                  <p>• Payment and billing information</p>
                  <p>• Health details (if required for trip safety)</p>
                  <p>• Photographs and feedback</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We use your information to:</p>
                <div className="pl-4 space-y-2">
                  <p>• Confirm bookings and process payments</p>
                  <p>• Communicate important trip details and updates</p>
                  <p>• Improve our services and customer experience</p>
                  <p>• Send promotional offers, newsletters, and updates (you can opt out anytime)</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Protection</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• We use secure, encrypted systems to store and process all personal data.</p>
                <p>• We never sell, trade, or rent your information to any third party.</p>
                <p>• Your data is shared only with trusted service providers (like hotels or transport operators) when necessary to complete your booking.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Our website uses cookies to improve user experience, track analytics, and enhance performance. You can disable cookies anytime from your browser settings.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• You can request correction, deletion, or review of your personal data anytime by emailing us at <a href="mailto:info@avidexplorers.in" className="text-primary hover:underline font-semibold">info@avidexplorers.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
