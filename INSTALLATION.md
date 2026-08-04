# Installation Guide — Mediconnect

This guide walks you through setting up Mediconnect on a local machine (XAMPP, WAMP, Laragon, or plain Apache + PHP).

---

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| PHP         | 8.0            |
| MySQL       | 8.0            |
| Node.js     | 18.x           |
| pnpm        | 8.x            |
| Web server  | Apache 2.4 / Nginx 1.18 |
| Composer    | 2.x (optional — for PHPMailer via Composer) |

---

## Step 1 — Clone / Download Project

```bash
# If using git
git clone https://github.com/yourname/mediconnect.git
cd mediconnect
```

Or extract the ZIP archive into your web server's root (e.g. `C:/xampp/htdocs/mediconnect/`).

---

## Step 2 — Create the Database

Open **phpMyAdmin** or MySQL CLI and run:

```bash
mysql -u root -p < backend/database/schema.sql
```

This will:
- Create the `mediconnect` database
- Create all 14 tables with proper foreign keys
- Seed default departments (10)
- Insert the default admin account

---

## Step 3 — Configure the Backend

### Option A: Environment Variables (recommended for production)

Set these in your `.env` or server environment:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mediconnect
DB_USER=root
DB_PASS=yourpassword

APP_URL=http://localhost/mediconnect/backend
FRONTEND_URL=http://localhost:5173

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_NAME=Mediconnect
MAIL_ENCRYPTION=tls
```

### Option B: Direct Edit

Edit the defaults directly in:
- `backend/config/database.php` — DB credentials
- `backend/config/constants.php` — APP_URL, FRONTEND_URL
- `backend/config/email.php` — SMTP settings

---

## Step 4 — Install PHPMailer

### Via Composer (recommended)

```bash
cd backend
composer require phpmailer/phpmailer
```

### Manual Installation

1. Download PHPMailer from https://github.com/PHPMailer/PHPMailer
2. Place the files in `backend/component/PHPMailer/`
   - `PHPMailer.php`
   - `SMTP.php`
   - `Exception.php`

---

## Step 5 — Configure Web Server

### Apache (.htaccess — place in `backend/`)

```apache
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [L]
```

Enable `mod_rewrite` in Apache config.

### XAMPP Virtual Host Example

```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/mediconnect/backend"
    ServerName api.mediconnect.local
    <Directory "C:/xampp/htdocs/mediconnect/backend">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Add `127.0.0.1 api.mediconnect.local` to your `hosts` file.

---

## Step 6 — Set Upload Directory Permissions

```bash
chmod -R 755 backend/uploads/
chmod -R 755 backend/logs/
```

On Windows with XAMPP, ensure the folder is not read-only.

---

## Step 7 — Install Frontend Dependencies

```bash
# From project root
pnpm install
```

---

## Step 8 — Configure Frontend API URL

Edit `src/service/api.ts`:

```typescript
// Change this to your backend URL
const BASE_URL = 'http://localhost/mediconnect/backend/index.php';
```

Or set `VITE_API_URL` in `.env`:

```env
VITE_API_URL=http://localhost/mediconnect/backend/index.php
```

---

## Step 9 — Start the Development Server

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

---

## Step 10 — Login

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@mediconnect.com    | Admin@1234  |

To create Doctor/Patient accounts, use the Register page or Admin panel.

---

## Production Checklist

- [ ] Change default admin password
- [ ] Set `display_errors = Off` in `php.ini`
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set `session.cookie_secure = true` and `session.cookie_httponly = true`
- [ ] Set CORS `Access-Control-Allow-Origin` to your exact frontend domain
- [ ] Configure real SMTP credentials for email delivery
- [ ] Set up daily MySQL backups
- [ ] Review file upload max sizes in `php.ini` (`upload_max_filesize`, `post_max_size`)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS errors in browser | Ensure `FRONTEND_URL` in backend config matches exactly (including port) |
| Session not persisting | Check `session.cookie_samesite` and ensure frontend/backend on same domain or subdomains |
| File uploads failing | Verify `uploads/` directory exists and is writable |
| Emails not sending | Test SMTP credentials with a standalone PHPMailer script |
| 404 on API | Ensure `.htaccess` is present and `mod_rewrite` is enabled |
| Database error on login | Verify DB credentials in `backend/config/database.php` |
