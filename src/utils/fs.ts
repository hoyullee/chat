import fs from 'fs-extra';
import path from 'path';
import { renderFile } from './template.js';

export async function ensureProjectDir(dirPath: string): Promise<void> {
  const exists = await fs.pathExists(dirPath);
  if (exists) {
    const contents = await fs.readdir(dirPath);
    if (contents.length > 0) {
      throw new Error(`디렉토리 '${dirPath}'가 이미 존재하며 비어있지 않습니다.`);
    }
  }
  await fs.ensureDir(dirPath);
}

export async function copyTemplate(
  srcDir: string,
  destDir: string,
  context: Record<string, unknown>
): Promise<{ path: string; type: string }[]> {
  const created: { path: string; type: string }[] = [];

  async function walk(src: string, dest: string): Promise<void> {
    const items = await fs.readdir(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const stat = await fs.stat(srcPath);

      // Remove .ejs extension for destination filename
      const destItem = item.endsWith('.ejs') ? item.slice(0, -4) : item;
      const destPath = path.join(dest, destItem);

      if (stat.isDirectory()) {
        await fs.ensureDir(destPath);
        await walk(srcPath, destPath);
      } else if (item.endsWith('.ejs')) {
        await fs.ensureDir(path.dirname(destPath));
        const rendered = await renderFile(srcPath, context);
        await fs.writeFile(destPath, rendered, 'utf-8');
        created.push({ path: destPath, type: 'generated' });
      } else {
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);
        created.push({ path: destPath, type: 'copied' });
      }
    }
  }

  await walk(srcDir, destDir);
  return created;
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function readJson<T>(filePath: string): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

export function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}
