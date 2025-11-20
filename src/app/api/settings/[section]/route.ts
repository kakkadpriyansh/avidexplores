import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import SiteSettings from '@/models/SiteSettings';
import { Model } from 'mongoose';

interface RouteParams {
  params: {
    section: string;
  };
}

// GET /api/settings/[section] - Get specific section of site settings
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const { section } = params;
    const { searchParams } = new URL(request.url);
    const includeSecrets = searchParams.get('includeSecrets') === 'true';

    // Get active settings
    const settings = await (SiteSettings as any).getActiveSettings();

    if (!settings) {
      return NextResponse.json(
        { error: 'Site settings not found' },
        { status: 404 }
      );
    }

    // Check if section exists
    if (!settings[section]) {
      return NextResponse.json(
        { error: `Section '${section}' not found` },
        { status: 404 }
      );
    }

    let sectionData = settings[section];

    // Remove sensitive data for certain sections if not requesting secrets
    if (!includeSecrets) {
      if (section === 'email' && sectionData.smtpSettings) {
        sectionData = { ...sectionData.toObject() };
        delete sectionData.smtpSettings;
      }
      
      if (section === 'payment') {
        sectionData = { ...sectionData.toObject() };
        delete sectionData.razorpay;
      }
      
      if (section === 'api') {
        return NextResponse.json(
          { error: 'API settings require authentication' },
          { status: 403 }
        );
      }
      
      if (section === 'uploads') {
        sectionData = { ...sectionData.toObject() };
        delete sectionData.cloudinaryConfig;
        delete sectionData.s3Config;
      }
    }

    return NextResponse.json({
      success: true,
      section,
      data: sectionData
    });
  } catch (error) {
    console.error(`Error fetching ${params.section} settings:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${params.section} settings` },
      { status: 500 }
    );
  }
}

// PUT /api/settings/[section] - Update specific section of site settings (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { section } = params;
    const body = await request.json();

    // Get current active settings
    let settings = await (SiteSettings as Model<any>).findOne({ isActive: true });

    if (!settings) {
      // Create default settings if none exist
      settings = await (SiteSettings as any).createDefaultSettings(session.user.id);
    }

    // Validate section exists
    const validSections = ['general', 'hero', 'theme', 'business', 'seo', 'email', 'payment', 'security', 'integrations', 'maintenance'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    // Special validation for certain sections
    if (section === 'theme') {
      // Validate color formats
      const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
      for (const field of colorFields) {
        if (body[field] && !/^#[0-9A-F]{6}$/i.test(body[field])) {
          return NextResponse.json(
            { error: `Invalid color format for ${field}. Use hex format (e.g., #FF0000)` },
            { status: 400 }
          );
        }
      }
    }

    if (section === 'contact') {
      // Validate email format
      if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    if (section === 'seo') {
      // Validate meta title and description lengths
      if (body.metaTitle && body.metaTitle.length > 60) {
        return NextResponse.json(
          { error: 'Meta title cannot exceed 60 characters' },
          { status: 400 }
        );
      }
      if (body.metaDescription && body.metaDescription.length > 160) {
        return NextResponse.json(
          { error: 'Meta description cannot exceed 160 characters' },
          { status: 400 }
        );
      }
    }

    if (section === 'payment') {
      // Validate currency code
      if (body.currency && body.currency.length !== 3) {
        return NextResponse.json(
          { error: 'Currency code must be 3 characters (e.g., USD, EUR, INR)' },
          { status: 400 }
        );
      }
      // Validate tax rate
      if (body.taxRate !== undefined && (body.taxRate < 0 || body.taxRate > 100)) {
        return NextResponse.json(
          { error: 'Tax rate must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Update specific section (merge with existing data)
    if (settings[section] && typeof settings[section] === 'object') {
      settings[section] = { ...settings[section].toObject?.() || settings[section], ...body };
    } else {
      settings[section] = body;
    }

    // Update metadata
    settings.lastUpdatedBy = session.user.id;
    settings.version = incrementVersion(settings.version);

    // Save settings with validation disabled for partial updates
    await settings.save({ validateModifiedOnly: true });

    // Populate user info and return
    await settings.populate('lastUpdatedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
      section,
      data: settings[section],
      metadata: {
        version: settings.version,
        lastUpdatedBy: settings.lastUpdatedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error updating ${params.section} settings:`, error);
    console.error('Error name:', (error as any).name);
    console.error('Error message:', (error as any).message);
    
    // Handle validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      console.error('Validation errors:', validationErrors);
      console.error('Full error:', error);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          section: params.section,
          details: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to update ${params.section} settings` },
      { status: 500 }
    );
  }
}

// Helper function to increment version
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}