'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User, Eye, Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface FlexibleStory {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  image?: string;
  tags: string[];
  readTime: number;
  userId?: {
    name: string;
    avatar?: string;
  };
  author?: string;
  publishedAt?: string;
  createdAt?: string;
  date?: string;
  views?: number;
  likes?: string[];
}

interface StoryCardProps {
  story: FlexibleStory;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(50);
  const [viewCount, setViewCount] = useState(100);
  const [commentCount, setCommentCount] = useState(5);
  
  // Generate random engagement metrics for demo (client-side only)
  useEffect(() => {
    setLikeCount(Math.floor(Math.random() * 200) + 50);
    setViewCount(Math.floor(Math.random() * 5000) + 100);
    setCommentCount(Math.floor(Math.random() * 50) + 5);
  }, []);
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.excerpt,
        url: window.location.origin + `/stories/${story.slug}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/stories/${story.slug}`);
      // You could show a toast notification here
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden border border-border hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative overflow-hidden h-56">
        <img
          src={story.coverImage || story.image || '/placeholder-story.jpg'}
          alt={story.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Floating Read Time Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 text-sm font-medium text-card-foreground border border-border/50">
            <Clock className="h-3 w-3" />
            <span>{story.readTime} min</span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/90 text-primary-foreground border-0 hover:bg-primary">
            {story.tags[0]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
          {story.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {story.excerpt}
        </p>

        {/* Author and Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={story.userId?.avatar || '/placeholder.svg'}
                alt={story.userId?.name || 'Author'}
                loading="lazy"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{story.userId?.name || story.author || 'Anonymous'}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(story.publishedAt || story.createdAt || story.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          {/* Engagement Stats */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
            <button 
              onClick={handleLike}
              aria-label={isLiked ? 'Unlike story' : 'Like story'}
              title={isLiked ? 'Unlike story' : 'Like story'}
              className={`flex items-center space-x-1 transition-colors hover:text-red-500 ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{commentCount}</span>
            </div>
            <button 
              onClick={handleShare}
              aria-label="Share story"
              title="Share story"
              className="flex items-center space-x-1 transition-colors hover:text-blue-500"
            >
              <Share2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {story.tags.slice(1, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Read More Button */}
        <Link href={`/stories/${story.slug}`} className="block">
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg">
            <span className="flex items-center justify-center">
              Read Full Story
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StoryCard;