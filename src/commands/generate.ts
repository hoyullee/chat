import { Command } from 'commander';
import { generate } from '../core/generator.js';
import { runGeneratePrompts } from '../prompts/generate-prompts.js';
import { validateGeneratorType } from '../core/validator.js';
import { isInsideProject } from '../core/config.js';
import { showGeneratedFilesTable } from '../ui/table.js';
import { logger } from '../ui/logger.js';
import chalk from 'chalk';

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate [type] [name]')
    .alias('g')
    .description('코드를 생성합니다 (screen | api | socket | emoticon)')
    .action(async (typeArg: string | undefined, nameArg: string | undefined) => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          process.exit(1);
        }

        if (typeArg && !validateGeneratorType(typeArg)) {
          logger.error(`알 수 없는 유형: '${typeArg}'`);
          logger.info('사용 가능한 유형: screen, api, socket, emoticon');
          process.exit(1);
        }

        const { type, name } = await runGeneratePrompts(typeArg, nameArg);

        logger.blank();
        logger.info(`${type} '${name}' 생성 중...`);

        const result = await generate(type, name);

        logger.blank();
        logger.success('생성 완료!');
        logger.blank();
        showGeneratedFilesTable(result.files);

        if (result.hints.length > 0) {
          logger.blank();
          logger.log(chalk.gray('다음 단계:'));
          result.hints.forEach((hint) => logger.log(chalk.gray(hint)));
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });
}
