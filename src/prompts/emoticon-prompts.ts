import { input, select, confirm } from '@inquirer/prompts';

export async function runEmoticonAddPrompts(): Promise<{
  packPath: string;
}> {
  const packPath = await input({ message: '이모티콘 팩 경로를 입력하세요' });
  return { packPath };
}

export async function runEmoticonInitPrompts(): Promise<{
  name: string;
  author: string;
  license: 'free' | 'paid' | 'custom';
  description: string;
}> {
  const name = await input({ message: '이모티콘 팩 이름' });
  const author = await input({ message: '제작자' });
  const license = await select({
    message: '라이선스',
    choices: [
      { name: '무료 (free)', value: 'free' },
      { name: '유료 (paid)', value: 'paid' },
      { name: '커스텀 (custom)', value: 'custom' },
    ],
  }) as 'free' | 'paid' | 'custom';
  const description = await input({ message: '설명 (선택사항)', default: '' });
  return { name, author, license, description };
}
