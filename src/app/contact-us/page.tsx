export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-6 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-1 text-center drop-shadow-sm">
          📞 Contact Us
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-2" />
        <p className="relative z-10 text-base md:text-lg text-[#333] text-center max-w-2xl">
          We'd love to hear from you! If you have any questions, feedback, or support requests, reach out to us:
        </p>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-8">Avid Explorers</h3>
            </div>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <p className="mb-2">✉️ <strong className="text-foreground">Email:</strong> <a href="mailto:info@avidexplorers.in" className="text-primary hover:underline">info@avidexplorers.in</a></p>
              </div>

              <div>
                <p className="mb-2">📞 <strong className="text-foreground">Phone/WhatsApp:</strong> <a href="tel:+918866552400" className="text-primary hover:underline">+91 88665 52400</a></p>
              </div>

              <div>
                <p className="mb-2">🌐 <strong className="text-foreground">Website:</strong> <a href="https://www.avidexplorers.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.avidexplorers.in</a></p>
              </div>

              <div>
                <p className="mb-2">🏢 <strong className="text-foreground">Address:</strong> Rajkot, Gujarat, India</p>
              </div>

              <div className="pt-6 border-t">
                <p>Our customer support team is available <strong className="text-foreground">Monday to Saturday, 10:00 AM – 6:00 PM</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
