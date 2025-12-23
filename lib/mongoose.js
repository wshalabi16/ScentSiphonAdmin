import mongoose from 'mongoose';

// Validate required environment variables on module load
const requiredEnvVars = [
  'MONGODB_URI',
  'GOOGLE_ID',
  'GOOGLE_SECRET',
  'S3_ACCESS_KEY',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
  'NEXTAUTH_SECRET'
];

if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('NEXTAUTH_URL');
}

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export function mongooseConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    } else {
        const uri = process.env.MONGODB_URI;
        return mongoose.connect(uri);
    }
}