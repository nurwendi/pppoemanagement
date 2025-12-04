---
description: How to deploy the User Management application on Ubuntu Server
---

# Deploying to Ubuntu Server

This guide outlines the steps to deploy the User Management application on a fresh Ubuntu Server.

## 1. Prerequisites

Ensure your server is up to date:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Node.js (v20 LTS recommended)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node -v
npm -v
```

## 3. Install PM2 (Process Manager)

PM2 is used to keep your application running in the background.
```bash
sudo npm install -g pm2
```

## 4. Setup Project

You can upload your project files to the server (e.g., via SCP or Git).
Assuming you are in the project directory `/var/www/user-management`:

```bash
# Create directory
sudo mkdir -p /var/www/user-management
sudo chown -R $USER:$USER /var/www/user-management

# Navigate to directory
cd /var/www/user-management

# (Upload your files here, excluding node_modules and .next)
```

## 5. Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## 6. Start Application with PM2

```bash
# Start the app
pm2 start npm --name "user-mgmt" -- start

# Save PM2 list to respawn on reboot
pm2 save
pm2 startup
```

## 7. Configure Apache2 (Reverse Proxy)

Install Apache2:
```bash
sudo apt install apache2 -y
```

Enable required modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

Create a configuration file:
```bash
sudo nano /etc/apache2/sites-available/user-management.conf
```

Paste the following configuration (replace `your_domain_or_ip`):
```apache
<VirtualHost *:80>
    ServerName your_domain_or_ip

    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia Full

    <Proxy *>
        Require all granted
    </Proxy>

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

Enable the site and restart Apache2:
```bash
sudo a2ensite user-management.conf
sudo systemctl restart apache2
```

## 8. Configure Firewall (UFW)

```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 9. Access the Application

Open your browser and navigate to `http://your_domain_or_ip`.
