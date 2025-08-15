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
        email: 'user160@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginResult = await apiContext.post('/auth/login', {
      data: {
        email: 'user160@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginData = await loginResult.json();
    accessToken = loginData.accessToken;
  });

  test('TC 2 - GET /users/me з невалідним токеном', async () => {
    const res = await apiContext.get('/users/me', {
      headers: {
        Authorization: `Bearer invalid_token`,
      },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });

  test('TC 3 - PUT /users оновлення username з валідним токеном', async () => {
    const res = await apiContext.put('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { username: 'updatedUser101' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('username', 'updatedUser101');
  });

  test('TC 4 - PUT /users з невалідним токеном', async () => {
    const res = await apiContext.put('/users', {
      headers: { Authorization: `Bearer invalid_token` },
      data: { username: 'Fail' },
    });

    expect(res.status()).toBe(401);
  });


  test('TC 5 - PUT /users з неправильним форматом', async () => {
    const res = await apiContext.put('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { username: 12345 }, 
    });
    expect(res.status()).toBe(400);
  });

  test('TC 6.1 - DELETE /users/avatar (є аватар)', async () => {
    await apiContext.put('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { avatar: 'https://en.wikipedia.org/wiki/Tower_of_Babel#/media/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg' },
    });

    const res = await apiContext.delete('/users/avatar', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status()).toBe(200);
  });

  test('TC 6.2 - DELETE /users/avatar (немає аватара)', async () => {
    const res = await apiContext.delete('/users/avatar', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status()).toBe(200);
  });

  test('TC 7 - DELETE /users/avatar з невалідним токеном', async () => {
    const res = await apiContext.delete('/users/avatar', {
      headers: { Authorization: `Bearer invalid_token`},
    });

    expect(res.status()).toBe(401);
  });
});
