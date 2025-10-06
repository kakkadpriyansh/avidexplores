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
      className="group relative w-64 aspect-[3/5] rounded-3xl overflow-hidden flex-shrink-0 shadow-xl hover:shadow-2xl transform-gpu transition-transform duration-500 hover:-translate-y-2"
      style={{ willChange: 'transform' }}
    >
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h2 className="text-xl md:text-2xl font-bold leading-tight">
          {name}
        </h2>
        {subtitle && (
          <p className="text-xs md:text-sm text-white/80 mt-1">
            {subtitle}
          </p>
        )}
      </div>
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