
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:3001/api'

const pages = [
  'Overview',
  'Patients',
  'Activity',
  'Insights',
  'Reports'
]

function App() {
  const [page, setPage] = useState('Overview')
  const [patients, setPatients] = useState([])
  const [sessions, setSessions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const responses = await Promise.all([
        fetch(`${API}/patients`),
        fetch(`${API}/sessions`),
        fetch(`${API}/summary`)
      ])

      if (responses.some(response => !response.ok)) {
        throw new Error('Backend request failed')
      }

      const [patientData, sessionData, summaryData] =
        await Promise.all(
          responses.map(response => response.json())
        )

      if (
        !Array.isArray(patientData) ||
        !Array.isArray(sessionData) ||
        !summaryData
      ) {
        throw new Error('Unexpected backend data')
      }

      setPatients(patientData)
      setSessions(sessionData)
      setSummary(summaryData)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(
        'Could not connect to the backend. Make sure Talha’s server is running on port 3001.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const xrSessions =
    summary?.sessionsByDevice?.['XR Headset'] ?? 0

  const mobileSessions =
    (summary?.sessionsByDevice?.iOS ?? 0) +
    (summary?.sessionsByDevice?.Android ?? 0)

  const cards = [
    {
      title: 'Active Patients',
      value: summary?.activePatientCount ?? 0
    },
    {
      title: 'Total Sessions',
      value: summary?.sessionCount ?? 0
    },
    {
      title: 'XR Sessions',
      value: xrSessions
    },
    {
      title: 'Mobile Sessions',
      value: mobileSessions
    }
  ]

  function downloadReport() {
    const rows = [
      [
        'Session ID',
        'Patient ID',
        'Date',
        'Duration (Minutes)',
        'Device',
        'Modules',
        'Status'
      ],
      ...sessions.map(session => [
        session.sessionId,
        session.patientId,
        session.date,
        session.durationMinutes,
        session.deviceType,
        (session.modules ?? []).join('; '),
        session.completionStatus
      ])
    ]

    const csv = rows
      .map(row =>
        row.map(value =>
          `"${String(value ?? '').replace(/"/g, '""')}"`
        ).join(',')
      )
      .join('\r\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Reflect_XR_Mobile_Report.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>REFLECT</h2>
        <p>XR / Mobile</p>
        <hr />

        {pages.map(item => (
          <button
            key={item}
            className={page === item ? 'active' : ''}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="content">
        <header>
          <div>
            <h1>{page}</h1>
            <p>Reflect XR / Mobile Provider Dashboard</p>
          </div>
          <span>Demo Data</span>
        </header>

        {loading && (
          <section className="panel">
            <h2>Loading Dashboard</h2>
            <p>Connecting to the backend...</p>
          </section>
        )}

        {error && (
          <section className="panel">
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button onClick={loadDashboard}>
              Try Again
            </button>
          </section>
        )}

        {!loading && !error && (
          <>
            {page === 'Overview' && (
              <>
                <div className="stats">
                  {cards.map(card => (
                    <div
                      className="stat-card"
                      key={card.title}
                    >
                      <h3>{card.title}</h3>
                      <strong>{card.value}</strong>
                    </div>
                  ))}
                </div>

                <section className="panel">
                  <h2>Engagement Summary</h2>

                  <table>
                    <tbody>
                      <tr>
                        <th>Total Patients</th>
                        <td>{summary.patientCount}</td>
                      </tr>
                      <tr>
                        <th>Completed Sessions</th>
                        <td>{summary.completedSessionCount}</td>
                      </tr>
                      <tr>
                        <th>Total Engagement Time</th>
                        <td>{summary.totalMinutes} minutes</td>
                      </tr>
                      <tr>
                        <th>Average Session Duration</th>
                        <td>{summary.averageSessionMinutes} minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="panel">
                  <h2>Recent Activity</h2>

                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Device</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...sessions]
                        .sort((a, b) =>
                          `${b.date} ${b.startTime ?? ''}`
                            .localeCompare(
                              `${a.date} ${a.startTime ?? ''}`
                            )
                        )
                        .slice(0, 5)
                        .map(session => (
                          <tr key={session.sessionId}>
                            <td>{session.patientId}</td>
                            <td>{session.date}</td>
                            <td>{session.durationMinutes} min</td>
                            <td>{session.deviceType}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </section>
              </>
            )}

            {page === 'Patients' && (
              <section className="panel">
                <h2>Patient Overview</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Sessions</th>
                      <th>Device</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.patientId}>
                        <td>{patient.patientId}</td>
                        <td>{patient.sessionCount}</td>
                        <td>{patient.preferredDevice}</td>
                        <td>{patient.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {page === 'Activity' && (
              <section className="panel">
                <h2>Recent Patient Sessions</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Device</th>
                      <th>Module</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...sessions]
                      .sort((a, b) =>
                        `${b.date} ${b.startTime ?? ''}`
                          .localeCompare(
                            `${a.date} ${a.startTime ?? ''}`
                          )
                      )
                      .map(session => (
                        <tr key={session.sessionId}>
                          <td>{session.patientId}</td>
                          <td>{session.date}</td>
                          <td>{session.durationMinutes} min</td>
                          <td>{session.deviceType}</td>
                          <td>
                            {(session.modules ?? []).join(', ')}
                          </td>
                          <td>{session.completionStatus}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </section>
            )}

            {page === 'Insights' && (
              <>
                <div className="stats">
                  <div className="stat-card">
                    <h3>Average Session</h3>
                    <strong>
                      {summary.averageSessionMinutes} min
                    </strong>
                  </div>

                  <div className="stat-card">
                    <h3>Completed Sessions</h3>
                    <strong>
                      {summary.completedSessionCount}
                    </strong>
                  </div>

                  <div className="stat-card">
                    <h3>Total Minutes</h3>
                    <strong>
                      {summary.totalMinutes}
                    </strong>
                  </div>
                </div>

                <section className="panel">
                  <h2>Module Usage Insights</h2>

                  <table>
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Times Used</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        summary.moduleUsage ?? {}
                      ).map(([module, count]) => (
                        <tr key={module}>
                          <td>{module}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="panel">
                  <h2>Device Engagement</h2>

                  <table>
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Sessions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        summary.sessionsByDevice ?? {}
                      ).map(([device, count]) => (
                        <tr key={device}>
                          <td>{device}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </>
            )}

            {page === 'Reports' && (
              <>
                <section className="panel">
                  <h2>Provider Activity Report</h2>

                  <table>
                    <tbody>
                      <tr>
                        <th>Total Patients</th>
                        <td>{summary.patientCount}</td>
                      </tr>
                      <tr>
                        <th>Active Patients</th>
                        <td>{summary.activePatientCount}</td>
                      </tr>
                      <tr>
                        <th>Total Sessions</th>
                        <td>{summary.sessionCount}</td>
                      </tr>
                      <tr>
                        <th>Completed Sessions</th>
                        <td>{summary.completedSessionCount}</td>
                      </tr>
                      <tr>
                        <th>Total Minutes</th>
                        <td>{summary.totalMinutes}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="panel">
                  <h2>Download Session Report</h2>
                  <p>
                    Export the sample patient session records
                    as a CSV file.
                  </p>

                  <button onClick={downloadReport}>
                    Download CSV Report
                  </button>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
