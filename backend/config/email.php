<?php
/**
 * Mediconnect - PHPMailer Email Configuration
 * Sends transactional emails for notifications, password reset, etc.
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// PHPMailer via Composer or manual include
// if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
//     require_once __DIR__ . '/../../vendor/autoload.php';
// } else {
  require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
  require_once __DIR__ . '/../PHPMailer/src/Exception.php';
  require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
// }

// SMTP credentials (override via environment variables)
define('MAIL_HOST',       getenv('MAIL_HOST')       ?: 'smtp.gmail.com');
define('MAIL_PORT',       (int)(getenv('MAIL_PORT') ?: 465));
define('MAIL_USERNAME',   getenv('MAIL_USERNAME')   ?: 'mediconnect333@gmail.com');
define('MAIL_PASSWORD',   getenv('MAIL_PASSWORD')   ?: 'ksgm nufb akad tpzg');
define('MAIL_FROM_NAME',  getenv('MAIL_FROM_NAME')  ?: 'Mediconnect');
define('MAIL_ENCRYPTION', getenv('MAIL_ENCRYPTION') === 'starttls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS);

/**
 * Send an HTML email
 *
 * @param string $to      Recipient email
 * @param string $name    Recipient name
 * @param string $subject Email subject
 * @param string $body    HTML body
 * @return bool           True on success
 */
function sendEmail(string $to, string $name, string $subject, string $body): bool {
    try {
        $mail = new PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = MAIL_ENCRYPTION;
        $mail->Port       = MAIL_PORT;

        // Recipients
        $mail->setFrom(MAIL_USERNAME, MAIL_FROM_NAME);
        $mail->addAddress($to, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = emailLayout($subject, $body);
        $mail->AltBody = strip_tags($body);

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('[Mediconnect Mail] Failed to send to ' . $to . ': ' . $e->getMessage());
        return false;
    }
}

/**
 * Wrap email body in a consistent HTML layout
 */
function emailLayout(string $title, string $content): string {
    return <<<HTML
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>{$title}</title>
          <style>
            body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
            .container{max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)}
            .header{background:#121212;padding:28px 32px;text-align:center}
            .header h1{color:#ffffff;margin:0;font-size:22px;letter-spacing:-0.5px}
            .header span{color:#8B1E1E;font-weight:700}
            .body{padding:32px}
            .footer{padding:20px 32px;background:#f8f8f8;text-align:center;font-size:12px;color:#888}
            .btn{display:inline-block;padding:12px 28px;background:#8B1E1E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0}
            h2{color:#121212;margin-top:0}
            p{color:#444;line-height:1.6}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1><span>Medi</span>connect</h1></div>
            <div class="body">
              <h2>{$title}</h2>
              {$content}
            </div>
            <div class="footer">
              &copy; 2026 Mediconnect. All rights reserved.<br>
              This is an automated message. Please do not reply.
            </div>
          </div>
        </body>
      </html>
  HTML;
}
