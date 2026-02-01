# Digital Ocean Production Deployment Guide

Complete, step‑by‑step guide to deploy **Bawal** to Digital Ocean using **Docker, PostgreSQL, and Nginx**.

Use this when you want a **repeatable single‑server production setup** with clear commands you can copy‑paste.

## Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- SSH access to your server
- Git repository access

## Step 1: Create Digital Ocean Droplet

1. Log in to [Digital Ocean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (minimum 2GB RAM, 1 vCPU recommended)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or password
4. Click **Create Droplet**
5. Note your droplet's IP address

## Step 2: Connect to Server

```bash
# Connect via SSH (replace with your IP and user)
ssh root@159.89.170.164

# Or if using a non-root user
ssh your_username@YOUR_SERVER_IP
```

## Step 3: Initial Server Setup

### Update system packages
```bash
apt update && apt upgrade -y
```

### Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Install Git
```bash
apt install git -y
```

### Create application directory
```bash
mkdir -p /var/www/bawal-production
cd /var/www/bawal-production
```
docker compose restart app
## Step 4: Clone Repository

```bash
# Clone your repository
git clone https://github.com/GHOST-ALPHA/naxatranews-live.git .

# Or if using private repo with SSH
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git .
```

## Step 5: Setup Environment Variables

```bash
# Copy example environment file
cp .envs.example .env

# Edit environment file
nano .env
```

Update the following variables in `.env`:

```env
# Database (will be used by docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
POSTGRES_DB=n24_db_prod

# Application Database URL (matches docker-compose service name)
DATABASE_URL="postgresql://postgres:CHANGE_THIS_STRONG_PASSWORD@postgres:5432/n24_db_prod?schema=public"

# JWT Secret (generate a new one)
JWT_SECRET="YOUR_GENERATED_JWT_SECRET_MIN_32_CHARS"
JWT_EXPIRES_IN="7d"

# Application URLs (replace with your domain or IP)
NODE_ENV="production"
NEXTAUTH_URL="http://YOUR_DOMAIN_OR_IP"
APP_URL="http://YOUR_DOMAIN_OR_IP"
NEXT_PUBLIC_BASE_URL="http://YOUR_DOMAIN_OR_IP"
NEXTAUTH_SECRET="YOUR_GENERATED_NEXTAUTH_SECRET"

# OAuth (optional - configure if needed)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WHATSAPP_CLIENT_ID="your-whatsapp-client-id"
WHATSAPP_CLIENT_SECRET="your-whatsapp-client-secret"

# Default Admin (change after first login)
DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="CHANGE_THIS_STRONG_PASSWORD"
```

**Generate secure secrets:**
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 6: Build and Start Services

### Option A: Without Nginx (Direct Access on Port 8000)

```bash
# Build and start containers
docker compose up -d --build

# View logs
docker compose logs -f
```

### Option B: With Nginx (Recommended for Production)

```bash
# Create nginx SSL directory (for future SSL setup)
mkdir -p nginx/ssl

# Start with nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View logs
docker compose logs -f
```

## Step 7: Verify Deployment

### Check running containers
```bash
docker compose ps
```

You should see:
- `nbharat24_postgres` (database)
- `nbharat24_app` (Next.js application)
- `nbharat24_nginx` (if using nginx)

### Check application health
```bash
# From server
curl http://localhost:8000/api/health

# Or from your browser
http://YOUR_SERVER_IP:8000/api/health
```

### Check database connection
```bash
# Connect to database container
docker compose exec postgres psql -U postgres -d n24_db_prod -c "SELECT version();"
```

## Step 8: Setup Nginx (If not using docker-compose.prod.yml)

### Install Nginx
```bash
apt install nginx -y
```

### Create Nginx configuration
```bash
nano /etc/nginx/sites-available/bawal-production
```

Paste the configuration from `nginx.conf` and update:
- Replace `server_name _;` with your domain name
- Update upstream server if needed

### Enable site
```bash
ln -s /etc/nginx/sites-available/bawal-production /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t  # Test configuration
systemctl restart nginx
```

## Step 9: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 10: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# live
certbot --nginx -d nbharat24.com -d www.nbharat24.com

# Auto-renewal is set up automatically
certbot renew --dry-run
```

Update your `.env` file with HTTPS URLs:
```env
NEXTAUTH_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

Restart application:
```bash
docker compose restart app
```

## Step 11: Initial Database Setup

The application will automatically run migrations on startup. To manually seed the database:

```bash
# Run database seed (creates default admin user)
docker compose exec app npm run db:seed
```

## Step 12: Access Your Application

1. **Admin Dashboard**: `http://YOUR_DOMAIN/dashboard`
2. **Default Admin Login**:
   - Email: As set in `DEFAULT_ADMIN_EMAIL`
   - Username: As set in `DEFAULT_ADMIN_USERNAME`
   - Password: As set in `DEFAULT_ADMIN_PASSWORD`

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

## Maintenance Commands

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f nginx
```

### Restart services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
```

### Update application
```bash
cd /var/www/nbharat24
git pull
docker compose up -d --build
```

### Backup database
```bash
# Create backup
docker compose exec postgres pg_dump -U postgres n24_db_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U postgres n24_db_prod < backup_YYYYMMDD_HHMMSS.sql
```

### Backup media files

**Important**: These backup commands use read-only volume mounts and temporary containers, so they won't affect your running production application.

```bash
# First, check your actual volume names (Docker Compose prefixes with project name)
docker volume ls | grep storage
# Example output: nbharat24_media_storage, nbharat24_thumbnails_storage

# Create backup directory
mkdir -p /var/www/nbharat24/backups

# Option 1: Use actual volume names directly (recommended - copy from docker volume ls output)
# Backup media storage volume (read-only, safe for production)
docker run --rm \
  -v nbharat24_media_storage:/data:ro \
  -v /var/www/nbharat24/backups:/backup \
  alpine tar czf /backup/media_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Backup thumbnails storage volume (read-only, safe for production)
docker run --rm \
  -v nbharat24_thumbnails_storage:/data:ro \
  -v /var/www/nbharat24/backups:/backup \
  alpine tar czf /backup/thumbnails_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Option 2: Use variable (set PROJECT_NAME first)
# PROJECT_NAME="nbharat24"  # Replace with your actual project name
# docker run --rm \
#   -v ${PROJECT_NAME}_media_storage:/data:ro \
#   -v /var/www/nbharat24/backups:/backup \
#   alpine tar czf /backup/media_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Or backup both volumes in one command (using actual volume names)
docker run --rm \
  -v nbharat24_media_storage:/media:ro \
  -v nbharat24_thumbnails_storage:/thumbnails:ro \
  -v /var/www/nbharat24/backups:/backup \
  alpine sh -c "tar czf /backup/complete_media_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /media . -C /thumbnails ."

# List backups
ls -lh /var/www/nbharat24/backups/
```

**Download backup to local system** (run from your local machine):
```bash
# Download a specific backup file
scp root@YOUR_SERVER_IP:/var/www/nbharat24/backups/media_backup_20251224_164900.tar.gz ./

# Or download all backups
scp root@YOUR_SERVER_IP:/var/www/nbharat24/backups/*.tar.gz ./

scp root@159.89.170.164:/var/www/nbharat24/backups/*.tar.gz ./

# If using a non-root user
scp your_username@YOUR_SERVER_IP:/var/www/nbharat24/backups/media_backup_20251224_164900.tar.gz ./

# Example with actual IP (replace with your server IP)
# scp root@159.89.170.164:/var/www/nbharat24/backups/media_backup_20251224_164900.tar.gz ./
```

**Upload backup to server** (run from your local machine, if you have a backup locally):
```bash
# Upload a backup file to the server
scp ./media_backup_20251224_164900.tar.gz root@YOUR_SERVER_IP:/var/www/nbharat24/backups/

# Example with actual IP
# scp ./media_backup_20251224_164900.tar.gz root@159.89.170.164:/var/www/nbharat24/backups/
```

**Restore media files** (use with caution - stops app temporarily):
```bash
# Stop the app service (to prevent writes during restore)
docker compose stop app

# Restore media storage (replace YYYYMMDD_HHMMSS with actual backup filename)
docker run --rm \
  -v nbharat24_media_storage:/data \
  -v /var/www/nbharat24/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/media_backup_YYYYMMDD_HHMMSS.tar.gz -C /data"

# Restore thumbnails storage (replace YYYYMMDD_HHMMSS with actual backup filename)
docker run --rm \
  -v nbharat24_thumbnails_storage:/data \
  -v /var/www/nbharat24/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/thumbnails_backup_YYYYMMDD_HHMMSS.tar.gz -C /data"

# Restart the app
docker compose start app
```

**Note**: Replace `YYYYMMDD_HHMMSS` with the actual backup filename timestamp.

### Check disk usage
```bash
docker system df
df -h
```

### Clean up unused Docker resources
```bash
docker system prune -a --volumes
```

## Troubleshooting

### Application won't start
```bash
# Check logs
docker compose logs app

# Check if database is ready
docker compose ps postgres

# Restart services
docker compose restart
```

### Database connection errors
```bash
# Verify database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec app npx prisma db push
```

### Media uploads not working
```bash
# Check storage volume
docker volume inspect nbharat24_media_storage

# Check permissions
docker compose exec app ls -la /app/public/storage
```

### Port already in use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process or change port in docker-compose.yml
```

## Security Checklist

- [ ] Changed default admin credentials
- [ ] Generated strong JWT_SECRET and NEXTAUTH_SECRET
- [ ] Changed database password
- [ ] Setup SSL/HTTPS
- [ ] Configured firewall (UFW)
- [ ] Disabled root SSH login (optional but recommended)
- [ ] Setup automatic security updates
- [ ] Regular backups configured

## Monitoring

### Setup automatic updates
```bash
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

### Monitor resource usage
```bash
# CPU and memory
htop

# Docker stats
docker stats
```

## Support

For issues or questions:
1. Check application logs: `docker compose logs -f`
2. Check system logs: `journalctl -xe`
3. Verify environment variables: `docker compose exec app env | grep -E 'DATABASE|JWT|NEXTAUTH'`

---

**Last Updated**: 2024
**Version**: 1.0.0
