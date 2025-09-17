# 🚀 Production Environment Setup Guide

This guide will help you set up the Avid Explores application in a production environment.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **MongoDB**: Access to MongoDB database
- **SSL Certificate**: For HTTPS (recommended)
- **Domain**: Registered domain name

### Server Requirements
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **CPU**: 2+ cores recommended
- **Network**: Stable internet connection

## 🔧 Environment Variables Configuration

### 1. Copy Production Environment Template
```bash
cp .env.production .env
```

### 2. Configure Required Variables

#### Database Configuration
```bash
# Your MongoDB connection string
MONGODB_URI=mongodb://avidexplorers:kBkBWLYhJnACgZC6@72.60.97.217:27017/?authSource=aviddatabase
```

#### Authentication Configuration
```bash
# Generate a secure secret (32+ characters)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Your production domain
NEXTAUTH_URL=https://your-domain.com
APP_URL=https://your-domain.com
```

#### Payment Gateway (Razorpay)
```bash
# Get these from your Razorpay dashboard
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

#### Email Configuration
```bash
# SMTP settings for sending emails
EMAIL_FROM=noreply@your-domain.com
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
```

## 🌐 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker installed on your server
- Docker Compose (optional)

#### Steps
1. **Build and run with Docker Compose:**
```bash
# For production
docker-compose -f docker-compose.prod.yml up -d
```

2. **Or build and run manually:**
```bash
# Build the image
docker build -t avid-explorers .

# Run the container
docker run -d \
  --name avid-explorers-app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  avid-explorers
```

#### Docker Management Commands
```bash
# View logs
docker logs avid-explorers-app -f

# Stop the application
docker stop avid-explorers-app

# Start the application
docker start avid-explorers-app

# Update the application
docker pull avid-explorers:latest
docker stop avid-explorers-app
docker rm avid-explorers-app
docker run -d --name avid-explorers-app -p 3000:3000 --env-file .env avid-explorers:latest
```

### Option 2: PM2 Deployment

#### Prerequisites
- Node.js installed on server
- PM2 process manager

#### Steps
1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Install dependencies and build:**
```bash
npm install
npm run build
```

3. **Start with PM2:**
```bash
pm2 start npm --name "avid-explorers" -- start
pm2 save
pm2 startup
```

#### PM2 Management Commands
```bash
# View status
pm2 status

# View logs
pm2 logs avid-explorers

# Restart application
pm2 restart avid-explorers

# Stop application
pm2 stop avid-explorers

# Monitor resources
pm2 monit
```

### Option 3: Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps
1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Configure environment variables in Vercel dashboard**

### Option 4: VPS/Server Deployment

#### Prerequisites
- VPS or dedicated server
- Nginx (for reverse proxy)
- SSL certificate

#### Steps
1. **Clone repository:**
```bash
git clone <your-repo-url>
cd avid-explorers-frontend-main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build application:**
```bash
npm run build
```

4. **Start with PM2:**
```bash
pm2 start npm --name "avid-explorers" -- start
```

5. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Configuration

### 1. SSL/TLS Certificate
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirect
- Enable HSTS headers

### 2. Environment Security
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly
- Limit database access by IP

### 3. Application Security
- Keep dependencies updated
- Enable security headers
- Configure CORS properly
- Use rate limiting

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Docker monitoring
docker stats avid-explorers-app
```

### 2. Health Checks
The application includes a health check endpoint at `/api/health`

### 3. Log Management
- Configure log rotation
- Set up centralized logging (optional)
- Monitor error rates

## 🔄 Backup and Recovery

### 1. Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://avidexplorers:kBkBWLYhJnACgZC6@72.60.97.217:27017/?authSource=aviddatabase" --out=backup-$(date +%Y%m%d)
```

### 2. Application Backup
```bash
# Create application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz .next package.json package-lock.json
```

### 3. Automated Backups
Set up cron jobs for regular backups:
```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/backup-script.sh
```

## 🚀 Performance Optimization

### 1. Next.js Optimizations
- Enable output file tracing
- Configure image optimization
- Use CDN for static assets

### 2. Database Optimizations
- Create proper indexes
- Monitor query performance
- Use connection pooling

### 3. Server Optimizations
- Configure gzip compression
- Enable caching headers
- Use a CDN

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Database Connection Issues
- Verify MongoDB URI
- Check network connectivity
- Confirm authentication credentials

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Monitor application performance
- [ ] Review and rotate secrets
- [ ] Check backup integrity
- [ ] Monitor disk space and memory usage

### Emergency Contacts
- **Developer**: [Your contact information]
- **Hosting Provider**: [Provider support]
- **Database Admin**: [Database contact]

## 📚 Additional Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Production Guide](https://docs.docker.com/config/containers/start-containers-automatically/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Last Updated**: $(date)
**Version**: 1.0