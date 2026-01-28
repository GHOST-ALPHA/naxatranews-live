# 🚀 Quick Start - Digital Ocean Deployment

## Prerequisites Checklist
- [ ] Digital Ocean account
- [ ] Droplet created (Ubuntu 22.04, 2GB+ RAM)
- [ ] SSH access to server
- [ ] Domain name (optional)

---

## Step-by-Step Deployment

### 1️⃣ Connect to Server
```bash
ssh root@YOUR_SERVER_IP
```

### 2️⃣ Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y
```

### 3️⃣ Clone Repository
```bash
mkdir -p /var/www/nbharat24
cd /var/www/nbharat24
git clone YOUR_REPO_URL .
```

### 4️⃣ Setup Environment
```bash
cp .envs.example .env
nano .env
```

**Required Changes:**
- `POSTGRES_PASSWORD` - Strong password
- `DATABASE_URL` - Use `postgres` as hostname
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your domain/IP
- `APP_URL` - Your domain/IP
- `NEXT_PUBLIC_BASE_URL` - Your domain/IP
- `DEFAULT_ADMIN_PASSWORD` - Strong password

### 5️⃣ Start Application
```bash
docker compose up -d --build
```

### 6️⃣ Check Status
```bash
docker compose ps
docker compose logs -f
```

### 7️⃣ Access Application
- **Website**: http://YOUR_SERVER_IP:8000
- **Admin**: http://YOUR_SERVER_IP:8000/dashboard
- **Health**: http://YOUR_SERVER_IP:8000/api/health

---

## 🔒 With Nginx (Recommended)

### Start with Nginx
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Setup SSL (Let's Encrypt)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

Update `.env` with HTTPS URLs and restart:
```bash
docker compose restart app
```

---

## 📊 Verify Everything Works

```bash
# Check containers
docker compose ps

# Check database
docker compose exec postgres psql -U postgres -d n24_db_prod -c "SELECT 1;"

# Check application
curl http://localhost:8000/api/health

# Check logs
docker compose logs -f app
```

---

## 🔄 Update Application

```bash
cd /var/www/nbharat24
git pull
docker compose up -d --build
```

---

## 💾 Backup

### Database Backup
```bash
docker compose exec postgres pg_dump -U postgres n24_db_prod > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker compose exec -T postgres psql -U postgres n24_db_prod < backup_YYYYMMDD.sql
```

---

## 🆘 Troubleshooting

### Application won't start
```bash
docker compose logs app
docker compose restart
```

### Database connection error
```bash
docker compose ps postgres
docker compose logs postgres
```

### Port already in use
```bash
# Change port in docker-compose.yml or kill process
lsof -i :8000
```

---

## 📚 More Help

- Full Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Quick Reference: [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)

---

**✅ You're all set! Your application is now live.**
