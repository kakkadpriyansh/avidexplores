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
    <div className="w-52 h-72 rounded-2xl shadow-lg overflow-hidden relative flex-shrink-0">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
      />
      <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
        <h2 className="text-xl font-bold">{name}</h2>
        {subtitle && <p className="text-sm">{subtitle}</p>}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} aria-label={`Visit ${name}`}>
        {content}
      </Link>
    );
  }

  if (slug) {
    return (
      <Link href={`/events?destination=${slug}`} aria-label={`View events in ${name}`}>
        {content}
      </Link>
    );
  }

  return content;
};

export default DestinationCard;