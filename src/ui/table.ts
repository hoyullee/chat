import Table from 'cli-table3';
import chalk from 'chalk';

export function showGeneratedFilesTable(files: { path: string; type: string }[]): void {
  const table = new Table({
    head: [chalk.cyan('파일'), chalk.cyan('유형')],
    style: { head: [], border: ['gray'] },
  });

  for (const file of files) {
    table.push([chalk.white(file.path), chalk.gray(file.type)]);
  }

  console.log(table.toString());
}

export function showProjectSummaryTable(config: {
  name: string;
  platforms: string[];
  features: Record<string, boolean>;
}): void {
  const table = new Table({
    style: { head: [], border: ['gray'] },
  });

  table.push(
    [chalk.gray('프로젝트명'), chalk.white(config.name)],
    [chalk.gray('플랫폼'), chalk.white(config.platforms.join(', '))],
    [
      chalk.gray('기능'),
      chalk.white(
        Object.entries(config.features)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ')
      ),
    ]
  );

  console.log(table.toString());
}

export function showEmoticonPacksTable(
  packs: { id: string; name: string; author: string; version: string; license: string }[]
): void {
  if (packs.length === 0) {
    console.log(chalk.gray('  설치된 이모티콘 팩이 없습니다.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('이름'),
      chalk.cyan('제작자'),
      chalk.cyan('버전'),
      chalk.cyan('라이선스'),
    ],
    style: { head: [], border: ['gray'] },
  });

  for (const pack of packs) {
    table.push([
      chalk.white(pack.id),
      chalk.white(pack.name),
      chalk.gray(pack.author),
      chalk.gray(pack.version),
      pack.license === 'free' ? chalk.green(pack.license) : chalk.yellow(pack.license),
    ]);
  }

  console.log(table.toString());
}
