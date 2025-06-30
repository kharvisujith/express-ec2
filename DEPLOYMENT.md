# EC2 Deployment Guide

## Prerequisites

1. **EC2 Instance** running Amazon Linux 2 or Ubuntu
2. **Security Group** configured to allow:
   - SSH (port 22) - for connecting
   - HTTP (port 80) - for web traffic
   - Custom TCP (port 3000) - for your API
3. **Key Pair** (.pem file) for SSH access

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Amazon Linux 2** or **Ubuntu**
3. Select instance type (t2.micro for testing, t2.small+ for production)
4. Configure Security Group:
   ```
   SSH (22) - 0.0.0.0/0
   HTTP (80) - 0.0.0.0/0
   Custom TCP (3000) - 0.0.0.0/0
   ```
5. Launch and download your key pair (.pem file)

## Step 2: Connect to EC2 Instance

```bash
# Make your key file secure
chmod 400 your-key.pem

# Connect to your instance
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

## Step 3: Deploy Your Application

### Option A: Using the Deployment Script (Recommended)

1. **Upload your code** to EC2:
   ```bash
   # From your local machine
   scp -i your-key.pem -r . ec2-user@your-ec2-public-ip:/home/ec2-user/simple-express-api
   ```

2. **SSH into your EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   ```

3. **Run the deployment script**:
   ```bash
   cd /home/ec2-user/simple-express-api
   ./deploy.sh
   ```

### Option B: Manual Deployment

1. **Install Node.js**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

2. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

3. **Upload and setup your code**:
   ```bash
   # Navigate to app directory
   cd /home/ec2-user/simple-express-api
   
   # Install dependencies
   npm install
   
   # Build for production
   NODE_ENV=production npm run build
   ```

4. **Start with PM2**:
   ```bash
   pm2 start dist/server.js --name "simple-express-api"
   pm2 save
   pm2 startup
   ```

## Step 4: Verify Deployment

1. **Check if the app is running**:
   ```bash
   pm2 status
   pm2 logs simple-express-api
   ```

2. **Test the API**:
   ```bash
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Test API endpoints
   curl http://localhost:3000/api/users
   ```

3. **Access from browser**:
   ```
   http://your-ec2-public-ip:3000
   ```

## Step 5: Configure Nginx (Optional but Recommended)

For production, it's recommended to use Nginx as a reverse proxy:

```bash
# Install Nginx
sudo yum install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/api.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP

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

Start Nginx:
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

Now your API will be accessible on port 80:
```
http://your-ec2-public-ip
```

## Step 6: SSL Certificate (Optional)

For HTTPS, you can use Let's Encrypt:

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Useful Commands

### PM2 Commands
```bash
pm2 status                    # Check app status
pm2 logs simple-express-api   # View logs
pm2 restart simple-express-api # Restart app
pm2 stop simple-express-api   # Stop app
pm2 delete simple-express-api # Remove app from PM2
```

### Nginx Commands
```bash
sudo systemctl status nginx   # Check Nginx status
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t                 # Test Nginx configuration
```

### Application Commands
```bash
# View application logs
tail -f /home/ec2-user/simple-express-api/logs/combined.log

# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Monitor system resources
htop
```

## Troubleshooting

### Application not starting
```bash
# Check PM2 logs
pm2 logs simple-express-api

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Check Node.js version
node --version
```

### Can't access from outside
1. Check Security Group settings
2. Verify the app is running: `pm2 status`
3. Test locally: `curl http://localhost:3000/health`

### Permission issues
```bash
# Fix file permissions
sudo chown -R ec2-user:ec2-user /home/ec2-user/simple-express-api
chmod +x deploy.sh
```

## Environment Variables

You can set environment variables in the PM2 ecosystem file or use:

```bash
# Set environment variables
export NODE_ENV=production
export PORT=3000

# Or in PM2 ecosystem
pm2 restart simple-express-api --update-env
```

## Monitoring

Consider setting up monitoring:
- **CloudWatch** for AWS metrics
- **PM2 Plus** for application monitoring
- **Uptime Robot** for uptime monitoring

Your API is now deployed and ready to use! 🚀 