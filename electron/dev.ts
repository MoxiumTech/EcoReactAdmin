import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function startDev() {
  try {
    // First compile TypeScript files
    console.log('Compiling TypeScript files...');
    const tsc = spawn('tsc', ['--project', 'electron/tsconfig.json'], {
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      tsc.on('close', (code) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error(`TypeScript compilation failed with code ${code}`));
        }
      });
    });

    // Create a .env file in the build directory if it doesn't exist
    const envPath = path.join(process.cwd(), '.env');
    const buildEnvPath = path.join(process.cwd(), 'build', 'electron', '.env');
    
    if (fs.existsSync(envPath)) {
      fs.mkdirSync(path.join(process.cwd(), 'build', 'electron'), { recursive: true });
      fs.copyFileSync(envPath, buildEnvPath);
    }

    console.log('Starting Next.js development server...');
    const next = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait for Next.js server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Starting Electron...');
    const electron = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      next.kill();
      electron.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('Development startup failed:', error);
    process.exit(1);
  }
}

startDev();
