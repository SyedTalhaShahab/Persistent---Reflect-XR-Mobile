## Recommended architecture

```text
Reflect XR / Reflect Mobile
          |
          v
Approved application/backend services
          |
          v
Secure database or approved health-data source
          |
          v
Authenticated Provider Dashboard API
          |
          v
Provider Dashboard frontend
```

## 1. Authentication

Require providers to sign in through an approved identity provider. Use modern standards such as OpenID Connect/OAuth 2.0 rather than creating a custom password system when an organizational identity solution is available.

Recommended controls:
- Multi-factor authentication where appropriate
- Short-lived access tokens
- Secure, HttpOnly, SameSite cookies when cookie-based sessions are used
- Automatic session expiration
- Secure logout and token revocation

## 2. Authorization

Authentication answers "Who is this user?" Authorization answers "What may this user see or do?"

Use role-based or attribute-based access control so a provider can access only authorized patients, programs, and actions.

Examples:
- Provider: view assigned patient/session information
- Program Manager: view approved aggregate program information
- Administrator: manage accounts and permissions

Every backend endpoint must enforce authorization. Hiding a button in the frontend is not sufficient security.

## 3. Data minimization

Only send information the dashboard actually needs.

For example, the session list may need:
- Patient identifier
- Session date
- Duration
- Device type
- Modules used

It may not need unrelated profile information. Prefer pseudonymous internal identifiers instead of exposing unnecessary identifying information.

## 4. Encryption

Production traffic should use HTTPS/TLS. Sensitive stored information should be encrypted at rest using the cloud/database platform's approved encryption features.

Do not store secrets, database passwords, API keys, or private tokens in frontend JavaScript or in GitHub. Store backend secrets in an approved secret manager or protected environment variables.

## 5. API security

The production API should add controls beyond this demo API:
- Input validation
- Strict CORS configuration
- Authentication middleware
- Authorization checks
- Request rate limiting
- Secure response headers
- Error handling that does not expose internal details
- API versioning if the interface will evolve

## 6. Audit logging

Log security-relevant actions such as:
- Provider login/logout
- Patient record access
- Report generation/export
- Permission changes
- Failed authorization attempts

Audit logs should avoid recording unnecessary sensitive content and should be protected from modification.

## 7. Database design

A production database could separate records into tables/collections such as:
- Users/providers
- Patients or participant profiles
- Provider-patient assignments
- Sessions
- Modules
- Audit events

Use database constraints and foreign keys where appropriate so session records cannot reference nonexistent patients.

## 8. Privacy and healthcare review

Before connecting real patient or health-related information, the team should confirm the applicable organizational, contractual, privacy, and healthcare requirements with Persistent Technology and the data owner. If protected health information is involved, qualified personnel should determine which HIPAA and other security/privacy obligations apply to the deployed system.

## 9. Migration path from this prototype

1. Keep the frontend API calls stable.
2. Replace JSON-file reads in `backend/server.js` with a database/service layer.
3. Add organizational authentication.
4. Add patient-level authorization to every API request.
5. Configure HTTPS and production CORS rules.
6. Move all secrets into approved secret storage.
7. Add audit logs and monitoring.
8. Perform security/privacy testing before real data is introduced.

This approach lets the current prototype demonstrate functionality without pretending that synthetic local data is production-ready healthcare infrastructure.
