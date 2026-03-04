import test from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../../app.js'

test('GET /v1/health is public', async () => {
  const app = buildApp()

  const response = await app.handle(new Request('http://localhost/v1/health'))
  assert.equal(response.status, 200)
})

test('GET /v1/bridge requires auth', async () => {
  const app = buildApp()

  const response = await app.handle(new Request('http://localhost/v1/bridge'))
  const payload = (await response.json()) as { error: string }

  assert.equal(response.status, 401)
  assert.equal(payload.error, 'unauthorized')
})

test('GET /v1/auth/bootstrap/status is public', async () => {
  const app = buildApp()

  const response = await app.handle(new Request('http://localhost/v1/auth/bootstrap/status'))
  const payload = (await response.json()) as { needsBootstrap: boolean }

  assert.equal(response.status, 200)
  assert.equal(typeof payload.needsBootstrap, 'boolean')
})

test('POST /v1/auth/sign-up/email is blocked', async () => {
  const app = buildApp()

  const response = await app.handle(
    new Request('http://localhost/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'x@test.com', name: 'x', password: 'password123' }),
    }),
  )

  assert.equal(response.status, 404)
})

test('POST /v1/auth/sign-in/email is allowed by route guard layer', async () => {
  const app = buildApp()

  const response = await app.handle(
    new Request('http://localhost/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'x@test.com', password: 'password123' }),
    }),
  )

  assert.notEqual(response.status, 404)
})
