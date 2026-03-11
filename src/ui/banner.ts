import boxen from 'boxen';
import chalk from 'chalk';

export function showWelcomeBanner(): void {
  const banner = boxen(
    chalk.bold.cyan('chat-cli') +
      '\n' +
      chalk.gray('Cross-platform chat app scaffold tool'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    }
  );
  console.log(banner);
}

export function showSuccessBanner(projectName: string, platforms: string[]): void {
  const lines = [
    chalk.bold.green(`✓ ${projectName} 프로젝트가 생성되었습니다!`),
    '',
    chalk.white('다음 단계:'),
    chalk.cyan(`  cd ${projectName}`),
    chalk.cyan('  chat-cli dev'),
    '',
    chalk.gray(`플랫폼: ${platforms.join(', ')}`),
  ];

  const banner = boxen(lines.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
  });
  console.log(banner);
}

export function showErrorBanner(message: string): void {
  const banner = boxen(chalk.red(message), {
    padding: 1,
    margin: { top: 1, bottom: 1, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: 'red',
  });
  console.error(banner);
}

export function showDevBanner(services: { name: string; url: string; status: 'running' | 'error' }[]): void {
  const lines = [
    chalk.bold('Chat App Dev Server'),
    '',
    ...services.map(
      (s) =>
        `  ${chalk.gray('◆')} ${chalk.white(s.name.padEnd(12))} ${chalk.cyan(s.url.padEnd(32))} ${
          s.status === 'running' ? chalk.green('✓') : chalk.red('✗')
        }`
    ),
  ];

  const banner = boxen(lines.join('\n'), {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  });
  console.log(banner);
}
