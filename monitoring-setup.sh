#!/bin/bash

# Monitoring Setup Script for Avid Explores
# This script sets up monitoring, logging, and health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="avid-explores"
LOG_DIR="/var/log/avid-explores"
BACKUP_DIR="/var/backups/avid-explores"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if running as root for system-level setup
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log "Running with root privileges - system-level monitoring will be configured"
        SYSTEM_LEVEL=true
    else
        warning "Running without root privileges - some system-level features will be skipped"
        SYSTEM_LEVEL=false
    fi
}

# Setup log directories
setup_logging() {
    log "Setting up logging directories..."
    
    if [ "$SYSTEM_LEVEL" = true ]; then
        mkdir -p "$LOG_DIR"
        chown -R $USER:$USER "$LOG_DIR"
        chmod 755 "$LOG_DIR"
    else
        LOG_DIR="./logs"
        mkdir -p "$LOG_DIR"
    fi
    
    success "Logging directory created: $LOG_DIR"
}

# Setup log rotation
setup_logrotate() {
    if [ "$SYSTEM_LEVEL" = true ]; then
        log "Setting up log rotation..."
        
        cat > /etc/logrotate.d/avid-explores << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        if [ -f /var/run/pm2.pid ]; then
            pm2 reloadLogs
        fi
    endscript
}
EOF
        
        success "Log rotation configured"
    else
        warning "Skipping log rotation setup (requires root privileges)"
    fi
}

# Setup PM2 monitoring
setup_pm2_monitoring() {
    if command -v pm2 &> /dev/null; then
        log "Setting up PM2 monitoring..."
        
        # Install PM2 log rotation
        pm2 install pm2-logrotate
        
        # Configure log rotation
        pm2 set pm2-logrotate:max_size 10M
        pm2 set pm2-logrotate:retain 30
        pm2 set pm2-logrotate:compress true
        pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
        
        # Setup PM2 monitoring
        pm2 install pm2-server-monit
        
        success "PM2 monitoring configured"
    else
        warning "PM2 not found - skipping PM2 monitoring setup"
    fi
}

# Setup health check monitoring
setup_health_monitoring() {
    log "Setting up health check monitoring..."
    
    # Create health check script
    cat > health-check.sh << 'EOF'
#!/bin/bash

# Health Check Script
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="./logs/health-check.log"
ALERT_EMAIL="admin@your-domain.com"

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Perform health check
response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$HEALTH_URL" || echo "000")

if [ "$response" = "200" ]; then
    log_with_timestamp "✅ Health check passed"
    exit 0
else
    log_with_timestamp "❌ Health check failed - HTTP $response"
    
    # Log response body if available
    if [ -f /tmp/health_response.json ]; then
        log_with_timestamp "Response: $(cat /tmp/health_response.json)"
    fi
    
    # Send alert (uncomment and configure if needed)
    # echo "Health check failed for Avid Explores at $(date)" | mail -s "Health Check Alert" "$ALERT_EMAIL"
    
    exit 1
fi
EOF
    
    chmod +x health-check.sh
    success "Health check script created"
}

# Setup cron jobs for monitoring
setup_cron_jobs() {
    log "Setting up cron jobs for monitoring..."
    
    # Create temporary cron file
    crontab -l > /tmp/current_cron 2>/dev/null || echo "" > /tmp/current_cron
    
    # Add health check (every 5 minutes)
    if ! grep -q "health-check.sh" /tmp/current_cron; then
        echo "*/5 * * * * cd $(pwd) && ./health-check.sh" >> /tmp/current_cron
    fi
    
    # Add log cleanup (daily at 2 AM)
    if ! grep -q "log cleanup" /tmp/current_cron; then
        echo "0 2 * * * find $(pwd)/logs -name '*.log' -mtime +30 -delete # log cleanup" >> /tmp/current_cron
    fi
    
    # Install new cron
    crontab /tmp/current_cron
    rm /tmp/current_cron
    
    success "Cron jobs configured"
}

# Setup backup monitoring
setup_backup_monitoring() {
    log "Setting up backup monitoring..."
    
    if [ "$SYSTEM_LEVEL" = true ]; then
        mkdir -p "$BACKUP_DIR"
        chown -R $USER:$USER "$BACKUP_DIR"
    else
        BACKUP_DIR="./backups"
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Create backup script
    cat > backup-monitor.sh << EOF
#!/bin/bash

# Backup Monitoring Script
BACKUP_DIR="$BACKUP_DIR"
LOG_FILE="./logs/backup.log"
RETENTION_DAYS=30

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] \$1" >> "\$LOG_FILE"
}

