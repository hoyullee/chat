import { execa } from 'execa';
import path from 'path';
import type { Platform } from '../types/project.js';
import { findProjectRoot } from './config.js';

export async function runDevServer(platform: Platform): Promise<void> {
  const root = await findProjectRoot();
  if (!root) throw new Error('프로젝트 루트를 찾을 수 없습니다.');

  const filter = platform === 'all' ? [] : [`--filter=./apps/${platform}`];
  await execa('pnpm', ['turbo', 'run', 'dev', ...filter], {
    cwd: root,
    stdio: 'inherit',
  });
}

export async function runBuild(platform: Platform, options: { analyze?: boolean } = {}): Promise<void> {
  const root = await findProjectRoot();
  if (!root) throw new Error('프로젝트 루트를 찾을 수 없습니다.');

  const filter = platform === 'all' ? [] : [`--filter=./apps/${platform}`];
  const env = options.analyze ? { ...process.env, BUNDLE_ANALYZE: 'true' } : process.env;

  await execa('pnpm', ['turbo', 'run', 'build', ...filter], {
    cwd: root,
    stdio: 'inherit',
    env,
  });
}
