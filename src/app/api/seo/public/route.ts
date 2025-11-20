import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SEO, { ISEO } from '@/models/SEO';
import Event, { IEvent } from '@/models/Event';
import { Model } from 'mongoose';

// GET /api/seo/public - Get SEO data for public pages (No auth required)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pageType = url.searchParams.get('pageType');
    const pageId = url.searchParams.get('pageId');
    const slug = url.searchParams.get('slug');
    const eventSlug = url.searchParams.get('eventSlug');

    if (!pageType) {
      return NextResponse.json(
        { error: 'Page type is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let seoData: ISEO | null = null;

    // Build query based on parameters
    const query: any = { 
      pageType: pageType.toUpperCase(),
      isActive: true 
    };

    if (pageId) {
      query.pageId = pageId;
    }
    if (slug) {
      query.slug = slug;
    }

    // Try to find specific SEO setting
    seoData = await (SEO as Model<ISEO>).findOne(query);

    // If no specific SEO found and it's an event page, try to get event data
    if (!seoData && pageType.toUpperCase() === 'EVENT' && eventSlug) {
      const event = await (Event as Model<IEvent>).findOne({ 
        slug: eventSlug,
        isActive: true 
      });

      if (event) {
        // Generate SEO data from event information
        const generatedSEO = {
          pageType: 'EVENT',
          pageId: event._id.toString(),
          title: `${event.title} - Adventure Tour | Avid Explores`,
          description: event.description.substring(0, 160),
          keywords: [
            'adventure tour',
            'travel',
            'booking',
            event.title,
            ...(event.location?.name ? [event.location.name] : []),
            ...(event.category ? [event.category] : []),
            ...(event.difficulty ? [event.difficulty] : []),
            ...(event.tags || [])
          ],
          ogTitle: event.title,
          ogDescription: event.description.substring(0, 160),
          ogImage: event.images?.[0] || null,
          twitterTitle: event.title,
          twitterDescription: event.description.substring(0, 160),
          twitterImage: event.images?.[0] || null,
          canonicalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}`,
          noIndex: false,
          noFollow: false,
          structuredData: [
            {
              type: 'TouristTrip',
              data: {
                '@context': 'https://schema.org',
                '@type': 'TouristTrip',
                name: event.title,
                description: event.description,
                image: event.images,
                startDate: event.dates?.[0] || null,
                // Compute endDate based on duration which may be free-text (e.g., "5 Days 4 Nights")
                endDate: (() => {
                  const start = event.dates?.[0];
                  if (!start) return null;
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
                  return new Date(new Date(start).getTime() + days * 24 * 60 * 60 * 1000);
                })(),
                location: {
                  '@type': 'Place',
                  name: event.location?.name || 'Adventure Location',
                  address: {
                    '@type': 'PostalAddress',
                    addressRegion: event.location?.state || '',
                    addressCountry: event.location?.country || 'India'
                  }
                },
                offers: {
                  '@type': 'Offer',
                  price: event.price || 0,
                  priceCurrency: 'INR',
                  availability: 'https://schema.org/InStock'
                },
                organizer: {
                  '@type': 'Organization',
                  name: 'Avid Explores',
                  url: process.env.NEXT_PUBLIC_BASE_URL
                },
                // ISO 8601 duration in days (parse numeric value from free-text)
                duration: (() => {
                  const raw = (event as any).duration;
                  const match = typeof raw === 'string' ? raw.match(/(\d+(?:\.\d+)?)/) : null;
                  const days = typeof raw === 'number' && Number.isFinite(raw)
                    ? Math.floor(raw)
                    : match ? Math.floor(Number(match[1])) : 1;
                  return `P${days}D`;
                })()
              }
            },
            {
              type: 'Product',
              data: {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: event.title,
                description: event.description,
                image: event.images?.[0] || null,
                brand: {
                  '@type': 'Brand',
                  name: 'Avid Explores'
                },
                offers: {
                  '@type': 'Offer',
                  price: event.price || 0,
                  priceCurrency: 'INR',
                  availability: 'https://schema.org/InStock'
                }
              }
            }
          ]
        };

        return NextResponse.json({
          success: true,
          data: generatedSEO,
          generated: true
        });
      }
    }

    // If no specific SEO found, try to get default for page type
    if (!seoData) {
      seoData = await (SEO as Model<ISEO>).findOne({
        pageType: pageType.toUpperCase(),
        pageId: { $exists: false },
        slug: { $exists: false },
        isActive: true
      });
    }

    // If still no SEO data found, return default
    if (!seoData) {
      const defaultSEO = getDefaultSEO(pageType.toUpperCase());
      return NextResponse.json({
        success: true,
        data: defaultSEO,
        default: true
      });
    }

    return NextResponse.json({
      success: true,
      data: seoData
    });

  } catch (error) {
    console.error('Error fetching public SEO data:', error);
    
    // Return default SEO on error
    const defaultSEO = getDefaultSEO('HOME');
    return NextResponse.json({
      success: true,
      data: defaultSEO,
      default: true,
      error: 'Failed to fetch SEO data, using defaults'
    });
  }
}

// Helper function to generate default SEO data
function getDefaultSEO(pageType: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://avidexplores.com';
  
  const defaults = {
    HOME: {
      title: 'Avid Explores - Adventure Tours & Travel Experiences',
      description: 'Discover amazing adventure tours and travel experiences with Avid Explores. Book your next adventure today!',
      keywords: ['adventure tours', 'travel', 'booking', 'experiences', 'adventure travel']
    },
    EVENT: {
      title: 'Adventure Tours - Avid Explores',
      description: 'Explore our exciting adventure tours and book your next travel experience.',
      keywords: ['adventure tours', 'travel booking', 'experiences']
    },
    BLOG: {
      title: 'Travel Blog - Avid Explores',
      description: 'Read our latest travel stories, tips, and adventure guides.',
      keywords: ['travel blog', 'adventure stories', 'travel tips']
    },
    DESTINATION: {
      title: 'Travel Destinations - Avid Explores',
      description: 'Discover amazing travel destinations and plan your next adventure.',
      keywords: ['travel destinations', 'adventure locations', 'travel planning']
    }
  };

  const defaultData = defaults[pageType] || defaults.HOME;

  return {
    pageType,
    title: defaultData.title,
    description: defaultData.description,
    keywords: defaultData.keywords,
    ogTitle: defaultData.title,
    ogDescription: defaultData.description,
    ogImage: `${baseUrl}/images/og-default.jpg`,
    twitterTitle: defaultData.title,
    twitterDescription: defaultData.description,
    twitterImage: `${baseUrl}/images/twitter-default.jpg`,
    canonicalUrl: baseUrl,
    noIndex: false,
    noFollow: false,
    structuredData: [
      {
        type: 'Organization',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Avid Explores',
          url: baseUrl,
          logo: `${baseUrl}/images/logo.png`,
          description: 'Adventure tours and travel experiences',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-XXXXXXXXXX',
            contactType: 'Customer Service'
          }
        }
      }
    ]
  };
}