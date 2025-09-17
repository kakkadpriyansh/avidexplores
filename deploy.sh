#!/bin/bash

# Avid Explores Deployment Script
# This script automates the deployment process for the Avid Explores application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="avid-explorers"
DOCKER_IMAGE_NAME="avid-explorers"
CONTAINER_NAME="avid-explorers-app"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18 or higher."
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm."
    fi
    
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed. Docker deployment will not be available."
    fi
    
    success "Dependencies check completed"
}

# Install missing dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install missing dependencies
    npm install mongoose@^8.18.0 next-auth@^4.24.11
    
    # Install all dependencies
    npm install
    
    success "Dependencies installed successfully"
}

# Check environment configuration
check_environment() {
    log "Checking environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        warning ".env.production file not found. Creating from template..."
        if [ -f ".env.production.example" ]; then
            cp .env.production.example .env.production
            warning "Please update .env.production with your production values"
        else
            error ".env.production.example not found. Cannot create production environment file."
        fi
    fi
    
    # Check if MONGODB_URI is set
    if ! grep -q "MONGODB_URI=" .env.production; then
        error "MONGODB_URI not found in .env.production. Please configure your database connection."
    fi
    
    success "Environment configuration check completed"
}

# Run tests and build
build_application() {
    log "Building application..."
    
    # Set NODE_ENV for production build
    export NODE_ENV=production
    
    # Load production environment variables for build
    if [ -f ".env.production" ]; then
        log "Loading production environment variables..."
        set -a  # automatically export all variables
        source .env.production
        set +a  # stop automatically exporting
    fi
    
    # Run linting
    log "Running ESLint..."
    npm run lint || warning "Linting completed with warnings"
    
    # Build the application
    log "Building Next.js application..."
    npm run build
    
    success "Application built successfully"
}

# Create backup
create_backup() {
    if [ "$1" = "true" ]; then
        log "Creating backup..."
        
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S').tar.gz"
        
        # Create backup of current deployment (if exists)
        if [ -d ".next" ]; then
            tar -czf "$BACKUP_DIR/$BACKUP_NAME" .next package.json package-lock.json
            success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
        else
            warning "No existing deployment found to backup"
        fi
    fi
}

# Deploy with Docker
deploy_docker() {
    log "Deploying with Docker..."
    
    # Stop existing container
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        log "Stopping existing container..."
        docker stop "$CONTAINER_NAME" || true
        docker rm "$CONTAINER_NAME" || true
    fi
    
    # Build Docker image
    log "Building Docker image..."
    docker build -t "$DOCKER_IMAGE_NAME" .
    
    # Run container
    log "Starting new container..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p 3000:3000 \
        --env-file .env.production \
        --restart unless-stopped \
        "$DOCKER_IMAGE_NAME"
    
    success "Docker deployment completed"
}

# Deploy with PM2
deploy_pm2() {
    log "Deploying with PM2..."
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        npm install -g pm2
    fi
    
    # Stop existing process
    pm2 stop "$PROJECT_NAME" || true
    pm2 delete "$PROJECT_NAME" || true
    
    # Start new process
    pm2 start npm --name "$PROJECT_NAME" -- start
    pm2 save
    
    success "PM2 deployment completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Install Vercel CLI if not installed
    if ! command -v vercel &> /dev/null; then
        log "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    success "Vercel deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Health check passed - Application is running"
    else
        error "Health check failed - Application is not responding"
    fi
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    if [ -z "$1" ]; then
        error "Please specify backup file for rollback"
    fi
    
    if [ ! -f "$BACKUP_DIR/$1" ]; then
        error "Backup file not found: $BACKUP_DIR/$1"
    fi
    
    # Extract backup
    tar -xzf "$BACKUP_DIR/$1"
    
    # Restart application
    if command -v pm2 &> /dev/null; then
        pm2 restart "$PROJECT_NAME"
    elif command -v docker &> /dev/null; then
        docker restart "$CONTAINER_NAME"
    fi
    
    success "Rollback completed"
}

# Main deployment function
deploy() {
    local deployment_type="$1"
    local create_backup_flag="$2"
    
    log "Starting deployment process..."
    log "Deployment type: $deployment_type"
    
    # Create backup if requested
    create_backup "$create_backup_flag"
    
    # Check dependencies
    check_dependencies
    
    # Check environment configuration
    check_environment
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    # Deploy based on type
    case "$deployment_type" in
        "docker")
            deploy_docker
            ;;
        "pm2")
            deploy_pm2
            ;;
        "vercel")
            deploy_vercel
            return  # Skip health check for Vercel
            ;;
        *)
            error "Unknown deployment type: $deployment_type"
            ;;
    esac
    
    # Health check
    health_check
    
    success "Deployment completed successfully!"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy <type>     Deploy the application"
    echo "                    Types: docker, pm2, vercel"
    echo "  rollback <file>   Rollback to a previous backup"
    echo "  health            Perform health check"
    echo "  logs              Show application logs"
    echo ""
    echo "Options:"
    echo "  --backup          Create backup before deployment"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy docker --backup"
    echo "  $0 deploy pm2"
    echo "  $0 rollback backup-20231201-120000.tar.gz"
    echo "  $0 health"
}

# Show logs
show_logs() {
    if command -v pm2 &> /dev/null; then
        pm2 logs "$PROJECT_NAME"
    elif command -v docker &> /dev/null; then
        docker logs "$CONTAINER_NAME" -f
    else
        tail -f "$LOG_FILE"
    fi
}

# Main script logic
case "$1" in
    "deploy")
        if [ -z "$2" ]; then
            error "Please specify deployment type: docker, pm2, or vercel"
        fi
        
        backup_flag="false"
        if [ "$3" = "--backup" ]; then
            backup_flag="true"
        fi
        
        deploy "$2" "$backup_flag"
        ;;
    "rollback")
        rollback "$2"
        ;;
    "health")
        health_check
        ;;
    "logs")
        show_logs
        ;;
    "--help"|"help"|"")
        show_usage
        ;;
    *)
        error "Unknown command: $1"
        show_usage
        ;;
esac