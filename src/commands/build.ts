import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import { runBuild } from '../core/runner.js';
import { isInsideProject, readConfig } from '../core/config.js';
import { logger } from '../ui/logger.js';
import { withSpinner } from '../ui/spinner.js';
import type { Platform } from '../types/project.js';

export function registerBuildCommand(program: Command): void {
  program
    .command('build [platform]')
    .description('앱을 빌드합니다')
    .option('--analyze', '번들 분석 활성화')
    .option('--env <env>', '환경 (staging | production)', 'production')
    .action(async (platformArg: string | undefined, options) => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
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
            message: '빌드할 플랫폼을 선택하세요',
            choices: [
              { name: '전체', value: 'all' },
              ...config.platforms.map((p) => ({ name: p, value: p as Platform })),
            ],
          });
        }

        logger.info(`${platform} 빌드 시작 (env: ${options.env})`);
        logger.blank();

        await runBuild(platform, { analyze: options.analyze });

        logger.blank();
        logger.success('빌드 완료!');

        if (platform === 'mobile' || platform === 'all') {
          logger.info('모바일 배포: eas build --platform all');
        }
        if (platform === 'desktop' || platform === 'all') {
          logger.info('데스크탑 빌드 결과: apps/desktop/dist/');
        }
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });
}
