import { Star } from 'lucide-react';
import { Testimonial } from '@/data/mockData';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="card-glass p-6 text-center max-w-md mx-auto">
      {/* Avatar */}
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
      />

      {/* Rating */}
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? 'text-secondary fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-card-foreground mb-4 italic">
        "{testimonial.text}"
      </p>

      {/* Name and Event */}
      <div>
        <h4 className="font-montserrat font-semibold text-card-foreground">
          {testimonial.name}
        </h4>
        <p className="text-sm text-muted-foreground">
          {testimonial.event} • {testimonial.location}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;