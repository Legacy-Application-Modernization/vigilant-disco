# Legacy Modernization Platform

AI-powered platform for modernizing legacy applications from PHP to Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Git

## 📦 Installation & Setup

### 1️⃣ Local Development Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Legacy-Application-Modernization/vigilant-disco.git
cd vigilant-disco
```

#### Step 2: Install Dependencies
```bash
npm run install:all
```

#### Step 3: Environment Configuration

**Backend Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/legacy_modernization_dev"
REDIS_URL="redis://localhost:6379"
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
```

**Frontend Client (.env.development)**
```bash
cd client
cp .env.example .env.development
```

Edit `client/.env.development`:
```env
VITE_API_URL=http://localhost:3001
VITE_BACKEND_API_URL=http://127.0.0.1:8000
VITE_APP_ENV=development
VITE_MCP_API_URL=http://localhost:3001
VITE_MCP_API_KEY=dev-key
VITE_ENABLE_ANALYTICS=false
```

#### Step 4: Start Database Services
```bash
npm run db:start
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Adminer (DB admin UI) on port 8080

#### Step 5: Run Database Migrations
```bash
npm run db:migrate
```

#### Step 6: Start Development Servers
```bash
npm run dev
```

This starts:
- **Backend Server**: http://localhost:3001
- **Frontend Client**: http://localhost:5173
- **Backend API (Python)**: Should run separately on http://127.0.0.1:8000
- **MCP Server**: (if configured)

#### Step 7: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Adminer (DB): http://localhost:8080

---

### 1️⃣ EC2 Instance Setup

#### Connect to EC2
```bash
ssh -i your-key.pem ubuntu@ec2-100-26-196-182.compute-1.amazonaws.com
```

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Logout and login again for docker group to take effect
exit
```

### 2️⃣ Deploy Application

#### Clone Repository
```bash
ssh -i your-key.pem ubuntu@ec2-100-26-196-182.compute-1.amazonaws.com
cd ~
git clone https://github.com/Legacy-Application-Modernization/vigilant-disco.git
cd vigilant-disco
```

#### Install Dependencies
```bash
npm run install:all
```

#### Configure Environment Variables

**Server Environment**
```bash
cd server
cp .env.example .env
nano .env
```

```env
DATABASE_URL="postgresql://postgres:your-secure-password@localhost:5432/legacy_modernization_prod"
REDIS_URL="redis://localhost:6379"
NODE_ENV=production
PORT=3001
JWT_SECRET=your-very-secure-production-secret
FRONTEND_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com
```

**Client Environment**
```bash
cd ../client
cp .env.example .env.production
nano .env.production
```

```env
VITE_API_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com:3001
VITE_BACKEND_API_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com:8000
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

#### Start Database Services
```bash
cd ~/vigilant-disco
docker-compose up -d
```

#### Run Migrations
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

#### Build Applications
```bash
cd ~/vigilant-disco
npm run build
```

#### Start Services with PM2

**Backend Server**
```bash
cd ~/vigilant-disco/server
pm2 start dist/index.js --name "legacy-server"
```

**Frontend (using serve)**
```bash
cd ~/vigilant-disco/client
npm install -g serve
pm2 start "serve -s dist -l 8080" --name "legacy-client"
```

**Save PM2 Configuration**
```bash
pm2 save
pm2 startup
```

### 3️⃣ Configure Nginx (Optional but Recommended)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/legacy-app
```

```nginx
server {
    listen 80;
    server_name ec2-100-26-196-182.compute-1.amazonaws.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Python Backend
    location /analysis {
        proxy_pass http://localhost:8000;
    }

    location /migration {
        proxy_pass http://localhost:8000;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/legacy-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4️⃣ Configure Security Groups

In AWS Console, allow inbound traffic:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH - restricted to your IP)
- Port 3001 (Backend API - if not using Nginx)
- Port 8080 (Frontend - if not using Nginx)
- Port 8000 (Python Backend - if not using Nginx)

---

## 🐳 Docker Deployment

### Local Docker Build
```bash
cd client
cp .env.docker .env
docker-compose up --build
```

### Production Docker Build
```bash
cd client
cat > .env << EOF
VITE_API_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com:3001
VITE_BACKEND_API_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com:8000
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
EOF

docker-compose up --build -d
```

---

## 📋 Useful Commands

### Development
```bash
npm run dev              # Start all services
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only
npm run db:start         # Start database services
npm run db:stop          # Stop database services
npm run db:studio        # Open Prisma Studio
```

### Production
```bash
pm2 list                 # List all processes
pm2 logs                 # View logs
pm2 restart all          # Restart all services
pm2 stop all             # Stop all services
pm2 delete all           # Delete all processes
```

### Database
```bash
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio
```

---

## 🔧 Environment Variables

### Backend API Endpoints

**Local Development:**
- Node.js API: `http://localhost:3001`
- Python Backend: `http://127.0.0.1:8000`

**Production (EC2):**
- Node.js API: `http://ec2-100-26-196-182.compute-1.amazonaws.com:3001`
- Python Backend: `http://ec2-100-26-196-182.compute-1.amazonaws.com:8000`

### API Endpoints
- `/analysis/analyze_repository` - Analyze PHP repository
- `/migration/create_migration_plan` - Create migration plan
- `/migration/convert_codebase` - Convert codebase

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# Restart database
npm run db:stop && npm run db:start
```

### PM2 Issues
```bash
# View logs
pm2 logs legacy-server --lines 100
# Restart service
pm2 restart legacy-server
```

---

## 📚 Project Structure

```
vigilant-disco/
├── client/              # React frontend
├── server/              # Node.js backend
├── mcp-server/          # MCP server
├── docker-compose.yml   # Database services
└── package.json         # Root package file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details
