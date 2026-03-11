import { Command } from 'commander';
import { scaffold } from '../core/scaffolder.js';
import { runInitPrompts } from '../prompts/init-prompts.js';
import { showWelcomeBanner, showSuccessBanner } from '../ui/banner.js';
import { showProjectSummaryTable } from '../ui/table.js';
import { logger } from '../ui/logger.js';
import { confirm } from '@inquirer/prompts';

export function registerInitCommand(program: Command): void {
  program
    .command('init [name]')
    .description('새 채팅 앱 프로젝트를 생성합니다')
    .option('-t, --template <template>', '프로젝트 템플릿', 'full')
    .option('-p, --platform <platforms>', '플랫폼 (mobile,desktop,server)')
    .option('--non-interactive', 'CI 환경용 비인터랙티브 모드')
    .option('--preset <preset>', '사전 설정 (kakao-like)')
    .action(async (name: string | undefined, options) => {
      showWelcomeBanner();

      try {
        const config = await runInitPrompts(name, options);

        // 요약 표시
        logger.blank();
        showProjectSummaryTable({
          name: config.name,
          platforms: config.platforms,
          features: config.features as Record<string, boolean>,
        });
        logger.blank();

        if (!options.nonInteractive && process.env.CI !== 'true') {
          const ok = await confirm({ message: '이 설정으로 프로젝트를 생성할까요?', default: true });
          if (!ok) {
            logger.warn('취소되었습니다.');
            return;
          }
        }

        logger.blank();
        await scaffold(config, process.cwd());
        logger.blank();
        showSuccessBanner(config.name, config.platforms);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });
}
