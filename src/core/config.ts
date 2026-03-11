import path from 'path';
import { readJson, writeJson, pathExists } from '../utils/fs.js';
import type { ProjectConfig } from '../types/project.js';

const CONFIG_FILENAME = '.chatclirc.json';

export async function findProjectRoot(startDir: string = process.cwd()): Promise<string | null> {
  let current = startDir;
  while (true) {
    const configPath = path.join(current, CONFIG_FILENAME);
    if (await pathExists(configPath)) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export async function isInsideProject(): Promise<boolean> {
  return (await findProjectRoot()) !== null;
}

export async function readConfig(): Promise<ProjectConfig> {
  const root = await findProjectRoot();
  if (!root) throw new Error('chat-cli 프로젝트 내부에서 실행해주세요. (chat-cli init으로 프로젝트 생성)');
  return readJson<ProjectConfig>(path.join(root, CONFIG_FILENAME));
}

export async function writeConfig(config: ProjectConfig, projectDir: string): Promise<void> {
  await writeJson(path.join(projectDir, CONFIG_FILENAME), config);
}
