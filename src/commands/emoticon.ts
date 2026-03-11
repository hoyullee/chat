import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { isInsideProject, findProjectRoot } from '../core/config.js';
import { readJson, writeJson } from '../utils/fs.js';
import { showEmoticonPacksTable } from '../ui/table.js';
import { logger } from '../ui/logger.js';
import { withSpinner } from '../ui/spinner.js';
import { runEmoticonInitPrompts } from '../prompts/emoticon-prompts.js';
import { toKebabCase } from '../utils/template.js';
import type { EmoticonManifest, EmoticonPack } from '../types/emoticon.js';

const MANIFEST_PATH = 'packages/emoticons/manifest.json';

async function getManifest(root: string): Promise<EmoticonManifest> {
  const manifestPath = path.join(root, MANIFEST_PATH);
  if (!(await fs.pathExists(manifestPath))) {
    return { version: '1.0.0', packs: [], updatedAt: new Date().toISOString() };
  }
  return readJson<EmoticonManifest>(manifestPath);
}

async function saveManifest(root: string, manifest: EmoticonManifest): Promise<void> {
  manifest.updatedAt = new Date().toISOString();
  await writeJson(path.join(root, MANIFEST_PATH), manifest);
}

export function registerEmoticonCommand(program: Command): void {
  const emoticon = program
    .command('emoticon')
    .description('이모티콘 팩을 관리합니다');

  // emoticon init
  emoticon
    .command('init [name]')
    .description('새 이모티콘 팩을 초기화합니다')
    .action(async (nameArg: string | undefined) => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          process.exit(1);
        }
        const root = (await findProjectRoot())!;

        const info = await runEmoticonInitPrompts();
        const id = nameArg || toKebabCase(info.name);
        const packDir = path.join(root, 'packages', 'emoticons', id);

        await withSpinner(`이모티콘 팩 '${id}' 생성 중...`, async () => {
          await fs.ensureDir(path.join(packDir, 'images'));
          const pack: EmoticonPack = { id, ...info, version: '1.0.0', images: [], emoticons: [] };
          await writeJson(path.join(packDir, 'manifest.json'), pack);
          await fs.writeFile(
            path.join(packDir, 'index.ts'),
            `export { default as ${id.replace(/-/g, '_')}Pack } from './manifest.json';\n`,
            'utf-8'
          );

          const manifest = await getManifest(root);
          manifest.packs.push(pack);
          await saveManifest(root, manifest);
        });

        logger.success(`이모티콘 팩 '${id}' 생성 완료!`);
        logger.info(`이미지 추가: packages/emoticons/${id}/images/`);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  // emoticon list
  emoticon
    .command('list')
    .description('설치된 이모티콘 팩 목록을 표시합니다')
    .action(async () => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          process.exit(1);
        }
        const root = (await findProjectRoot())!;
        const manifest = await getManifest(root);
        logger.blank();
        showEmoticonPacksTable(manifest.packs);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  // emoticon remove
  emoticon
    .command('remove <id>')
    .description('이모티콘 팩을 제거합니다')
    .action(async (id: string) => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          process.exit(1);
        }
        const root = (await findProjectRoot())!;
        const manifest = await getManifest(root);
        const idx = manifest.packs.findIndex((p) => p.id === id);
        if (idx === -1) {
          logger.error(`이모티콘 팩 '${id}'을 찾을 수 없습니다.`);
          process.exit(1);
        }

        manifest.packs.splice(idx, 1);
        await saveManifest(root, manifest);
        await fs.remove(path.join(root, 'packages', 'emoticons', id));
        logger.success(`이모티콘 팩 '${id}' 제거 완료`);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  // emoticon export
  emoticon
    .command('export')
    .description('모든 이모티콘 팩을 dist/emoticons/ 로 번들링합니다')
    .action(async () => {
      try {
        if (!(await isInsideProject())) {
          logger.error('chat-cli 프로젝트 내부에서 실행해주세요.');
          process.exit(1);
        }
        const root = (await findProjectRoot())!;
        const manifest = await getManifest(root);
        const distDir = path.join(root, 'dist', 'emoticons');

        await withSpinner('이모티콘 팩 번들링 중...', async () => {
          await fs.ensureDir(distDir);
          for (const pack of manifest.packs) {
            const src = path.join(root, 'packages', 'emoticons', pack.id);
            await fs.copy(src, path.join(distDir, pack.id));
          }
          await writeJson(path.join(distDir, 'manifest.json'), manifest);
        });

        logger.success(`${manifest.packs.length}개 팩 번들 완료 → dist/emoticons/`);
      } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });
}
