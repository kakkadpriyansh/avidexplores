'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSettings {
  backgroundImage: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export default function Hero() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    backgroundImage: '/hero-adventure.jpg',
    title: 'Discover Your Next Adventure',
    subtitle: 'From challenging mountain treks to peaceful camping escapes, embark on unforgettable journeys with expert guides and fellow adventurers.',
    ctaText: 'Explore Adventures',
    ctaLink: '/events'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await fetch('/api/settings/hero');
        if (response.ok) {
          const data = await response.json();
          setHeroSettings(data.data);
        } else {
          console.error('Failed to fetch hero settings, using defaults');
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSettings();
  }, []);

  return (
    <section 
      className="relative h-[50vh] flex items-center justify-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {heroSettings.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          {heroSettings.subtitle}
        </p>
        <Link href={heroSettings.ctaLink}>
          <Button size="lg" className="text-lg px-8 py-3">
            {heroSettings.ctaText}
          </Button>
        </Link>
      </div>
    </section>
  );
}