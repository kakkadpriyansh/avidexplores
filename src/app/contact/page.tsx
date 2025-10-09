'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    adventureInterest: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        });
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          adventureInterest: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: [
        'Nakshatra -8, 704, Sadhu Vasvani Rd',
        'Indian Park, Rajkot, Gujarat 360005',
        'India',
        <a href="https://maps.app.goo.gl/dnu32o4nsHkHrWXr7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View on Map</a>
      ]
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 88665 52400']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@avidexplorers.in']
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: 10:00 AM - 6:00 PM']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="relative w-full pt-20 pb-6 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]">
        <h2 className="relative z-10 text-3xl md:text-4xl font-extrabold text-[#B71C1C] mb-1 text-center drop-shadow-sm">
          Get In Touch
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-2" />
        <p className="relative z-10 text-base md:text-lg text-[#333] text-center max-w-2xl">
          Ready to book or have questions? We're here to help.
        </p>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-product-sans font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Adventure Interest
                  </label>
                  <Input
                    type="text"
                    placeholder="Which adventure are you interested in?"
                    value={formData.adventureInterest}
                    onChange={(e) => setFormData({...formData, adventureInterest: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    required
                    rows={6}
                    placeholder="Tell us about your adventure preferences, questions, or special requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-hero w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-3xl font-product-sans font-bold text-foreground mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-adventure">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-product-sans font-semibold text-foreground mb-2">
                            {info.title}
                          </h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-product-sans font-bold text-foreground mb-4">
              Visit Our Office
            </h2>
            <p className="text-muted-foreground mb-4">
              Drop by our office to discuss your next adventure in person
            </p>
            <a href="https://maps.app.goo.gl/dnu32o4nsHkHrWXr7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              View on Google Maps
            </a>
          </div>
          
          <div className="bg-card rounded-2xl overflow-hidden shadow-card">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5008724056406!2d70.75889609999999!3d22.29688939999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cb780cbc7991%3A0x4d30206cf885f8b!2sAvid%20Explorers!5e0!3m2!1sen!2sin!4v1758803858396!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-96"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}