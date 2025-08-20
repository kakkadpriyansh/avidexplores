import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Heart, ArrowRight } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Rajesh Gupta',
      role: 'Founder & Lead Guide',
      experience: '12+ years',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      specialties: ['High Altitude Trekking', 'Mountaineering', 'Wilderness Survival']
    },
    {
      name: 'Priya Sharma',
      role: 'Adventure Coordinator',
      experience: '8+ years',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612-3f?w=300&h=300&fit=crop&crop=face',
      specialties: ['Trip Planning', 'Safety Protocols', 'Group Management']
    },
    {
      name: 'Arjun Singh',
      role: 'Water Sports Expert',
      experience: '10+ years',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      specialties: ['River Rafting', 'Kayaking', 'Water Safety']
    }
  ];

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
      description: 'Our love for adventure and nature drives us to create unforgettable experiences.'
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
              About AvidExplores
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              We are passionate adventurers dedicated to creating safe, unforgettable experiences 
              that connect people with nature and help them discover their own strength.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2016 by a group of passionate mountaineers and adventure enthusiasts, 
                  AvidExplores began as a small community of friends sharing their love for the outdoors.
                </p>
                <p>
                  What started as weekend treks has grown into a full-fledged adventure company 
                  that has helped over 10,000 people discover the joy of outdoor adventures. 
                  We believe that everyone deserves to experience the transformative power of nature.
                </p>
                <p>
                  Today, we offer a wide range of adventures across India, from challenging 
                  Himalayan treks to peaceful camping getaways, all designed to create lasting 
                  memories and build confidence in the great outdoors.
                </p>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop"
                alt="Adventure team"
                className="w-full h-96 object-cover rounded-2xl shadow-adventure"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and every adventure we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-montserrat font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced guides and adventure professionals who are passionate about creating amazing experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card-adventure text-center">
                <div className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-montserrat font-semibold text-card-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">{member.experience}</p>
                  
                  <div className="space-y-1">
                    {member.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="inline-block text-xs bg-muted text-muted-foreground px-2 py-1 rounded mr-1"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-mountain">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of adventurers who have discovered the joy of exploring with AvidExplores
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button className="btn-hero group">
                Browse Adventures
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="btn-outline">
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;