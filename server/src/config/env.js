import 'dotenv/config';

export function validateEnv() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`\nMissing required settings in server/.env: ${missing.join(', ')}`);
    console.error('Copy server/.env.example to server/.env and fill in the values.\n');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('\nJWT_SECRET must be at least 32 characters long.\n');
    process.exit(1);
  }
}
