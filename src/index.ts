import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerDevCommand } from './commands/dev.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerBuildCommand } from './commands/build.js';
import { registerEmoticonCommand } from './commands/emoticon.js';

const program = new Command();

program
  .name('chat-cli')
  .description('카카오톡 스타일 채팅 앱 스캐폴딩 CLI 도구')
  .version('0.1.0')
  .option('--no-color', '색상 출력 비활성화');

program.hook('preAction', () => {
  if (program.opts().noColor) {
    process.env.NO_COLOR = '1';
  }
});

registerInitCommand(program);
registerDevCommand(program);
registerGenerateCommand(program);
registerBuildCommand(program);
registerEmoticonCommand(program);

program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
