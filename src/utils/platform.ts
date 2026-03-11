import type { Platform } from '../types/project.js';

export function parsePlatforms(input: string): Exclude<Platform, 'all'>[] {
  if (input === 'all') return ['mobile', 'desktop', 'server'];
  return input.split(',').map((p) => p.trim()) as Exclude<Platform, 'all'>[];
}

export function platformToTurboFilter(platform: Platform): string {
  switch (platform) {
    case 'mobile': return '--filter=mobile';
    case 'desktop': return '--filter=desktop';
    case 'server': return '--filter=server';
    case 'all': return '';
  }
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMac(): boolean {
  return process.platform === 'darwin';
}
