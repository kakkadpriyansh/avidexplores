interface TestimonialCardProps {
  name: string;
  avatar: string;
  rating: number;
  review: string;
}

const TestimonialCard = ({ name, avatar, rating, review }: TestimonialCardProps) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-white/90 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20"></div>
      </div>
      
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 text-blue-200 group-hover:text-blue-300 transition-colors duration-300">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Stars */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 transition-colors duration-300 ${
                i < rating 
                  ? 'text-yellow-400 group-hover:text-yellow-500' 
                  : 'text-gray-200 group-hover:text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Review Text */}
        <p className="text-gray-700 leading-relaxed text-lg font-medium group-hover:text-gray-800 transition-colors duration-300">
          "{review}"
        </p>

        {/* User Info */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg transform transition-transform duration-300 group-hover:scale-105"
            />
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
              {name}
            </h4>
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
              Verified Traveler
            </p>
          </div>
        </div>
      </div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
    </div>
  );
};

export default TestimonialCard;