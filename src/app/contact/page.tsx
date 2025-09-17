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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Adventure Street', 'Mumbai, Maharashtra 400001', 'India']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 98765 43210', '+91 87654 32109']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['hello@avidexplorers.com', 'bookings@avidexplorers.com']
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
      <section className="pt-24 pb-16 bg-gradient-mountain">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Have questions about our adventures? Ready to book your next trip? 
              We're here to help you plan the perfect adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-montserrat font-bold text-foreground mb-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Adventure Interest
                  </label>
                  <Input
                    type="text"
                    placeholder="Which adventure are you interested in?"
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
              <h2 className="text-3xl font-montserrat font-bold text-foreground mb-6">
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
                          <h3 className="font-montserrat font-semibold text-foreground mb-2">
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

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-xl font-montserrat font-semibold text-foreground">
                  Quick Actions
                </h3>
                <div className="flex flex-col space-y-3">
                  <Button className="btn-adventure justify-start" asChild>
                    <a href="tel:+919876543210">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Us Now
                    </a>
                  </Button>
                  <Button variant="outline" className="btn-outline justify-start" asChild>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp Chat
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-montserrat font-bold text-foreground mb-4">
              Visit Our Office
            </h2>
            <p className="text-muted-foreground">
              Drop by our office to discuss your next adventure in person
            </p>
          </div>
          
          <div className="bg-card rounded-2xl overflow-hidden shadow-card">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Interactive map would be integrated here</p>
                <p className="text-sm">123 Adventure Street, Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}