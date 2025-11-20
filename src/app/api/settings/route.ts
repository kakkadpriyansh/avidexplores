import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import SiteSettings from '@/models/SiteSettings';
import { Model } from 'mongoose';

// GET /api/settings - Get site settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeSecrets = searchParams.get('includeSecrets') === 'true';
    const section = searchParams.get('section'); // Optional: get specific section

    // Get active settings
    const settings = await (SiteSettings as any).getActiveSettings();

    if (!settings) {
      return NextResponse.json(
        { error: 'Site settings not found' },
        { status: 404 }
      );
    }

    // Convert to object and remove sensitive data for public access
    const settingsObj = settings.toObject();

    // If not requesting secrets, remove sensitive information
    if (!includeSecrets) {
      delete settingsObj.email?.smtpSettings;
      delete settingsObj.payment?.razorpay;
      delete settingsObj.api;
      delete settingsObj.uploads?.cloudinaryConfig;
      delete settingsObj.uploads?.s3Config;
    }

    // If requesting specific section, return only that section
    if (section && settingsObj[section]) {
      return NextResponse.json({
        success: true,
        data: settingsObj[section]
      });
    }

    return NextResponse.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update site settings (Admin only)
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { section, data } = body;

    // Get current active settings
    let settings = await (SiteSettings as Model<any>).findOne({ isActive: true });

    if (!settings) {
      // Create default settings if none exist
      settings = await (SiteSettings as any).createDefaultSettings(session.user.id);
    }

    // If updating specific section
    if (section && data) {
      // Validate section exists
      if (!settings.schema.paths[section]) {
        return NextResponse.json(
          { error: `Invalid section: ${section}` },
          { status: 400 }
        );
      }

      // Update specific section
      settings[section] = { ...settings[section], ...data };
    } else {
      // Update entire settings (merge with existing)
      Object.keys(body).forEach(key => {
        if (key !== 'section' && key !== 'data' && settings.schema.paths[key]) {
          settings[key] = body[key];
        }
      });
    }

    // Update metadata
    settings.lastUpdatedBy = session.user.id;
    settings.version = incrementVersion(settings.version);

    // Save settings
    await settings.save();

    // Populate user info and return
    await settings.populate('lastUpdatedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    
    // Handle validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/reset - Reset to default settings (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      // Deactivate current settings
      await SiteSettings.updateMany({}, { isActive: false });

      // Create new default settings
      const newSettings = await (SiteSettings as any).createDefaultSettings(session.user.id);
      await newSettings.populate('lastUpdatedBy', 'name email');

      return NextResponse.json({
        success: true,
        message: 'Site settings reset to defaults successfully',
        data: newSettings
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error resetting site settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset site settings' },
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