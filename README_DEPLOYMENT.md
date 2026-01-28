# Quick Deployment Guide

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Setup
```bash
git clone YOUR_REPO_URL
cd nbharat24
cp .envs.example .env
nano .env  # Update with your values
```

### 2. Start Services
```bash
docker compose up -d --build
```

### 3. Access Application
- **App**: http://YOUR_SERVER_IP:8000
- **Admin**: http://YOUR_SERVER_IP:8000/dashboard

---

## 📋 What's Included

✅ **Docker Setup**
- Multi-stage optimized Dockerfile
- Docker Compose with PostgreSQL
- Persistent volumes for database and media

✅ **Production Ready**
- Nginx reverse proxy configuration
- SSL/HTTPS ready
- Health checks
- Auto-restart on failure

✅ **Data Persistence**
- Database data survives restarts
- Media uploads persist across deployments
- Automatic backups support

✅ **Security**
- Non-root user in containers
- Rate limiting
- Security headers
- Environment variable protection

---

## 📁 File Structure

```
.
├── Dockerfile                 # Production Docker image
├── docker-compose.yml         # Main compose file (app + database)
├── docker-compose.prod.yml    # Production with Nginx
├── nginx.conf                 # Nginx reverse proxy config
├── .dockerignore              # Docker build exclusions
├── .envs.example              # Environment variables template
├── DEPLOYMENT.md              # Complete deployment guide
└── scripts/
    └── start.sh              # Startup script with migrations
```

---

## 🔧 Common Commands

### Start Services
```bash
docker compose up -d
```

### View Logs
```bash
docker compose logs -f
```

### Restart
```bash
docker compose restart
```

### Update Application
```bash
git pull
docker compose up -d --build
```

### Backup Database
```bash
docker compose exec postgres pg_dump -U postgres n24_db_prod > backup.sql
```

---

## 📖 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide including:
- Digital Ocean setup
- SSL/HTTPS configuration
- Monitoring and maintenance
- Troubleshooting
- Security checklist

---

## ⚠️ Important Notes

1. **Change Default Passwords**: Update admin credentials in `.env` and change after first login
2. **Generate Secrets**: Use `openssl rand -base64 32` for JWT_SECRET and NEXTAUTH_SECRET
3. **Update URLs**: Replace localhost URLs with your domain/IP in `.env`
4. **Database Host**: For Docker, use `postgres` as database hostname (service name)
5. **Media Storage**: Automatically persisted in Docker volume `media_storage`

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Verify environment: `docker compose exec app env | grep -E 'DATABASE|JWT'`
3. Test database: `docker compose exec postgres psql -U postgres -d n24_db_prod`
4. See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section

---

**Made with ❤️ for production deployment**
