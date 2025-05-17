# Suno Authentication Service

A dedicated authentication service for Suno.com that handles Google OAuth login and session management. This service is designed to be deployed to Railway.app.

## Features

- Google OAuth authentication for Suno.com
- Session verification and management
- Stealth browser automation to prevent detection
- Secure API key authentication
- Detailed logging and error handling

## Prerequisites

- Node.js 18+
- A Railway.app account
- Google account credentials for Suno login
- Git (for deployment)

## Environment Variables

The following environment variables need to be set in Railway:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port to run the service on | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `GOOGLE_EMAIL` | Google email for Suno login | `your.email@gmail.com` |
| `GOOGLE_PASSWORD` | Google password for Suno login | `your-password` |
| `API_KEY` | API key to secure this service | `your-secret-api-key` |
| `LOG_LEVEL` | Logging level | `info` |

## Deployment to Railway

1. **Create a new Railway project**

   From your Railway dashboard, click on "New Project" and select "Deploy from GitHub repo".

2. **Connect your GitHub repository**

   Connect your GitHub account and select the repository containing this service.

3. **Configure environment variables**

   In the Railway dashboard, go to the "Variables" tab and add all the required environment variables listed above.

4. **Deploy the service**

   Railway will automatically deploy your service. You can check the deployment status in the "Deployments" tab.

5. **Get your service URL**

   Once deployed, Railway will provide a unique URL for your service. You'll use this URL to make API requests.

## API Endpoints

### Authentication

#### `POST /api/auth/google`

Authenticate with Google for Suno.com.

**Request**:
```json
{
  "email": "your.email@gmail.com",
  "password": "your-password"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "sessionId": "session_1621234567890",
  "sessionData": "sessionid=abc123; csrftoken=xyz456",
  "expiresAt": "2023-06-01T12:00:00.000Z"
}
```

#### `POST /api/auth/verify`

Verify if a session is still valid.

**Request**:
```json
{
  "sessionData": "sessionid=abc123; csrftoken=xyz456"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true
}
```

#### `GET /api/auth/health`

Check if the service is running.

**Response**:
```json
{
  "success": true,
  "message": "Authentication service is running",
  "version": "1.0.0",
  "timestamp": "2023-05-31T12:00:00.000Z"
}
```

## How to Make Requests

All endpoints (except `/api/auth/health`) require the `x-api-key` header with your API key:

```
x-api-key: your-secret-api-key
```

Example using curl:

```bash
curl -X POST https://your-railway-url.railway.app/api/auth/google \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{"email": "your.email@gmail.com", "password": "your-password"}'
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Building for Production

```bash
# Build TypeScript files
npm run build

# Start production server
npm start
```

## Security Considerations

- Store your Google credentials securely as Railway environment variables
- Use a strong, unique API key to protect the service
- The service uses HTTPS by default on Railway
- Consider implementing IP restrictions for additional security

## Troubleshooting

- Check the logs in Railway dashboard for errors
- Screenshot files in `/temp` directory can help diagnose authentication issues
- Verify your Google account doesn't have 2FA enabled (or implement 2FA handling)