'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockStories } from '@/data/mockData';
import { Calendar, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StoryDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  
  const story = mockStories.find(s => s.slug === slug);
  const relatedStories = mockStories.filter(s => s.slug !== slug).slice(0, 3);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-product-sans font-bold">Story not found</h1>
          <Link href="/stories">
            <Button className="mt-4 btn-adventure">Back to Stories</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Story link has been copied to your clipboard.",
    });
  };

  // Enhanced story content based on the story
  const getStoryContent = (storySlug: string) => {
    switch (storySlug) {
      case 'conquering-the-peaks':
        return {
          content: `
            <p>The mountains have always called to me, but this trek was different. Standing at the base of the towering peaks, I realized this wasn't just about reaching a destination—it was about discovering who I truly was.</p>
            
            <h3>The Journey Begins</h3>
            <p>Our group of eight adventurers started the ascent at dawn, the morning mist creating an ethereal atmosphere around us. Each step took us further away from the familiar and deeper into the unknown.</p>
            
            <p>The first day was deceptively easy. Rolling hills and gentle slopes lulled us into a false sense of security. But as we climbed higher, the terrain became more challenging, and so did the lessons the mountains had to teach us.</p>
            
            <h3>Facing the Challenge</h3>
            <p>By day three, we were above the tree line. The air was thin, every breath a conscious effort. It was here that I learned my first lesson: respect the mountain, and it will respect you back.</p>
            
            <p>Our guide, Tenzing, a local with decades of experience, shared stories of the peaks while we rested. "The mountain doesn't care about your schedule," he said, pointing to the clouds gathering around the summit. "It teaches you patience."</p>
            
            <h3>The Summit Push</h3>
            <p>The final ascent began at 3 AM. In the darkness, with only our headlamps to guide us, we climbed in single file. The silence was profound, broken only by the crunch of snow under our boots and our measured breathing.</p>
            
            <p>As the sun rose, painting the peaks in shades of gold and pink, I understood why people become addicted to high places. There's something transformative about being so close to the sky.</p>
            
            <h3>The Descent and Reflection</h3>
            <p>Reaching the summit was euphoric, but the descent taught me the most valuable lesson of all. Going down is often harder than going up—in mountains and in life. It requires a different kind of strength, a different kind of focus.</p>
            
            <p>This trek changed my perspective on challenges. Every obstacle now seems surmountable when I remember standing on that peak, knowing I had pushed beyond what I thought possible.</p>
            
            <p>The mountains don't just test your physical limits; they reveal your mental strength. They strip away pretenses and show you who you really are. And sometimes, that person is stronger than you ever imagined.</p>
          `,
          images: [
            {
              src: 'https://images.unsplash.com/photo-1464822759506-4b2e6ea6a3de?w=800&h=500&fit=crop',
              alt: 'Mountain range at sunrise',
              caption: 'The breathtaking sunrise view from our base camp'
            },
            {
              src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=500&fit=crop',
              alt: 'Hikers on mountain trail',
              caption: 'Our team making the final summit push'
            },
            {
              src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
              alt: 'Mountain summit view',
              caption: 'The rewarding view from the summit - all struggles were worth this moment'
            }
          ]
        };
      case 'family-adventure-guide':
        return {
          content: `
            <p>Planning outdoor adventures with family requires careful consideration, but the rewards are immeasurable. Here's everything I've learned from years of exploring with kids.</p>
            
            <h3>Start Small, Dream Big</h3>
            <p>Your first family adventure doesn't need to be a week-long expedition. Start with day hikes, local camping trips, or even backyard adventures. Build confidence and interest gradually.</p>
            
            <h3>Essential Tips for Success</h3>
            <p>• Choose age-appropriate activities<br>
            • Pack extra snacks (and patience)<br>
            • Plan for shorter distances and longer breaks<br>
            • Bring entertainment for downtime<br>
            • Make safety the top priority</p>
            
            <h3>Making Memories</h3>
            <p>The best family adventures aren't about the destination—they're about the shared experiences, the challenges overcome together, and the stories you'll tell for years to come.</p>
          `,
          images: [
            {
              src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
              alt: 'Family hiking together',
              caption: 'Making memories on the trail with the whole family'
            },
            {
              src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop',
              alt: 'Kids camping',
              caption: 'Teaching the next generation to love the outdoors'
            }
          ]
        };
      case 'monsoon-trekking-safety':
        return {
          content: `
            <p>Monsoon trekking can be magical, but it requires extra precautions and careful planning. The transformed landscape offers unique beauty, but also presents specific challenges.</p>
            
            <h3>Weather Considerations</h3>
            <p>During monsoon season, weather can change rapidly. Always check forecasts, have evacuation plans, and never underestimate the power of mountain weather.</p>
            
            <h3>Essential Safety Gear</h3>
            <p>• Waterproof jackets and pants<br>
            • Quick-dry clothing<br>
            • Waterproof boots with good grip<br>
            • Emergency shelter<br>
            • First aid kit with extra supplies</p>
            
            <h3>Trail Safety</h3>
            <p>Wet trails can be treacherous. Take your time, use trekking poles, and don't hesitate to turn back if conditions become dangerous.</p>
          `,
          images: [
            {
              src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=500&fit=crop',
              alt: 'Monsoon landscape',
              caption: 'The dramatic beauty of monsoon season in the mountains'
            }
          ]
        };
      default:
        return { content: story.content, images: [] };
    }
  };

  const storyData = getStoryContent(story.slug);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Story Header */}
      <article className="pt-24">
        {/* Cover Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={story.cover}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-8 left-4">
            <Link href="/stories">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-product-sans font-bold text-foreground mb-6">
                {story.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={story.authorAvatar}
                    alt={story.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-product-sans font-semibold text-foreground">
                      {story.author}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </header>

            {/* Story Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-lg text-muted-foreground mb-8 font-medium">
                {story.excerpt}
              </div>
              
              {/* Story Images and Content */}
              <div className="space-y-8">
                {storyData.images[0] && (
                  <figure className="my-8">
                    <img
                      src={storyData.images[0].src}
                      alt={storyData.images[0].alt}
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                    <figcaption className="text-center text-sm text-muted-foreground mt-3">
                      {storyData.images[0].caption}
                    </figcaption>
                  </figure>
                )}

                <div 
                  className="story-content text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: storyData.content.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>').replace(/<h3>/g, '</p><h3 class="text-2xl font-product-sans font-bold text-foreground mt-8 mb-4">').replace(/<\/h3>/g, '</h3><p>')
                  }} 
                />

                {/* Additional Images */}
                {storyData.images.slice(1).map((image, index) => (
                  <figure key={index} className="my-8">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                    <figcaption className="text-center text-sm text-muted-foreground mt-3">
                      {image.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-product-sans font-bold text-foreground mb-8 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-primary" />
                  Related Stories
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedStories.map((relatedStory) => (
                    <StoryCard key={relatedStory.id} story={relatedStory} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default StoryDetail;