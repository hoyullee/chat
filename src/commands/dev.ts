import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import { runDevServer } from '../core/runner.js';
import { isInsideProject, readConfig } from '../core/config.js';
import { showDevBanner } from '../ui/banner.js';
import { logger } from '../ui/logger.js';
import type { Platform } from '../types/project.js';

export function registerDevCommand(program: Command): void {
  program
    .command('dev [platform]')
    .description('개발 서버를 시작합니다')
    .option('--port <port>', '서버 포트', '3000')
    .action(async (platformArg: string | undefined, _options) => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          logger.info('새 프로젝트 생성: chat-cli init <name>');
          process.exit(1);
        }

        const config = await readConfig();
        let platform: Platform;

        if (platformArg) {
          platform = platformArg as Platform;
        } else if (process.env.CI === 'true') {
          platform = 'all';
        } else {
          platform = await select({
            message: '시작할 플랫폼을 선택하세요',
            choices: [
              { name: '전체', value: 'all' },
              ...config.platforms.map((p) => ({ name: p, value: p as Platform })),
            ],
          });
        }

        const services = config.platforms.map((p) => ({
          name: p,
          url: p === 'server' ? 'http://localhost:3000' : p === 'mobile' ? 'Expo :8081' : 'Electron',
          status: 'running' as const,
        }));

        showDevBanner(services);
        logger.blank();

        await runDevServer(platform);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });
}
