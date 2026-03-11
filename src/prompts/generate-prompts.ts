import { select, input } from '@inquirer/prompts';
import { validateScreenName, validateApiName } from '../core/validator.js';
import type { GeneratorType } from '../types/project.js';

export async function runGeneratePrompts(
  typeArg: string | undefined,
  nameArg: string | undefined
): Promise<{ type: GeneratorType; name: string }> {
  let type: GeneratorType;

  if (typeArg) {
    type = typeArg as GeneratorType;
  } else {
    type = await select({
      message: '생성할 유형을 선택하세요',
      choices: [
        { name: 'screen  - 화면 컴포넌트 (mobile + desktop)', value: 'screen' },
        { name: 'api     - NestJS API 모듈 (controller + service + module)', value: 'api' },
        { name: 'socket  - Socket.io Gateway', value: 'socket' },
        { name: 'emoticon - 이모티콘 팩', value: 'emoticon' },
      ],
    }) as GeneratorType;
  }

  let name: string;
  if (nameArg) {
    name = nameArg;
  } else {
    const isScreen = type === 'screen';
    name = await input({
      message: isScreen ? '화면 이름 (PascalCase, 예: FriendList)' : '이름 (kebab-case, 예: friend-list)',
      validate: isScreen ? validateScreenName : validateApiName,
    });
  }

  return { type, name };
}
