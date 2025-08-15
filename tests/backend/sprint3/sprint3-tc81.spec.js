import { test, expect } from '@playwright/test';

let apiContext;
let accessToken;

test.describe('Tasks API', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://easy-apps-backend-dev.onrender.com',
    });

    await apiContext.post('/auth/register', {
      data: {
        username: 'user101',
        email: 'user112613232@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginResult = await apiContext.post('/auth/login', {
      data: {
        email: 'user112613232@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginData = await loginResult.json();
    accessToken = loginData.accessToken;
  });

test('TC 8.1 - GET /tasks без задач', async () => {
  const res = await apiContext.get('/tasks', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  const tasks = Array.isArray(body) ? body : body.tasks || [];
  expect(Array.isArray(tasks)).toBeTruthy();
  expect(tasks.length).toBe(0);
});
});