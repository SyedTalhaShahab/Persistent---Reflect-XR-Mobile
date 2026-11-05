import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = Number(process.env.PORT || 3001)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

async function loadJson(filename) {
  const text = await readFile(join(__dirname, 'data', filename), 'utf8')
  return JSON.parse(text)
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body, null, 2))
}

function addCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (!origin || origin === FRONTEND_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function patientSummary(patient, sessions) {
  const patientSessions = sessions.filter((session) => session.patientId === patient.patientId)
  const totalMinutes = patientSessions.reduce((sum, session) => sum + session.durationMinutes, 0)
  const modules = [...new Set(patientSessions.flatMap((session) => session.modules))]

  return {
    ...patient,
    sessionCount: patientSessions.length,
    totalMinutes,
    modulesUsed: modules,
  }
}

export async function handleRequest(req, res) {
  addCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname
    const [patients, sessions] = await Promise.all([
      loadJson('patients.json'),
      loadJson('sessions.json'),
    ])

    if (pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', service: 'reflect-provider-dashboard-api' })
      return
    }

    if (pathname === '/api/patients') {
      sendJson(res, 200, patients.map((patient) => patientSummary(patient, sessions)))
      return
    }

    if (pathname === '/api/sessions') {
      let results = sessions
      const patientId = url.searchParams.get('patientId')
      const deviceType = url.searchParams.get('deviceType')
      const moduleName = url.searchParams.get('module')

      if (patientId) {
        results = results.filter((session) => session.patientId === patientId)
      }
      if (deviceType) {
        results = results.filter((session) => session.deviceType === deviceType)
      }
      if (moduleName) {
        results = results.filter((session) => session.modules.includes(moduleName))
      }

      sendJson(res, 200, results)
      return
    }

    if (pathname === '/api/summary') {
      const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0)
      const completedSessions = sessions.filter((session) => session.completionStatus === 'Completed').length
      const moduleCounts = sessions.flatMap((session) => session.modules).reduce((counts, moduleName) => {
        counts[moduleName] = (counts[moduleName] || 0) + 1
        return counts
      }, {})

      sendJson(res, 200, {
        patientCount: patients.length,
        activePatientCount: patients.filter((patient) => patient.status === 'Active').length,
        sessionCount: sessions.length,
        completedSessionCount: completedSessions,
        totalMinutes,
        averageSessionMinutes: sessions.length ? Number((totalMinutes / sessions.length).toFixed(1)) : 0,
        sessionsByDevice: sessions.reduce((counts, session) => {
          counts[session.deviceType] = (counts[session.deviceType] || 0) + 1
          return counts
        }, {}),
        moduleUsage: moduleCounts,
      })
      return
    }

    const patientSessionsMatch = pathname.match(/^\/api\/patients\/([^/]+)\/sessions$/)
    if (patientSessionsMatch) {
      const patientId = decodeURIComponent(patientSessionsMatch[1])
      const patient = patients.find((item) => item.patientId === patientId)
      if (!patient) {
        sendJson(res, 404, { error: 'Patient not found' })
        return
      }
      sendJson(res, 200, sessions.filter((session) => session.patientId === patientId))
      return
    }

    const patientMatch = pathname.match(/^\/api\/patients\/([^/]+)$/)
    if (patientMatch) {
      const patientId = decodeURIComponent(patientMatch[1])
      const patient = patients.find((item) => item.patientId === patientId)
      if (!patient) {
        sendJson(res, 404, { error: 'Patient not found' })
        return
      }
      sendJson(res, 200, patientSummary(patient, sessions))
      return
    }

    const sessionMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/)
    if (sessionMatch) {
      const sessionId = decodeURIComponent(sessionMatch[1])
      const session = sessions.find((item) => item.sessionId === sessionId)
      if (!session) {
        sendJson(res, 404, { error: 'Session not found' })
        return
      }
      sendJson(res, 200, session)
      return
    }

    sendJson(res, 404, {
      error: 'Route not found',
      availableRoutes: [
        'GET /api/health',
        'GET /api/patients',
        'GET /api/patients/:patientId',
        'GET /api/patients/:patientId/sessions',
        'GET /api/sessions',
        'GET /api/sessions/:sessionId',
        'GET /api/summary',
      ],
    })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { error: 'Internal server error' })
  }
}

export function createServer() {
  return http.createServer(handleRequest)
}

if (process.argv[1] === __filename) {
  createServer().listen(PORT, () => {
    console.log(`Reflect Task 2 API running at http://localhost:${PORT}`)
    console.log(`Allowed frontend origin: ${FRONTEND_ORIGIN}`)
  })
}
