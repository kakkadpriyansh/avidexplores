import { Star } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: {
    _id: string;
    userId: {
      name: string;
      avatar?: string;
    };
    eventId: {
      title: string;
      location?: string;
    };
    rating: number;
    review: string;
    title?: string;
    customerPhoto?: string;
    customerName?: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="card-glass p-6 text-center max-w-md mx-auto">
      {/* Avatar */}
      <img
        src={testimonial.customerPhoto || testimonial.userId?.avatar || '/placeholder.svg'}
        alt={testimonial.customerName || testimonial.userId?.name || 'User'}
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
                : 'text-muted-foreground/40'
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-card-foreground mb-4 italic">
        "{testimonial.review}"
      </p>

      {/* Name and Event */}
      <div>
        <h4 className="font-montserrat font-semibold text-card-foreground">
          {testimonial.customerName || testimonial.userId?.name || 'Anonymous'}
        </h4>
        <p className="text-sm text-muted-foreground">
          {testimonial.eventId?.title || 'Adventure'} • {testimonial.eventId?.location || 'Location'}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;