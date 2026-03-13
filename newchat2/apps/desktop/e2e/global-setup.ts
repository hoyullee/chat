import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API = 'http://localhost:3000/api';
const DEVICE_ID = 'e2e-test-device';

export const TEST_USER_A = { email: 'e2e-a@test.com', password: 'Test1234!', displayName: '테스트유저A' };
export const TEST_USER_B = { email: 'e2e-b@test.com', password: 'Test1234!', displayName: '테스트유저B' };

async function createUser(user: typeof TEST_USER_A) {
  try {
    await axios.post(`${API}/users/register`, user);
  } catch {
    // 이미 존재하면 무시
  }
}

async function loginUser(user: typeof TEST_USER_A) {
  const { data } = await axios.post(`${API}/auth/login`, {
    email: user.email,
    password: user.password,
    deviceId: DEVICE_ID,
  });
  return { token: data.accessToken, userId: data.user.id };
}

export default async function globalSetup() {
  await createUser(TEST_USER_A);
  await createUser(TEST_USER_B);

  const { token: tokenA, userId: userIdA } = await loginUser(TEST_USER_A);
  const { token: tokenB, userId: userIdB } = await loginUser(TEST_USER_B);

  const stateDir = path.join(__dirname, '.auth');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(
    path.join(stateDir, 'user-a.json'),
    JSON.stringify({ token: tokenA, userId: userIdA, user: TEST_USER_A }),
  );
  fs.writeFileSync(
    path.join(stateDir, 'user-b.json'),
    JSON.stringify({ token: tokenB, userId: userIdB, user: TEST_USER_B }),
  );
  console.log('E2E 테스트 유저 준비 완료');
}
