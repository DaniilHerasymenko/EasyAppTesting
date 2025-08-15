import {test, expect, request} from '@playwright/test'

let apiContext;
let accessToken;

test.describe('User Registration', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://easy-apps-backend-dev.onrender.com',
    });

    await apiContext.post('/auth/register', {
      data: {
        username: 'user101',
        email: 'user169@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginResult = await apiContext.post('/auth/login', {
      data: {
        email: 'user169@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginData = await loginResult.json();
    accessToken = loginData.accessToken;
  });

  test('TC 1 - GET /users/me з валідним токеном', async () => {
    const res = await apiContext.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('username', 'user101');
    expect(body).toHaveProperty('email', 'user169@example.com');
    expect(body).toHaveProperty('avatar');
  });
});
