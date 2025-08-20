import { Link } from 'react-router-dom';

interface DestinationCardProps {
  name: string;
  image: string;
  subtitle?: string;
  slug?: string;
}

const DestinationCard = ({ name, image, subtitle, slug }: DestinationCardProps) => {
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

  if (slug) {
    return (
      <Link to={`/events?destination=${slug}`} aria-label={`View events in ${name}`}>
        {content}
      </Link>
    );
  }

  return content;
};

export default DestinationCard;