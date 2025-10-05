import { Metadata } from 'next';
import SEO, { ISEO } from '@/models/SEO';
import Event, { IEvent } from '@/models/Event';
import connectDB from '@/lib/mongodb';
import { Model } from 'mongoose';

/**
 * Generate SEO metadata for Next.js pages
 */
export async function generateSEOMetadata({
  pageType,
  pageId,
  slug,
  eventSlug,
  fallbackTitle = 'Avid Explores - Adventure Tours & Travel',
  fallbackDescription = 'Discover amazing adventure tours and travel experiences with Avid Explores. Book your next adventure today!'
}: {
  pageType?: string;
  pageId?: string;
  slug?: string;
  eventSlug?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}): Promise<Metadata> {
  try {
    await connectDB();

    let seoData = null;

    // Try to find specific SEO settings
    if (pageType && pageId) {
      seoData = await (SEO as Model<ISEO>).findOne({ pageType, pageId, isActive: true });
    } else if (slug) {
      seoData = await (SEO as Model<ISEO>).findOne({ slug, isActive: true });
    } else if (eventSlug) {
      seoData = await (SEO as Model<ISEO>).findOne({ slug: eventSlug, pageType: 'event', isActive: true });
      
      // If no SEO found, generate from event data
      if (!seoData) {
        const event = await (Event as Model<IEvent>).findOne({ slug: eventSlug, isActive: true });
        if (event) {
          return {
            title: `${event.title} - Adventure Tour | Avid Explores`,
            description: event.description.substring(0, 160),
            keywords: [
              event.title,
              event.category,
              event.difficulty,
              event.location.name,
              event.location.state,
              ...event.tags
            ].join(', '),
            openGraph: {
              title: `${event.title} - Adventure Tour`,
              description: event.description.substring(0, 160),
              images: event.images.slice(0, 3).map(img => ({ url: img })),
              type: 'website'
            },
            twitter: {
              card: 'summary_large_image',
              title: `${event.title} - Adventure Tour`,
              description: event.description.substring(0, 160),
              images: event.images.slice(0, 1)
            },
            other: {
              'structured-data': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TouristTrip',
                name: event.title,
                description: event.description,
                image: event.images,
                offers: {
                  '@type': 'Offer',
                  price: event.price,
                  priceCurrency: 'INR'
                },
                startDate: event.dates[0],
                // Compute endDate from duration which may be a free-text string
                // Extract the first numeric day count and default to 1 day if missing
                endDate: (() => {
                  const start = event.dates?.[0];
                  if (!start) return undefined as any;
                  const raw = (event as any).duration;
                  let days = 1;
                  if (typeof raw === 'number' && Number.isFinite(raw)) {
                    days = Math.max(1, Math.floor(raw));
                  } else if (typeof raw === 'string') {
                    const match = raw.match(/(\d+(?:\.\d+)?)/);
                    if (match) {
                      days = Math.max(1, Math.floor(Number(match[1])));
                    }
                  }
                  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
                })(),
                location: {
                  '@type': 'Place',
                  name: event.location.name,
                  address: {
                    '@type': 'PostalAddress',
                    addressRegion: event.location.state,
                    addressCountry: event.location.country
                  }
                },
                // Represent ISO 8601 duration in days if we could parse a number
                duration: (() => {
                  const raw = (event as any).duration;
                  const match = typeof raw === 'string' ? raw.match(/(\d+(?:\.\d+)?)/) : null;
                  const days = typeof raw === 'number' && Number.isFinite(raw)
                    ? Math.floor(raw)
                    : match ? Math.floor(Number(match[1])) : 1;
                  return `P${days}D`;
                })()
              })
            }
          };
        }
      }
    }

    // Use found SEO data or fallback
    if (seoData) {
      const metadata: Metadata = {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords?.join(', ')
      };

      // Add Open Graph data
      if (seoData.openGraph) {
        metadata.openGraph = {
          title: seoData.openGraph.title || seoData.title,
          description: seoData.openGraph.description || seoData.description,
          images: seoData.openGraph.images || [],
          type: seoData.openGraph.type || 'website',
          siteName: seoData.openGraph.siteName || 'Avid Explores'
        };
      }

      // Add Twitter data
      if (seoData.twitter) {
        metadata.twitter = {
          card: seoData.twitter.card || 'summary_large_image',
          title: seoData.twitter.title || seoData.title,
          description: seoData.twitter.description || seoData.description,
          images: seoData.twitter.images || []
        };
      }

      // Add canonical URL
      if (seoData.canonicalUrl) {
        metadata.alternates = {
          canonical: seoData.canonicalUrl
        };
      }

      // Add robots directives
      if (seoData.noIndex || seoData.noFollow) {
        metadata.robots = {
          index: !seoData.noIndex,
          follow: !seoData.noFollow
        };
      }

      // Add structured data and custom meta
      if (seoData.structuredData || seoData.customMeta) {
        metadata.other = {};
        
        if (seoData.structuredData) {
          metadata.other['structured-data'] = JSON.stringify(seoData.structuredData);
        }
        
        if (seoData.customMeta) {
          Object.entries(seoData.customMeta).forEach(([key, value]) => {
            metadata.other![key] = value as string;
          });
        }
      }

      return metadata;
    }

    // Return fallback metadata
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        type: 'website',
        siteName: 'Avid Explores'
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: fallbackDescription
      }
    };

  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    
    // Return fallback on error
    return {
      title: fallbackTitle,
      description: fallbackDescription
    };
  }
}

/**
 * Generate structured data script tag
 */
export function generateStructuredDataScript(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/**
 * Default SEO settings for different page types
 */
export const defaultSEOSettings = {
  home: {
    title: 'Avid Explores - Adventure Tours & Travel Experiences',
    description: 'Discover amazing adventure tours, trekking expeditions, and travel experiences across India. Book your next adventure with Avid Explores.',
    keywords: ['adventure tours', 'trekking', 'travel', 'india', 'camping', 'wildlife', 'cultural tours']
  },
  events: {
    title: 'Adventure Tours & Events - Avid Explores',
    description: 'Browse our collection of adventure tours, trekking expeditions, camping trips, and cultural experiences across India.',
    keywords: ['adventure tours', 'events', 'trekking', 'camping', 'wildlife tours', 'cultural experiences']
  },
  about: {
    title: 'About Us - Avid Explores',
    description: 'Learn about Avid Explores, your trusted partner for adventure tours and travel experiences across India.',
    keywords: ['about avid explores', 'adventure travel company', 'tour operator', 'travel experiences']
  },
  contact: {
    title: 'Contact Us - Avid Explores',
    description: 'Get in touch with Avid Explores for booking inquiries, custom tour packages, and travel assistance.',
    keywords: ['contact avid explores', 'booking inquiries', 'travel assistance', 'tour booking']
  },
  stories: {
    title: 'Travel Stories & Experiences - Avid Explores',
    description: 'Read inspiring travel stories and experiences from our adventure tours and expeditions.',
    keywords: ['travel stories', 'adventure experiences', 'travel blog', 'expedition stories']
  }
};