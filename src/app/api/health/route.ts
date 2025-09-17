import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      await connectDB();
      dbResponseTime = Date.now() - dbStartTime;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'error';
    }
    
    // Check environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'APP_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );
    
    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;
    
    // Determine overall health status
    const isHealthy = dbStatus === 'connected' && missingEnvVars.length === 0;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`
        },
        environment: {
          status: missingEnvVars.length === 0 ? 'ok' : 'error',
          missingVariables: missingEnvVars
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      },
      responseTime: `${totalResponseTime}ms`
    };
    
    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthData, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}