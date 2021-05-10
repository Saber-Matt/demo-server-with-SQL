import app from '../lib/app.js';
import supertest from 'supertest';
import client from '../lib/client.js';
import { execSync } from 'child_process';

const request = supertest(app);

describe('API Routes', () => {

  afterAll(async () => {
    return client.end();
  });

  describe('/api/sneks', () => {

    let user;

    beforeAll(async () => {
      execSync('npm run recreate-tables');

      const response = await request
        .post('/api/auth/signup')
        .send({
          name: 'Me the User',
          email: 'me@user.com',
          password: 'password'
        });

      expect(response.status).toBe(200);

      user = response.body;
    });

    let sweaterNoodle = {
      id: expect.any(Number),
      name: 'Sweater Noodle',
      type: 'Boop Rope',
      url: '',
      species: 'ball python',
      accessory: 'sweater',
      isDeadlyWithTheVenom: false
    };

    let bladeSlither = {
      id: expect.any(Number),
      name: 'Blade Slither',
      type: 'Danger Noodle',
      url: '',
      species: 'unknown',
      accessory: 'dual-wield short sword',
      isDeadlyWithTheVenom: true
    };

    let patricia = {
      id: expect.any(Number),
      name: 'Patricia',
      type: 'Boop Rope',
      url: '',
      species: 'ball python',
      accessory: 'jeweled necklace',
      isDeadlyWithTheVenom: false
    };

    it('POST sweaterNoodle to /api/sneks', async () => {
      sweaterNoodle.userId = user.id;
      const response = await request
        .post('/api/sneks')
        .send(sweaterNoodle);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(sweaterNoodle);

      // Update local client sweaterNoodle object
      sweaterNoodle = response.body;
    });

    it('PUT updated sweaterNoodle to /api/sneks/:id', async () => {
      sweaterNoodle.lives = 2;
      sweaterNoodle.name = 'Sweater Noodle';

      const response = await request
        .put(`/api/sneks/${sweaterNoodle.id}`)
        .send(sweaterNoodle);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(sweaterNoodle);

    });

    it('GET list of sneks from /api/sneks', async () => {
      patricia.userId = user.id;
      const r1 = await request.post('/api/sneks').send(patricia);
      patricia = r1.body;

      bladeSlither.userId = user.id;
      const r2 = await request.post('/api/sneks').send(bladeSlither);
      bladeSlither = r2.body;

      const response = await request.get('/api/sneks');

      expect(response.status).toBe(200);

      const expected = [sweaterNoodle, patricia, bladeSlither].map(cat => {
        return {
          userName: user.name,
          ...cat
        };
      });

      expect(response.body).toEqual(expect.arrayContaining(expected));
    });

    it('GET bladeSlither from /api/sneks/:id', async () => {
      const response = await request.get(`/api/sneks/${bladeSlither.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...bladeSlither, userName: user.name });
    });

    it('DELETE bladeSlither from /api/sneks/:id', async () => {
      const response = await request.delete(`/api/sneks/${bladeSlither.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(bladeSlither);

      const getResponse = await request.get('/api/sneks');
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.find(cat => cat.id === bladeSlither.id)).toBeUndefined();

    });

  });

  describe('seed data tests', () => {

    beforeAll(() => {
      execSync('npm run setup-db');
    });

    it('GET /api/sneks', async () => {
      // act - make the request
      const response = await request.get('/api/sneks');

      // was response OK (200)?
      expect(response.status).toBe(200);

      // did it return some data?
      expect(response.body.length).toBeGreaterThan(0);

      // did the data get inserted?
      expect(response.body[0]).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        type: expect.any(String),
        url: expect.any(String),
        species: expect.any(String),
        accessory: expect.any(String),
        isSidekick: expect.any(Boolean),
        userId: expect.any(Number),
        userName: expect.any(String)
      });
    });

  });

});