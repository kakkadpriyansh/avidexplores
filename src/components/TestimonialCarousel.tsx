'use client';

import { useEffect, useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || testimonials.length === 0) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    const resetPoint = scrollContainer.scrollWidth / 3;

    const scroll = () => {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= resetPoint) {
        scrollAmount = 0;
      }
      scrollContainer.style.transform = `translateX(-${scrollAmount}px)`;
      requestAnimationFrame(scroll);
    };

    const animation = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animation);
  }, [testimonials]);

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No testimonials available at the moment.</p>
      </div>
    );
  }

  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-4 px-4 will-change-transform">
        {duplicatedTestimonials.map((testimonial, index) => (
          <div key={`${testimonial._id}-${index}`} className="w-[300px] flex-shrink-0">
            <TestimonialCard
              name={testimonial.customerName || testimonial?.userId?.name || 'Happy Traveler'}
              avatar={testimonial.customerPhoto || (testimonial.images?.[0] || '/default-avatar.png')}
              rating={testimonial.rating || 5}
              review={testimonial.review || ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
