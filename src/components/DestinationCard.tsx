import Link from 'next/link';

interface DestinationCardProps {
  name: string;
  image: string;
  subtitle?: string;
  slug?: string;
  link?: string;
}

const DestinationCard = ({ name, image, subtitle, slug, link }: DestinationCardProps) => {
  const content = (
    <div
      className="group w-64 aspect-[3/5] rounded-3xl shadow-xl overflow-hidden relative flex-shrink-0 transform transform-gpu transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.03]"
      style={{ willChange: 'transform' }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 rounded-3xl"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 rounded-3xl bg-[url('data:image/svg+xml,%3Csvg%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2220%22%20cy=%2220%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 pointer-events-none"></div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300 group-hover:translate-y-0">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold leading-tight group-hover:text-blue-300 transition-colors duration-300">
            {name}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-200 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
              {subtitle}
            </p>
          )}
        </div>
        
      </div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 rounded-3xl -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"></div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} aria-label={`Visit ${name}`} className="block">
        {content}
      </Link>
    );
  }

  if (slug) {
    return (
      <Link href={`/events?destination=${slug}`} aria-label={`View events in ${name}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default DestinationCard;