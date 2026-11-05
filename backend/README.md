# Reflect Provider Dashboard - Task 2 Backend and Data

This folder completes the backend/data portion of the project using synthetic demonstration data.

## What is included

- `data/patients.json` - sample patient records
- `data/sessions.json` - organized session records containing dates, duration, device type, and modules
- `server.js` - simple dependency-free Node.js REST API
- `api.test.js` - basic automated API tests
- `.env.example` - example local configuration
- `package.json` - backend start/test scripts

## Run the API

From the project root:

```bash
cd backend
npm start
```

The API starts at:

```text
http://localhost:3001
```

No npm packages need to be installed because this implementation uses Node.js built-in modules.

## Test the API

```bash
cd backend
npm test
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Confirms the API is running |
| GET | `/api/patients` | Returns all patients plus session summary values |
| GET | `/api/patients/:patientId` | Returns one patient summary |
| GET | `/api/patients/:patientId/sessions` | Returns sessions for one patient |
| GET | `/api/sessions` | Returns all sessions |
| GET | `/api/sessions/:sessionId` | Returns one session |
| GET | `/api/summary` | Returns overall dashboard statistics |

## Optional session filters

`GET /api/sessions` supports these query parameters:

```text
/api/sessions?patientId=P-1001
/api/sessions?deviceType=XR%20Headset
/api/sessions?module=Reflect
```

## Example frontend request

```js
const response = await fetch('http://localhost:3001/api/patients')
const patients = await response.json()
```

The local API only accepts browser requests from `http://localhost:5173` by default. Set `FRONTEND_ORIGIN` to a different origin when needed.

## Important

All records in this folder are synthetic. Do not replace them with real patient information until the production authentication, authorization, encryption, auditing, privacy, and data-governance requirements have been implemented and reviewed.
