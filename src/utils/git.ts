import { execa } from 'execa';
import path from 'path';

export async function gitInit(cwd: string): Promise<void> {
  try {
    await execa('git', ['init'], { cwd });
    await execa('git', ['add', '-A'], { cwd });
    await execa('git', ['commit', '-m', 'chore: initial scaffold by chat-cli'], { cwd });
  } catch {
    // git이 없거나 실패해도 계속 진행
  }
}

export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}
