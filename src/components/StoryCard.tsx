import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Story } from '@/data/mockData';

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  return (
    <div className="card-adventure group">
      {/* Cover Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={story.cover}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-montserrat font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {story.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {story.excerpt}
        </p>

        {/* Author and Meta */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={story.authorAvatar}
            alt={story.author}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-card-foreground">{story.author}</div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{story.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Read More Button */}
        <Link to={`/stories/${story.slug}`}>
          <Button variant="ghost" className="group-hover:text-primary p-0 h-auto font-semibold">
            Read Story
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StoryCard;