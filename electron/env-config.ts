import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export interface EnvConfig {
  MAIN_DOMAIN: string;
  ADMIN_DOMAIN: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  DIRECT_URL: string;
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  NEXT_PUBLIC_APPWRITE_ENDPOINT: string;
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: string;
  APPWRITE_API_KEY: string;
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: string;
  STRIPE_API_KEY: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
}

export function loadEnvConfig(): EnvConfig {
  let envPath: string;

  if (process.env.NODE_ENV === 'production') {
    envPath = path.join(__dirname, '.env.production');
  } else {
    envPath = path.join(process.cwd(), '.env');
  }

  console.log(`🔹 Loading environment variables from: ${envPath}`);

  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    process.env = { ...process.env, ...envConfig };
  } else {
    console.error(`❌ ERROR: Missing .env file at ${envPath}`);
    process.exit(1);
  }

  const requiredVars: (keyof EnvConfig)[] = [
    'MAIN_DOMAIN',
    'ADMIN_DOMAIN',
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'REFRESH_SECRET'
  ];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(`❌ ERROR: Missing required environment variable: ${key}`);
    }
  }

  return {
    MAIN_DOMAIN: process.env.MAIN_DOMAIN!,
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN!,
    NODE_ENV: process.env.NODE_ENV!,
    DATABASE_URL: process.env.DATABASE_URL!,
    DIRECT_URL: process.env.DIRECT_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY!,
    NEXT_PUBLIC_APPWRITE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: process.env.SMTP_PORT!,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    SMTP_FROM: process.env.SMTP_FROM!
  };
}