# Check backup directory size
backup_size=\$(du -sh "\$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
log_with_timestamp "Backup directory size: \$backup_size"

# Clean old backups
find "\$BACKUP_DIR" -name "*.tar.gz" -mtime +\$RETENTION_DAYS -delete 2>/dev/null
log_with_timestamp "Cleaned backups older than \$RETENTION_DAYS days"

# Check available disk space
available_space=\$(df -h . | awk 'NR==2 {print \$4}')
log_with_timestamp "Available disk space: \$available_space"
EOF
    
    chmod +x backup-monitor.sh
    success "Backup monitoring script created"
}

# Setup system monitoring (if root)
setup_system_monitoring() {
    if [ "$SYSTEM_LEVEL" = true ]; then
        log "Setting up system monitoring..."
        
        # Install monitoring tools if not present
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y htop iotop nethogs
        elif command -v yum &> /dev/null; then
            yum install -y htop iotop nethogs
        fi
        
        success "System monitoring tools installed"
    else
        warning "Skipping system monitoring setup (requires root privileges)"
    fi
}

# Create monitoring dashboard script
create_monitoring_dashboard() {
    log "Creating monitoring dashboard script..."
    
    cat > monitor-dashboard.sh << 'EOF'
#!/bin/bash

# Monitoring Dashboard for Avid Explores

clear
echo "🚀 Avid Explores - Monitoring Dashboard"
echo "========================================"
echo ""

# Application Status
echo "📱 Application Status:"
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "   ✅ Application is running"
    health_data=$(curl -s http://localhost:3000/api/health | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    echo "   🏥 Health Status: $health_data"
else
    echo "   ❌ Application is not responding"
fi
echo ""

# PM2 Status (if available)
if command -v pm2 &> /dev/null; then
    echo "🔧 PM2 Process Status:"
    pm2 list | grep -E "(App name|avid-explores)" || echo "   No PM2 processes found"
    echo ""
fi

# Docker Status (if available)
if command -v docker &> /dev/null; then
    echo "🐳 Docker Container Status:"
    docker ps | grep avid-explores || echo "   No Docker containers found"
    echo ""
fi

# System Resources
echo "💻 System Resources:"
echo "   CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "   Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "   Disk Usage: $(df -h . | awk 'NR==2 {print $5}')"
echo ""

# Recent Logs
echo "📋 Recent Application Logs:"
if [ -f "./logs/health-check.log" ]; then
    tail -5 ./logs/health-check.log
else
    echo "   No health check logs found"
fi
echo ""

# Database Status
echo "🗄️  Database Status:"
if curl -s http://localhost:3000/api/health | jq -e '.checks.database.status == "connected"' > /dev/null 2>&1; then
    echo "   ✅ Database connected"
    response_time=$(curl -s http://localhost:3000/api/health | jq -r '.checks.database.responseTime // "unknown"' 2>/dev/null)
    echo "   ⏱️  Response Time: $response_time"
else
    echo "   ❌ Database connection issues"
fi
echo ""

echo "Last updated: $(date)"
echo "========================================"
EOF
    
    chmod +x monitor-dashboard.sh
    success "Monitoring dashboard created"
}

# Main setup function
main() {
    log "Starting monitoring setup for Avid Explores..."
    
    check_permissions
    setup_logging
    setup_logrotate
    setup_pm2_monitoring
    setup_health_monitoring
    setup_cron_jobs
    setup_backup_monitoring
    setup_system_monitoring
    create_monitoring_dashboard
    
    success "Monitoring setup completed!"
    echo ""
    echo "📋 Available monitoring commands:"
    echo "   ./health-check.sh          - Run health check"
    echo "   ./backup-monitor.sh        - Check backup status"
    echo "   ./monitor-dashboard.sh     - View monitoring dashboard"
    echo ""
    echo "📁 Log files location: $LOG_DIR"
    echo "📁 Backup location: $BACKUP_DIR"
    echo ""
    echo "🔄 Cron jobs configured:"
    echo "   - Health check every 5 minutes"
    echo "   - Log cleanup daily at 2 AM"
}

# Run main function
main "$@"