import { execa } from 'execa';
import { logger } from '../ui/logger.js';

export async function isPnpmInstalled(): Promise<boolean> {
  try {
    await execa('pnpm', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export async function installDependencies(cwd: string): Promise<void> {
  const installed = await isPnpmInstalled();
  if (!installed) {
    throw new Error(
      'pnpm이 설치되어 있지 않습니다.\n설치 방법: npm install -g pnpm\n또는: https://pnpm.io'
    );
  }

  await execa('pnpm', ['install'], {
    cwd,
    stdio: 'inherit',
  });
}
