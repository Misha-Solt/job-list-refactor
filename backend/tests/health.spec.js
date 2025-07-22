import request from 'supertest'

let app
beforeAll(async () => {
  ;({ app } = await import('../../backend/src/app.js'))
})

test('GET /api/jobs returns array', async () => {
  const res = await request(app).get('/api/jobs')
  expect(res.status).toBe(200)

  const list = Array.isArray(res.body) ? res.body : res.body.jobs || res.body.auftraege

  expect(Array.isArray(list)).toBe(true)
  expect(list.length).toBeGreaterThan(0)
})
