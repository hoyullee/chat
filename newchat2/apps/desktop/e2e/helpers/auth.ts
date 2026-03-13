import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function loginAs(page: Page, userKey: 'user-a' | 'user-b') {
  const state = JSON.parse(fs.readFileSync(path.join(__dirname, `../.auth/${userKey}.json`), 'utf-8'));

  // 페이지 로드 전에 localStorage에 auth 정보 주입
  await page.addInitScript((auth) => {
    localStorage.setItem('accessToken', auth.token);
    localStorage.setItem('user', JSON.stringify({
      id: auth.userId,
      email: auth.user.email,
      displayName: auth.user.displayName,
      role: 'user',
    }));
    localStorage.setItem('deviceId', 'e2e-test-device');
  }, state);

  await page.goto('/');
  // 스피너가 사라지고 메인 화면 로드 대기
  await page.waitForSelector('text=채팅', { timeout: 10_000 });
}
