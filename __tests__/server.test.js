const request = require('supertest');
const express = require('express');
const app = require('../server'); // Assuming server exports the app

describe('Server Tests', () => {
  test('Health check endpoint returns OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  test('404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
});
