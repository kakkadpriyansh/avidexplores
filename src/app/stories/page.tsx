'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StoryCard from '@/components/StoryCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Clock, Calendar, ArrowRight, Filter, Grid, List } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Story {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readTime: number;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  eventId?: {
    _id: string;
    title: string;
    slug: string;
  };
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  likes: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const StoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const categories = ['all', 'TRAVEL', 'ADVENTURE', 'CULTURE', 'FOOD', 'TIPS', 'GUIDE'];
  
  // Fetch stories from API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stories?limit=50&sortBy=publishedAt&sortOrder=desc');
        if (response.ok) {
          const result = await response.json();
          setStories(result.data || []);
        } else {
          setError('Failed to fetch stories');
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);
  
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredStory = stories.find(story => story.isFeatured) || stories[0];
  const trendingStories = stories.filter(story => story.views > 0).sort((a, b) => b.views - a.views).slice(0, 3);
  const recentStories = filteredStories.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Loading State */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Hero Section with Featured Story */}
          <section className="pt-20 pb-12 bg-card">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  Stories That Inspire
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover extraordinary adventures, insider tips, and captivating tales from explorers around the world
                </p>
              </div>
              
              {/* Featured Story */}
              {featuredStory && (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                  <Link href={`/stories/${featuredStory.slug}`}>
                    <div className="relative h-96 md:h-[500px]">
                      <img
                        src={featuredStory.coverImage}
                        alt={featuredStory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-yellow-500 text-yellow-950 dark:text-yellow-50 font-semibold px-4 py-2 text-sm">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Featured Story
                        </Badge>
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="max-w-3xl">
                          <div className="flex items-center space-x-4 mb-4">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                              {featuredStory.category}
                            </Badge>
                            <div className="flex items-center text-white/80 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {featuredStory.readTime} min read
                            </div>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                            {featuredStory.title}
                          </h2>
                          <p className="text-lg text-white/90 mb-6 leading-relaxed">
                            {featuredStory.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={featuredStory.userId.avatar || '/default-avatar.jpg'}
                                alt={featuredStory.userId.name}
                                className="w-12 h-12 rounded-full border-2 border-white/30"
                              />
                        <div>
                          <p className="text-white font-semibold">{featuredStory.userId.name}</p>
                          <p className="text-white/70 text-sm">
                            {new Date(featuredStory.publishedAt || featuredStory.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <Button className="bg-card text-card-foreground hover:bg-muted font-semibold px-6 py-3">
                        Read Story
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
                  </div>
                )}
              </div>
            </section>

          {/* Trending Stories */}
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingStories.map((story, index) => (
                  <Link key={story._id} href={`/stories/${story.slug}`} className="group">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-500 text-red-50 font-semibold">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {story.title}
                        </h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {story.readTime} min
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-8 shadow-lg border">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stories, authors, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 text-lg border-2 border-border focus:border-primary rounded-xl bg-background"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-md"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-md"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200"
                >
                  {category === 'all' ? 'All Stories' : category}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Sort by: Latest</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid/List */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {filteredStories.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-6"
            }>
              {filteredStories.map((story) => (
                <StoryCard 
                  key={story._id} 
                  story={{
                    id: story._id,
                    title: story.title,
                    slug: story.slug,
                    excerpt: story.excerpt,
                    cover: story.coverImage,
                    author: story.userId.name,
                    authorAvatar: story.userId.avatar || '/default-avatar.jpg',
                    date: story.publishedAt || story.createdAt,
                    readTime: story.readTime,
                    tags: story.tags,
                    likes: story.likes.length,
                    views: story.views
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  No stories found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or browse different categories
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default StoriesPage;