'use client';

import { useState, useEffect } from 'react';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  _id: string;
  customerName?: string;
  userId?: { name: string };
  customerPhoto?: string;
  images?: string[];
  rating?: number;
  review?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No testimonials available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
            <div className="max-w-4xl mx-auto">
              <TestimonialCard
                name={testimonial.customerName || testimonial?.userId?.name || 'Happy Traveler'}
                avatar={testimonial.customerPhoto || (testimonial.images?.[0] || '/default-avatar.png')}
                rating={testimonial.rating || 5}
                review={testimonial.review || ''}
              />
            </div>
          </div>
        ))}
      </div>
      
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialCarousel;