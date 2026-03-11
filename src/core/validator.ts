import type { Platform, GeneratorType } from '../types/project.js';

const VALID_PLATFORMS: Exclude<Platform, 'all'>[] = ['mobile', 'desktop', 'server'];
const VALID_GENERATOR_TYPES: GeneratorType[] = ['screen', 'api', 'socket', 'emoticon'];

export function validateProjectName(name: string): string | true {
  if (!name) return '프로젝트 이름을 입력해주세요.';
  if (!/^[a-z0-9-]+$/.test(name)) return '프로젝트 이름은 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.';
  if (name.startsWith('-') || name.endsWith('-')) return '하이픈으로 시작하거나 끝날 수 없습니다.';
  if (name.length < 2) return '프로젝트 이름은 2자 이상이어야 합니다.';
  if (name.length > 50) return '프로젝트 이름은 50자 이하여야 합니다.';
  return true;
}

export function validatePlatform(platform: string): boolean {
  return VALID_PLATFORMS.includes(platform as Exclude<Platform, 'all'>);
}

export function validateGeneratorType(type: string): type is GeneratorType {
  return VALID_GENERATOR_TYPES.includes(type as GeneratorType);
}

export function validateScreenName(name: string): string | true {
  if (!name) return '이름을 입력해주세요.';
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) return '화면 이름은 PascalCase여야 합니다. (예: FriendList)';
  return true;
}

export function validateApiName(name: string): string | true {
  if (!name) return '이름을 입력해주세요.';
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return 'API 이름은 소문자 kebab-case여야 합니다. (예: friend-list)';
  return true;
}
