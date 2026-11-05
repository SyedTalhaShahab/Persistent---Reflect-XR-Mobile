# Task 2 Sample Data

This folder contains **synthetic demonstration data only**. It does not contain real patient information or protected health information (PHI).

## patients.json
Each patient record contains:
- `patientId`: synthetic unique identifier
- `displayName`: generic display label
- `ageRange`: broad age band for demo purposes
- `program`: program name
- `enrollmentDate`: ISO date (`YYYY-MM-DD`)
- `status`: current demo status
- `preferredDevice`: XR Headset, iOS, or Android
- `lastSessionDate`: date of the most recent sample session

## sessions.json
Each session record contains:
- `sessionId`: unique session identifier
- `patientId`: links the session to a patient
- `date`: session date
- `startTime`: local demo time
- `durationMinutes`: session length
- `deviceType`: XR Headset, iOS, or Android
- `modules`: one or more Reflect modules used during the session
- `completionStatus`: whether the sample session completed normally

The modules used in the sample data are:
- Create
- Learn
- Reflect
- Creative Calm
