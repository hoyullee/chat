import path from 'path';
import { ensureProjectDir, copyTemplate } from '../utils/fs.js';
import { writeConfig } from './config.js';
import { gitInit } from '../utils/git.js';
import { installDependencies } from '../utils/package-manager.js';
import { toPascalCase, toKebabCase, toCamelCase } from '../utils/template.js';
import { withSpinner } from '../ui/spinner.js';
import { logger } from '../ui/logger.js';
import type { ProjectConfig } from '../types/project.js';
import type { TemplateContext } from '../types/template.js';

export async function scaffold(config: ProjectConfig, targetDir: string): Promise<void> {
  const projectDir = path.resolve(targetDir, config.name);

  // 1. 디렉토리 생성
  await withSpinner('프로젝트 디렉토리 생성 중...', async () => {
    await ensureProjectDir(projectDir);
  });

  const context: TemplateContext = {
    projectName: config.name,
    projectNamePascal: toPascalCase(config.name),
    projectNameKebab: toKebabCase(config.name),
    projectNameCamel: toCamelCase(config.name),
    createdAt: new Date().toISOString(),
    platforms: config.platforms,
    features: config.features,
  };

  const templateBase = path.resolve(__dirname, '../templates/project');

  // 2. 루트 파일 복사
  await withSpinner('프로젝트 구조 생성 중...', async () => {
    await copyTemplate(path.join(templateBase, '_root'), projectDir, context);
  });

  // 3. 선택된 플랫폼 앱 복사
  for (const platform of config.platforms) {
    await withSpinner(`${platform} 앱 생성 중...`, async () => {
      const platformSrc = path.join(templateBase, 'apps', platform);
      const platformDest = path.join(projectDir, 'apps', platform);
      await copyTemplate(platformSrc, platformDest, context);
    });
  }

  // 4. 공유 패키지 복사
  await withSpinner('공유 패키지 생성 중...', async () => {
    await copyTemplate(
      path.join(templateBase, 'packages'),
      path.join(projectDir, 'packages'),
      context
    );
  });

  // 5. 설정 파일 저장
  await writeConfig(config, projectDir);

  // 6. Git 초기화
  await withSpinner('Git 초기화 중...', async () => {
    await gitInit(projectDir);
  });

  // 7. 의존성 설치
  logger.blank();
  logger.info('의존성 설치 중... (시간이 걸릴 수 있습니다)');
  await installDependencies(projectDir);
}
