// Load admin emails from environment variable
// Format: Comma-separated list of emails in ADMIN_EMAILS env var
// Example: "email1@example.com,email2@example.com"
export const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : [];