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
        email: 'user1212566132@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginResult = await apiContext.post('/auth/login', {
      data: {
        email: 'user1212566132@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginData = await loginResult.json();
    accessToken = loginData.accessToken;
  });

test('TC 8.2 - GET /tasks з задачами', async () => {
  await apiContext.post('/tasks', {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { title: 'Test Task', description: 'Some description' },
  });

  const res = await apiContext.get('/tasks', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  const tasks = Array.isArray(body) ? body : body.tasks || [];
  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks[0]).toHaveProperty('title');
});

  test('TC 9 - GET /tasks з невалідним токеном', async () => {
    const res = await apiContext.get('/tasks', {
      headers: { Authorization: `Bearer invalidtoken` },
    });
    expect(res.status()).toBe(401);
  });

  test('TC 10 - GET /tasks/:id з валідним токеном', async () => {
    const createRes = await apiContext.post('/tasks', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { title: 'Single Task', description: 'Details' },
    });
    const created = await createRes.json();

    const res = await apiContext.get(`/tasks/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id', created.id);
  });

  test('TC 11 - GET /tasks/:id з невалідним токеном', async () => {
    const res = await apiContext.get('/tasks/1', {
      headers: { Authorization: `Bearer invalidtoken` },
    });
    expect(res.status()).toBe(401);
  });

  test('TC 12 - GET /tasks/:id з невалідним форматом даних', async () => {
    const res = await apiContext.get('/tasks/abc', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(400);
  });

  test('TC 13 - GET /tasks/:id з неіснуючим id', async () => {
    const res = await apiContext.get('/tasks/999999', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('TC 14 - GET /tasks/:id чужого користувача', async () => {
    await apiContext.post('/auth/register', {
      data: {
        username: 'otherUser',
        email: 'other12336321@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginOther = await apiContext.post('/auth/login', {
      data: {
        email: 'other12336321@example.com',
        password: 'P@ssw0rd',
      },
    });

    const otherData = await loginOther.json();
    const otherToken = otherData.accessToken;

    const createOtherRes = await apiContext.post('/tasks', {
      headers: { Authorization: `Bearer ${otherToken}` },
      data: { title: 'Other User Task', description: 'Other details' },
    });

    const otherTask = await createOtherRes.json();
    const res = await apiContext.get(`/tasks/${otherTask.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('TC 15 - POST /api/tasks з валідним accessToken', async () => {
    const response = await apiContext.post('/tasks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        title: 'Test Task',
        description: 'Test Description'
      }
    });

    expect(response.status()).toBe(201);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('description');
    expect(responseData.title).toBe('Test Task');
    expect(responseData.description).toBe('Test Description');
  });

  test('TC 16 - POST /api/tasks з невалідним accessToken', async () => {
    const response = await apiContext.post('/tasks', {
      headers: {
        'Authorization': `Bearer invalid_token`
      },
      data: {
        title: 'Test Task',
        description: 'Test Description'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('TC 17 - POST /api/tasks з невірним форматом даних', async () => {
    const response = await apiContext.post('/tasks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        description: 'Test Description without title'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('TC 18 - DELETE /api/tasks/id з валідним accessToken', async () => {
    const createRes = await apiContext.post('/tasks', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { title: 'Single Task', description: 'Details' },
    });
    const created = await createRes.json();

    const res = await apiContext.delete(`/tasks/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC 19 - DELETE /api/tasks/id з невірним форматом даних', async () => {
    const res = await apiContext.delete('/tasks/abc', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(400);
  });

  test('TC 20 - DELETE /api/tasks/id з невалідним accessToken', async () => {
    const response = await apiContext.delete('/tasks/1', {
      headers: {
        'Authorization': `Bearer invalid_token`
      }
    });
    expect(response.status()).toBe(401);
  });

  test('TC 21 - DELETE /api/tasks/id з неіснуючим завданням', async () => {
    await apiContext.post('/auth/register', {
      data: {
        username: 'otherUser',
        email: 'other1233421@example.com',
        password: 'P@ssw0rd',
      },
    });

    const loginOther = await apiContext.post('/auth/login', {
      data: {
        email: 'other1233421@example.com',
        password: 'P@ssw0rd',
      },
    });

    const otherData = await loginOther.json();
    const otherToken = otherData.accessToken;

    const createOtherRes = await apiContext.post('/tasks', {
      headers: { Authorization: `Bearer ${otherToken}` },
      data: { title: 'Other User Task', description: 'Other details' },
    });

    const otherTask = await createOtherRes.json();
    const res = await apiContext.delete(`/tasks/${otherTask.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('TC 22 - DELETE /api/tasks/id з неіснуючим завданням', async () => {
    const response = await apiContext.delete(`/tasks/99999`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    expect(response.status()).toBe(404);
  });
});