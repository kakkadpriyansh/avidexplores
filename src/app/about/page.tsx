import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Users, Award, Heart, ArrowRight } from 'lucide-react';

async function getTeamMembers() {
  try {
    // Use INTERNAL_API_URL for server-side calls to avoid DNS issues
    const base = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const url = `${base}/api/teams`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (e) {
    console.error('Failed to load team members', e);
    return [];
  }
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Every adventure is planned with comprehensive safety protocols and emergency procedures.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We believe in building a community of like-minded adventurers who support each other.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our adventures, from planning to execution.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our passion for adventure drives us to create unforgettable experiences for every traveler.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-mountain">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              About Avid Explores
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Passionate about creating unforgettable adventures and connecting people with nature
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Founded in 2012 by a group of passionate adventurers, Avid Explores began as a small collective 
                  of friends who shared a love for the great outdoors. What started as weekend trips to nearby 
                  mountains has grown into one of India's most trusted adventure travel companies.
                </p>
                <p className="text-muted-foreground mb-4">
                  Over the years, we've guided thousands of adventurers through some of the most breathtaking 
                  landscapes in India and beyond. From the snow-capped peaks of the Himalayas to the pristine 
                  beaches of Goa, we've made it our mission to showcase the incredible diversity of our planet.
                </p>
                <p className="text-muted-foreground">
                  Today, we continue to operate with the same passion and dedication that inspired our founding, 
                  always putting safety, sustainability, and unforgettable experiences at the heart of everything we do.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop" 
                  alt="Adventure team" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide every decision we make and every adventure we create
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our experienced guides and coordinators are passionate about adventure and committed to your safety
            </p>
          </div>
          {teamMembers.length === 0 ? (
            <div className="text-center text-muted-foreground">No team members available yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member: any, index: number) => (
                <div key={member._id || index} className="card-glass text-center">
                  <img 
                    src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
                  />
                  <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  {member.experience && (
                    <p className="text-sm text-muted-foreground mb-4">{member.experience} experience</p>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {/* {(member.specialties || []).map((specialty: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {specialty}
                      </span>
                    ))} */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              To inspire and enable people to explore the world's most beautiful places while fostering 
              a deep respect for nature and local communities. We believe that adventure travel should be 
              accessible, safe, and transformative for everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Adventures Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5000+</div>
                <p className="text-muted-foreground">Happy Adventurers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">12+</div>
                <p className="text-muted-foreground">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 text-muted-foreground">Join our community of adventurers and discover what you're capable of.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" variant="default" className="group">
                Browse Adventures
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}