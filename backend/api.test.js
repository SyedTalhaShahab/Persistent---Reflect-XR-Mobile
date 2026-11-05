import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from './server.js'

async function withServer(run) {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()

  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('GET /api/health returns ok', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.status, 'ok')
  })
})

test('GET /api/patients returns patient summaries', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/patients`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.ok(Array.isArray(body))
    assert.ok(body.length > 0)
    assert.ok('sessionCount' in body[0])
  })
})

test('GET /api/patients/P-1001/sessions returns only that patient sessions', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/patients/P-1001/sessions`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.ok(body.length > 0)
    assert.ok(body.every((session) => session.patientId === 'P-1001'))
  })
})

test('GET /api/summary returns dashboard statistics', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/summary`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.ok(body.patientCount > 0)
    assert.ok(body.sessionCount > 0)
    assert.ok(body.totalMinutes > 0)
  })
})
