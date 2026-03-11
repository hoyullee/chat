import chalk from 'chalk';

const isCI = process.env.CI === 'true';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.error(chalk.red('✗'), msg),
  log: (msg: string) => console.log(msg),
  blank: () => console.log(),
  step: (n: number, total: number, msg: string) =>
    console.log(chalk.gray(`[${n}/${total}]`), msg),
};

export function isNoColor(): boolean {
  return (
    process.env.NO_COLOR !== undefined ||
    process.env.TERM === 'dumb' ||
    isCI
  );
}
