import { input, checkbox, confirm, select } from '@inquirer/prompts';
import { validateProjectName } from '../core/validator.js';
import type { ProjectConfig, InitOptions } from '../types/project.js';

export async function runInitPrompts(
  nameArg: string | undefined,
  options: InitOptions
): Promise<ProjectConfig> {
  const isCI = process.env.CI === 'true' || options.nonInteractive;

  // 프리셋 처리
  if (options.preset === 'kakao-like') {
    const name = nameArg || 'my-chat-app';
    const validation = validateProjectName(name);
    if (validation !== true) throw new Error(validation);
    return {
      name,
      version: '0.1.0',
      platforms: ['mobile', 'desktop', 'server'],
      packageManager: 'pnpm',
      features: { auth: true, friends: true, chat: true, emoticons: true },
    };
  }

  let name: string;
  if (nameArg) {
    const validation = validateProjectName(nameArg);
    if (validation !== true) throw new Error(validation);
    name = nameArg;
  } else if (isCI) {
    throw new Error('--non-interactive 모드에서는 프로젝트 이름을 인자로 제공해야 합니다.\n사용법: chat-cli init <name> --non-interactive');
  } else {
    name = await input({
      message: '프로젝트 이름을 입력하세요',
      default: 'my-chat-app',
      validate: (v) => validateProjectName(v),
    });
  }

  let platforms: ('mobile' | 'desktop' | 'server')[];
  if (options.platform) {
    platforms = options.platform.split(',').map((p) => p.trim()) as ('mobile' | 'desktop' | 'server')[];
  } else if (isCI) {
    platforms = ['mobile', 'desktop', 'server'];
  } else {
    platforms = await checkbox({
      message: '지원할 플랫폼을 선택하세요',
      choices: [
        { name: 'Android / iOS (React Native + Expo)', value: 'mobile', checked: true },
        { name: 'Windows / macOS (Electron)', value: 'desktop', checked: true },
        { name: 'Backend Server (NestJS)', value: 'server', checked: true },
      ],
    }) as ('mobile' | 'desktop' | 'server')[];
    if (platforms.length === 0) throw new Error('최소 하나 이상의 플랫폼을 선택해주세요.');
  }

  let includeEmoticons: boolean;
  if (isCI) {
    includeEmoticons = true;
  } else {
    includeEmoticons = await confirm({ message: '이모티콘 기능을 포함할까요?', default: true });
  }

  return {
    name,
    version: '0.1.0',
    platforms,
    packageManager: 'pnpm',
    features: {
      auth: true,
      friends: true,
      chat: true,
      emoticons: includeEmoticons,
    },
  };
}
