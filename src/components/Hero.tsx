'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSettings {
  backgroundImage: string;
  backgroundImages: string[];
  title: string;
  titleColor: string;
  subtitle: string;
  subtitleColor: string;
  ctaText: string;
  ctaLink: string;
}

export default function Hero() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    backgroundImage: '/hero-adventure.jpg',
    backgroundImages: [],
    title: 'Discover Your Next Adventure',
    titleColor: '#ffffff',
    subtitle: 'From challenging mountain treks to peaceful camping escapes, embark on unforgettable journeys with expert guides and fellow adventurers.',
    subtitleColor: '#e5e7eb',
    ctaText: 'Explore Adventures',
    ctaLink: '/events'
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await fetch('/api/settings/hero');
        if (response.ok) {
          const data = await response.json();
          setHeroSettings(data.data);
        }``
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchHeroSettings();
  }, []);

  useEffect(() => {
    const images = heroSettings.backgroundImages.length > 0 ? heroSettings.backgroundImages : [heroSettings.backgroundImage];
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [heroSettings.backgroundImages, heroSettings.backgroundImage]);

  const images = heroSettings.backgroundImages.length > 0 ? heroSettings.backgroundImages : [heroSettings.backgroundImage];

  return (
    <section className="relative min-h-[40vh] md:min-h-[40vh] lg:min-h-[40vh] xl:min-h-[50vh] flex items-end justify-center text-white overflow-hidden">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: idx === currentImageIndex ? 1 : 0,
            zIndex: idx === currentImageIndex ? 1 : 0
          }}
        />
      ))}

      {images.length > 1 && (
        <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 pb-4 sm:pb-8 md:pb-12 lg:pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6" style={{ color: heroSettings.titleColor }}>
          {heroSettings.title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8" style={{ color: heroSettings.subtitleColor }}>
          {heroSettings.subtitle}
        </p>
        <Link href={heroSettings.ctaLink}>
          <Button size="default" className="text-base px-6 py-2">
            {heroSettings.ctaText}
          </Button>
        </Link>
      </div>
    </section>
  );
}