# 🚀 Deployment Checklist for Avid Explores

## Pre-Deployment Checklist

### 📋 Code & Dependencies
- [ ] All code changes committed and pushed to main branch
- [ ] Install missing dependencies: `npm install mongoose@^8.18.0 next-auth@^4.24.11`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run build` to test production build locally
- [ ] Fix any build errors or warnings
- [ ] Run `npm run lint` and fix any linting issues

### 🔧 Environment Configuration
- [ ] Create production `.env` file with all required variables:
  ```
  MONGODB_URI=mongodb://avidexplorers:kBkBWLYhJnACgZC6@72.60.97.217:27017/?authSource=aviddatabase
  NEXTAUTH_SECRET=your-production-secret-here
  NEXTAUTH_URL=https://your-domain.com
  APP_URL=https://your-domain.com
  RAZORPAY_KEY_ID=your-production-razorpay-key
  RAZORPAY_KEY_SECRET=your-production-razorpay-secret
  EMAIL_FROM=noreply@your-domain.com
  EMAIL_HOST=your-smtp-host
  EMAIL_PORT=587
  EMAIL_USER=your-email-user
  EMAIL_PASS=your-email-password
  ```
- [ ] Verify MongoDB connection string is correct for production
- [ ] Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Update NEXTAUTH_URL and APP_URL to production domain
- [ ] Configure production Razorpay keys
- [ ] Set up production email service (SMTP)

### 🗄️ Database Setup
- [ ] Verify MongoDB database is accessible from production server
- [ ] Test database connection with production credentials
- [ ] Run database migrations if any
- [ ] Create admin user: `node scripts/create-admin.js`
- [ ] Backup existing data if updating existing deployment

### 🔒 Security
- [ ] Ensure all sensitive data is in environment variables
- [ ] Remove any hardcoded secrets or API keys
- [ ] Verify CORS settings for production domain
- [ ] Set up SSL certificate for HTTPS
- [ ] Configure security headers in next.config.js

### 📦 Build & Test
- [ ] Test application locally with production environment variables
- [ ] Verify all features work correctly:
  - [ ] User authentication (login/register)
  - [ ] Event booking functionality
  - [ ] Payment processing with Razorpay
  - [ ] Admin dashboard access
  - [ ] File uploads
  - [ ] Email notifications
- [ ] Test responsive design on different devices
- [ ] Check page load speeds and optimize if needed

## Deployment Steps

### 🌐 Platform-Specific Deployment

#### Vercel Deployment
1. [ ] Connect GitHub repository to Vercel
2. [ ] Configure environment variables in Vercel dashboard
3. [ ] Set build command: `npm run build`
4. [ ] Set output directory: `.next`
5. [ ] Deploy and test

#### Netlify Deployment
1. [ ] Connect GitHub repository to Netlify
2. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. [ ] Add environment variables in Netlify dashboard
4. [ ] Deploy and test

#### Docker Deployment
1. [ ] Build Docker image: `docker build -t avid-explores .`
2. [ ] Test container locally: `docker run -p 3000:3000 avid-explores`
3. [ ] Push to container registry
4. [ ] Deploy to production server

#### VPS/Server Deployment
1. [ ] Install Node.js (v18+) on server
2. [ ] Clone repository: `git clone <repo-url>`
3. [ ] Install dependencies: `npm install`
4. [ ] Create production `.env` file
5. [ ] Build application: `npm run build`
6. [ ] Set up process manager (PM2): `pm2 start npm --name "avid-explores" -- start`
7. [ ] Configure reverse proxy (Nginx)
8. [ ] Set up SSL certificate

## Post-Deployment Checklist

### ✅ Verification
- [ ] Application loads correctly at production URL
- [ ] All pages render without errors
- [ ] User registration and login work
- [ ] Database operations function correctly
- [ ] Payment processing works with Razorpay
- [ ] Email notifications are sent
- [ ] Admin dashboard is accessible
- [ ] File uploads work correctly
- [ ] Mobile responsiveness verified

### 📊 Monitoring & Maintenance
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up automated backups for database
- [ ] Configure log rotation
- [ ] Set up performance monitoring
- [ ] Create monitoring dashboard

### 🔄 CI/CD (Optional)
- [ ] Set up GitHub Actions for automated deployment
- [ ] Configure automated testing pipeline
- [ ] Set up staging environment
- [ ] Configure automatic deployments on main branch push

## Troubleshooting Common Issues

### Build Errors
- **Missing dependencies**: Run `npm install` and check package.json
- **TypeScript errors**: Fix type issues or update tsconfig.json
- **Environment variables**: Ensure all required env vars are set

### Runtime Errors
- **Database connection**: Verify MongoDB URI and network access
- **Authentication issues**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
- **Payment errors**: Verify Razorpay keys and webhook configuration

### Performance Issues
- **Slow loading**: Optimize images, enable compression, use CDN
- **Memory issues**: Check for memory leaks, optimize database queries
- **High CPU**: Profile application, optimize heavy operations

## Emergency Rollback Plan
1. [ ] Keep previous version deployment ready
2. [ ] Document rollback procedure
3. [ ] Test rollback process in staging
4. [ ] Have database backup restoration plan

---

## 📞 Support Contacts
- **Developer**: [Your contact info]
- **Database Admin**: [Database admin contact]
- **Hosting Provider**: [Hosting support contact]

## 📚 Additional Resources
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Razorpay Integration Guide](https://razorpay.com/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---
**Last Updated**: $(date)
**Version**: 1.0