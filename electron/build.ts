import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

async function buildApp() {
  try {
    console.log('Building Next.js application...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('Compiling Electron TypeScript files...');
    execSync('tsc --project electron/tsconfig.json', { stdio: 'inherit' });

    // Copy the .env file for production use
    console.log('Setting up environment configuration...');
    const envPath = path.join(process.cwd(), '.env');
    const envDistPath = path.join(process.cwd(), 'dist', '.env');
    
    if (fs.existsSync(envPath)) {
      fs.mkdirSync(path.join(process.cwd(), 'dist'), { recursive: true });
      fs.copyFileSync(envPath, envDistPath);
    }

    console.log('Building Electron app...');
    execSync('electron-builder', { stdio: 'inherit' });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
