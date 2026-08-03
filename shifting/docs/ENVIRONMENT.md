# Environment configuration

This service reads its configuration from Spring profiles:

- **`dev`** (default) — reads `src/main/resources/application-dev.properties`, a
  gitignored file with real local values. Copy `application.properties.example`
  to `application-dev.properties` and fill it in to get started.
- **`prod`** — reads `src/main/resources/application-prod.properties`, which
  contains no real values, only environment-variable placeholders. Every
  variable below is required and the app will fail to start if any is missing.

Activate a profile by setting `SPRING_PROFILES_ACTIVE` (defaults to `dev` if unset).

## Required environment variables (`SPRING_PROFILES_ACTIVE=prod`)

| Variable | Purpose |
|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL, e.g. `jdbc:mysql://host:3306/shift` |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `APP_JWT_SECRET` | Strong random secret (256+ bits) for signing JWTs |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SPRING_MAIL_USERNAME` | Gmail address used to send email |
| `SPRING_MAIL_PASSWORD` | Gmail **App Password** (not the account password) |
| `APP_MAIL_FROM` | From-address shown to recipients |
| `APP_FRONTEND_URL` | Public URL of the frontend (used in email links) |
| `OPENROUTESERVICE_API_KEY` | OpenRouteService API key |
| `GEMINI_API_KEY` | Gemini API key |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origin(s) |

## Optional environment variables (have safe defaults everywhere)

| Variable | Default | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Which profile to activate |
| `APP_JWT_EXPIRATION_MS` | `86400000` (24h) | JWT expiration in milliseconds |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `SPRING_MAIL_PORT` | `587` | SMTP port |
