import { test, expect } from '@playwright/test';
import axios from 'axios';
import { loginAs } from './helpers/auth';
import fs from 'fs';
import path from 'path';

const API = 'http://localhost:3000/api';

async function getAuthHeader(userKey: 'user-a' | 'user-b') {
  const state = JSON.parse(fs.readFileSync(path.join(__dirname, `.auth/${userKey}.json`), 'utf-8'));
  return { Authorization: `Bearer ${state.token}`, userId: state.userId };
}

// 소켓 연결 + join-room 완료까지 대기하는 헬퍼
async function waitForSocketReady(page: any) {
  await page.waitForSelector('input[placeholder="메시지 입력..."]');
  await page.waitForTimeout(3000); // 소켓 handshake + join-room 완료 대기
}

async function getOrCreateRoom(userKey: 'user-a' | 'user-b', targetKey: 'user-a' | 'user-b'): Promise<string> {
  const { Authorization, userId } = await getAuthHeader(userKey);
  const targetState = JSON.parse(fs.readFileSync(path.join(__dirname, `.auth/${targetKey}.json`), 'utf-8'));
  const { data } = await axios.post(
    `${API}/chat/rooms/direct`,
    { targetUserId: targetState.userId },
    { headers: { Authorization } },
  );
  return data.id;
}

test.describe('채팅 메시지 전송', () => {
  test('전송 버튼 클릭 시 메시지가 채팅창에 표시된다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await waitForSocketReady(page);

    const input = page.locator('input[placeholder="메시지 입력..."]');
    await input.fill('안녕하세요 테스트 메시지');
    await page.getByRole('button', { name: '전송' }).click();

    await expect(page.locator('text=안녕하세요 테스트 메시지')).toBeVisible({ timeout: 8_000 });
    // 입력창이 비워지는지 확인
    await expect(input).toHaveValue('');
  });

  test('Enter 키 입력 시 메시지가 채팅창에 표시된다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await waitForSocketReady(page);

    const input = page.locator('input[placeholder="메시지 입력..."]');
    await input.fill('Enter키 전송 테스트');
    await input.press('Enter');

    await expect(page.locator('text=Enter키 전송 테스트')).toBeVisible({ timeout: 8_000 });
    await expect(input).toHaveValue('');
  });

  test('빈 메시지는 전송되지 않는다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await waitForSocketReady(page);

    const messagesBefore = await page.locator('[style*="border-radius: 12px"]').count();
    await page.getByRole('button', { name: '전송' }).click();
    const messagesAfter = await page.locator('[style*="border-radius: 12px"]').count();

    expect(messagesAfter).toBe(messagesBefore);
  });

  test('상대방이 보낸 메시지가 수신된다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');

    // B가 HTTP API로 메시지 전송 (소켓 없이 DB에 직접 저장)
    const { Authorization: authB } = await getAuthHeader('user-b');
    await axios.post(`${API}/chat/rooms/${roomId}/messages`, { content: 'B가 보낸 메시지' }, { headers: { Authorization: authB } });

    // A가 채팅방 열면 메시지가 표시됨 (loadMessages via HTTP)
    await page.goto(`/?chatRoom=${roomId}`);
    await page.waitForSelector('input[placeholder="메시지 입력..."]');
    await expect(page.locator('text=B가 보낸 메시지')).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('이모티콘 기능', () => {
  test('이모티콘 버튼(😊)이 화면에 표시된다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await page.waitForSelector('input[placeholder="메시지 입력..."]');

    await expect(page.locator('button:has-text("😊")')).toBeVisible();
  });

  test('이모티콘 버튼 클릭 시 이모티콘 피커가 열린다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await page.waitForSelector('input[placeholder="메시지 입력..."]');

    await page.locator('button:has-text("😊")').click();
    await expect(page.locator('button:has-text("😀")')).toBeVisible();
  });

  test('이모티콘 선택 시 채팅창에 이모티콘이 표시된다', async ({ page }) => {
    await loginAs(page, 'user-a');

    const roomId = await getOrCreateRoom('user-a', 'user-b');
    await page.goto(`/?chatRoom=${roomId}`);
    await waitForSocketReady(page);

    await page.locator('button:has-text("😊")').click();
    await page.locator('button:has-text("🎉")').click();

    await expect(page.locator('span:has-text("🎉")')).toBeVisible({ timeout: 8_000 });
    // 피커가 닫히는지 확인
    await expect(page.locator('button:has-text("😀")')).not.toBeVisible();
  });
});
