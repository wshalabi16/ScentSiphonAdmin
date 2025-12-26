// lib/adminEmails.js

// Load admin emails from environment variable
// Format: Comma-separated list of emails in ADMIN_EMAILS env var
// Example: "email1@example.com,email2@example.com"

// 🔍 DEBUG LOGGING - Remove these after finding the issue
console.log('🔍 DEBUG - Raw ADMIN_EMAILS env var:', process.env.ADMIN_EMAILS);
console.log('🔍 DEBUG - Type of env var:', typeof process.env.ADMIN_EMAILS);

export const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : [];

// 🔍 DEBUG LOGGING - Shows the parsed array
console.log('🔍 DEBUG - Parsed adminEmails array:', adminEmails);
console.log('🔍 DEBUG - Array length:', adminEmails.length);
if (adminEmails.length > 0) {
  console.log('🔍 DEBUG - First email in array:', adminEmails[0]);
}