# Simple Express API with TypeScript

A simple Express.js API built with TypeScript that provides CRUD operations for users with hardcoded data and environment-based configuration.

## Features

- ✅ TypeScript support
- ✅ Express.js framework
- ✅ CORS enabled
- ✅ 4 CRUD endpoints (GET, POST, PUT, DELETE)
- ✅ Hardcoded data (no database required)
- ✅ Error handling
- ✅ Input validation
- ✅ Health check endpoint
- ✅ Environment-based configuration

## Configuration

The app uses the `config` package for environment-based configuration:

### Configuration Files
- `config/default.json` - Default configuration
- `config/localDevelopment.json` - Local development settings
- `config/production.json` - Production settings
- `config/custom-environment-variables.json` - Environment variable mapping

### Environment Variables
You can override config values using environment variables:
- `PORT` - Server port
- `CORS_ENABLED` - Enable/disable CORS
- `NODE_ENV` - Set environment (localDevelopment/production)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/health` | Health check |
| GET | `/` | API documentation |

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the files
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server with local development config:
```bash
npm run dev
# or
npm run dev:local
```

Run with production config for testing:
```bash
npm run dev:prod
```

### Production

Build the TypeScript code:
```bash
npm run build
# or for specific environment
npm run build:local
npm run build:prod
```

Start the production server:
```bash
npm start
```

## Environment Configuration

### Local Development (default)
- Port: 3000
- CORS: Enabled
- Environment: localDevelopment

### Production
- Port: 8080
- CORS: Enabled
- Environment: production

### Using Environment Variables
```bash
# Override port
PORT=4000 npm run dev

# Disable CORS
CORS_ENABLED=false npm run dev

# Set environment
NODE_ENV=production npm run dev
```

## API Usage Examples

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Get user by ID
```bash
curl http://localhost:3000/api/users/1
```

### Create new user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "age": 29
  }'
```

### Update user
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "age": 31
  }'
```

### Delete user
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

## Data Structure

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}
```

## Deployment to EC2

### 1. Launch EC2 Instance
- Use Amazon Linux 2 or Ubuntu
- Configure security group to allow HTTP (port 80) and HTTPS (port 443)
- For development, also allow port 3000

### 2. Connect to EC2 Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. Install Node.js
```bash
# For Amazon Linux 2
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# For Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Deploy Application
```bash
# Clone or upload your code
git clone <your-repo-url>
cd simple-express-api

# Install dependencies
npm install

# Build the application for production
NODE_ENV=production npm run build

# Start the application
NODE_ENV=production npm start
```

### 5. Run as Service (Optional)
Create a systemd service to run the application automatically:

```bash
sudo nano /etc/systemd/system/express-api.service
```

Add the following content:
```ini
[Unit]
Description=Express API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/simple-express-api
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable express-api
sudo systemctl start express-api
sudo systemctl status express-api
```

### 6. Configure Nginx (Optional)
For production, you might want to use Nginx as a reverse proxy:

```bash
sudo yum install nginx -y  # Amazon Linux 2
# or
sudo apt-get install nginx -y  # Ubuntu

sudo nano /etc/nginx/sites-available/express-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/express-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables

- `PORT`: Server port (default: 3000 for local, 8080 for production)
- `CORS_ENABLED`: Enable/disable CORS (default: true)
- `NODE_ENV`: Environment (localDevelopment/production)

## License

MIT 