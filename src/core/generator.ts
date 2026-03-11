import path from 'path';
import fs from 'fs-extra';
import { copyTemplate, writeJson } from '../utils/fs.js';
import { toPascalCase, toKebabCase, toCamelCase, renderFile } from '../utils/template.js';
import { findProjectRoot } from './config.js';
import type { GeneratorType } from '../types/project.js';
import type { GeneratorContext } from '../types/template.js';

interface GenerateResult {
  files: { path: string; type: string }[];
  hints: string[];
}

export async function generate(type: GeneratorType, name: string): Promise<GenerateResult> {
  const root = await findProjectRoot();
  if (!root) throw new Error('프로젝트 루트를 찾을 수 없습니다.');

  const context: GeneratorContext = {
    name,
    namePascal: toPascalCase(name),
    nameKebab: toKebabCase(name),
    nameCamel: toCamelCase(name),
  };

  const templateBase = path.resolve(__dirname, '../templates');

  switch (type) {
    case 'screen':
      return generateScreen(root, context, templateBase);
    case 'api':
      return generateApi(root, context, templateBase);
    case 'socket':
      return generateSocket(root, context, templateBase);
    case 'emoticon':
      return generateEmoticon(root, context, templateBase);
  }
}

async function generateScreen(root: string, ctx: GeneratorContext, templateBase: string): Promise<GenerateResult> {
  const files: { path: string; type: string }[] = [];
  const hints: string[] = [];

  // Mobile screen
  const mobileSrc = path.join(templateBase, 'screens', 'mobile-screen.tsx.ejs');
  const mobileDest = path.join(root, 'apps', 'mobile', 'src', 'screens', `${ctx.namePascal}Screen.tsx`);
  if (await fs.pathExists(mobileSrc)) {
    await fs.ensureDir(path.dirname(mobileDest));
    const rendered = await renderFile(mobileSrc, ctx);
    await fs.writeFile(mobileDest, rendered, 'utf-8');
    files.push({ path: `apps/mobile/src/screens/${ctx.namePascal}Screen.tsx`, type: 'mobile screen' });
  }

  // Desktop page
  const desktopSrc = path.join(templateBase, 'screens', 'desktop-page.tsx.ejs');
  const desktopDest = path.join(root, 'apps', 'desktop', 'src', 'pages', `${ctx.namePascal}Page.tsx`);
  if (await fs.pathExists(desktopSrc)) {
    await fs.ensureDir(path.dirname(desktopDest));
    const rendered = await renderFile(desktopSrc, ctx);
    await fs.writeFile(desktopDest, rendered, 'utf-8');
    files.push({ path: `apps/desktop/src/pages/${ctx.namePascal}Page.tsx`, type: 'desktop page' });
  }

  hints.push(`→ navigation/MainNavigator.tsx 에 ${ctx.namePascal}Screen 라우트 추가 필요`);
  return { files, hints };
}

async function generateApi(root: string, ctx: GeneratorContext, templateBase: string): Promise<GenerateResult> {
  const files: { path: string; type: string }[] = [];
  const hints: string[] = [];
  const apiDir = path.join(root, 'apps', 'server', 'src', ctx.nameKebab);

  await fs.ensureDir(apiDir);

  for (const tpl of ['controller', 'service', 'module']) {
    const src = path.join(templateBase, 'api', `nest-${tpl}.ts.ejs`);
    const dest = path.join(apiDir, `${ctx.nameKebab}.${tpl}.ts`);
    if (await fs.pathExists(src)) {
      const rendered = await renderFile(src, ctx);
      await fs.writeFile(dest, rendered, 'utf-8');
      files.push({ path: `apps/server/src/${ctx.nameKebab}/${ctx.nameKebab}.${tpl}.ts`, type: `nest ${tpl}` });
    }
  }

  hints.push(`→ apps/server/src/app.module.ts 에 ${ctx.namePascal}Module import 필요`);
  return { files, hints };
}

async function generateSocket(root: string, ctx: GeneratorContext, templateBase: string): Promise<GenerateResult> {
  const files: { path: string; type: string }[] = [];

  const src = path.join(templateBase, 'socket', 'nest-gateway.ts.ejs');
  const dest = path.join(root, 'apps', 'server', 'src', ctx.nameKebab, `${ctx.nameKebab}.gateway.ts`);
  if (await fs.pathExists(src)) {
    await fs.ensureDir(path.dirname(dest));
    const rendered = await renderFile(src, ctx);
    await fs.writeFile(dest, rendered, 'utf-8');
    files.push({ path: `apps/server/src/${ctx.nameKebab}/${ctx.nameKebab}.gateway.ts`, type: 'socket gateway' });
  }

  return { files, hints: [`→ ${ctx.namePascal}Module 에 ${ctx.namePascal}Gateway provider 추가 필요`] };
}

async function generateEmoticon(root: string, ctx: GeneratorContext, templateBase: string): Promise<GenerateResult> {
  const packDir = path.join(root, 'packages', 'emoticons', ctx.nameKebab);
  await fs.ensureDir(path.join(packDir, 'images'));

  const manifest = {
    id: ctx.nameKebab,
    name: ctx.namePascal,
    author: '',
    version: '1.0.0',
    description: '',
    license: 'free',
    images: [],
    emoticons: [],
  };

  const manifestPath = path.join(packDir, 'manifest.json');
  await writeJson(manifestPath, manifest);

  const indexContent = `export { default as ${ctx.nameCamel}Pack } from './manifest.json';\n`;
  await fs.writeFile(path.join(packDir, 'index.ts'), indexContent, 'utf-8');

  return {
    files: [
      { path: `packages/emoticons/${ctx.nameKebab}/manifest.json`, type: 'emoticon manifest' },
      { path: `packages/emoticons/${ctx.nameKebab}/index.ts`, type: 'emoticon index' },
    ],
    hints: [`→ packages/emoticons/${ctx.nameKebab}/images/ 에 이모티콘 이미지 추가 후 manifest.json 업데이트`],
  };
}
