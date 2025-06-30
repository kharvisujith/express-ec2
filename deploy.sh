# #!/bin/bash

# # EC2 Deployment Script for Simple Express API
# # Make sure to run this script on your EC2 instance

# echo "🚀 Starting deployment of Simple Express API..."

# # Update system packages
# echo "📦 Updating system packages..."
# sudo yum update -y

# # Install Node.js if not already installed
# if ! command -v node &> /dev/null; then
#     echo "📥 Installing Node.js..."
#     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
#     source ~/.bashrc
#     nvm install 20
#     nvm use 20
#     nvm alias default 20
# else
#     echo "✅ Node.js already installed"
# fi

# # Install PM2 for process management
# if ! command -v pm2 &> /dev/null; then
#     echo "📥 Installing PM2..."
#     npm install -g pm2
# else
#     echo "✅ PM2 already installed"
# fi

# # Create app directory if it doesn't exist
# APP_DIR="/home/ec2-user/simple-express-api"
# if [ ! -d "$APP_DIR" ]; then
#     echo "📁 Creating app directory..."
#     mkdir -p "$APP_DIR"
# fi

# # Navigate to app directory
# cd "$APP_DIR"

# # Install dependencies
# echo "📦 Installing dependencies..."
# npm install

# # Build the application for production
# echo "🔨 Building application for production..."
# npm run build:prod

# # Create PM2 ecosystem file
# echo "⚙️ Creating PM2 configuration..."
# cat > ecosystem.config.js << EOF
# module.exports = {
#   apps: [{
#     name: 'simple-express-api',
#     script: 'dist/server.js',
#     instances: 1,
#     autorestart: true,
#     watch: false,
#     max_memory_restart: '1G',
#     env: {
#       NODE_ENV: 'production',
#       PORT: 3000
#     },
#     error_file: './logs/err.log',
#     out_file: './logs/out.log',
#     log_file: './logs/combined.log',
#     time: true
#   }]
# };
# EOF

# # Create logs directory
# mkdir -p logs

# # Start the application with PM2
# echo "🚀 Starting application with PM2..."
# pm2 start ecosystem.config.js

# # Save PM2 configuration
# pm2 save

# # Setup PM2 to start on system boot
# pm2 startup

# echo "✅ Deployment completed!"
# echo "📊 Check application status: pm2 status"
# echo "📋 View logs: pm2 logs simple-express-api"
# echo "🌐 Application should be running on: http://your-ec2-ip:3000" 

#!/bin/bash

# Deployment Script for EC2 Instance (Git-based)
# Make sure this file is in your EC2 instance and executable (chmod +x deploy.sh)

APP_DIR="/home/ubuntu/test-app"
REPO_URL="https://github.com/kharvisujith/express-ec2.git"   # Change this!
BRANCH="production"   # Change branch name if needed

echo "\n🚀 Starting deployment..."

# Clone repo if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
  echo "📁 Cloning repository for the first time..."
  git clone -b $BRANCH $REPO_URL $APP_DIR
fi

cd $APP_DIR || { echo "❌ Failed to access app directory"; exit 1; }

# Pull latest changes
echo "⬇️ Pulling latest changes from $BRANCH..."
git reset --hard
git pull origin $BRANCH

# Install Node if not installed
if ! command -v node &> /dev/null; then
  echo "📥 Installing Node.js via NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm alias default 20
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
  echo "📥 Installing PM2..."
  npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building for production..."
npm run build:prod

# Create logs directory if missing
mkdir -p logs

# Create PM2 ecosystem file if not present
if [ ! -f "ecosystem.config.js" ]; then
  echo "⚙️ Creating PM2 ecosystem.config.js..."
  cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'simple-express-api',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

# Start/restart the app
if pm2 list | grep -q "simple-express-api"; then
  echo "🔁 Restarting app with PM2..."
  pm2 restart ecosystem.config.js
else
  echo "🚀 Starting app with PM2..."
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup | tail -n 1 | bash
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Visit your app at: http://your-ec2-ip:3000"
