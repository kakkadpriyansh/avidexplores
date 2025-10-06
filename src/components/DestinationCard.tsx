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
      className="group relative z-0 w-48 md:w-56 aspect-[257.5/391.4] rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:z-20 hover:ring-black/10"
      style={{ willChange: 'transform' }}
    >
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Overlay: subtle at top, stronger at bottom for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/60" />

      {/* Title at top like the reference card */}
      <div className="absolute top-0 left-0 right-0 p-3 text-white pointer-events-none">
        <h2 className="text-lg md:text-xl font-bold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          {name}
        </h2>
        {subtitle && (
          <p className="text-xs text-white/80 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom shine bar for nicer hover accent */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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