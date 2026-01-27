# Nebula Proxy 🌌

A premium, browser-based web proxy portal with a modern glassmorphism UI.

## Features
- **Clientless**: Works entirely in the browser (no browser config needed).
- **App Icons**: One-click access to popular sites.
- **Privacy**: Hides your definition from the target site.
- **Glass UI**: Beautiful dark mode aesthetic.

## Deployment on AWS EC2 (Ubuntu)

1.  **Launch Instance**: Start a `t2.micro` Ubuntu instance on AWS.
2.  **Security Group**: Allow Inbound traffic on ports `80` (HTTP) and `22` (SSH).
3.  **Connect**: SSH into your instance.
    ```bash
    ssh -i your-key.pem ubuntu@ec2-3-92-139-4.compute-1.amazonaws.com
    ```
4.  **Run Setup**:
    Run this one-liner to download and install everything (replace with your actual repo URL if different):
    ```bash
    wget https://raw.githubusercontent.com/gpsite/gp-proxy/main/setup.sh && chmod +x setup.sh && ./setup.sh
    ```
    *Note: This assumes the `setup.sh` is in the root of the repo.*

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm start
    ```
3.  Open `http://localhost:8080`

## Architecture
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JS.
- **Backend**: Node.js + Express.
- **Proxy Engine**: `unblocker`.
- **Web Server**: Nginx (Reverse Proxy).

## Enabling HTTPS 🔒

### Option A: I have a Custom Domain (Recommended)
If you own a domain (e.g., `myproxy.com`) and have pointed it to your EC2 IP:
1.  Run `sudo apt install certbot python3-certbot-nginx`
2.  Run `sudo certbot --nginx -d yourdomain.com`
3.  Follow the prompts.

## How to Update 🔄

To update your live site after pushing changes to GitHub:

1.  SSH into your server.
2.  Run the update script:
    ```bash
    ./update.sh
    ```
    *(If you don't have this script yet, run `git pull` manually first).*

