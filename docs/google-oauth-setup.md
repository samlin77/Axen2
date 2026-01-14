# Google Workspace OAuth Setup for Axen

## Quick Setup Guide

### Step 1: Start the OAuth Callback Server

The workspace-mcp server needs to run to handle the OAuth callback.

**Option A: Use the test script (Recommended)**
```bash
./test-google-oauth.sh
```

This will:
- Load your OAuth credentials from `.env`
- Start workspace-mcp with a callback server on port 8000
- Wait for you to authorize in your browser

**Option B: Manual startup**
```bash
cd dive-app
export GOOGLE_OAUTH_CLIENT_ID=$(grep VITE_GOOGLE_OAUTH_CLIENT_ID .env | cut -d'=' -f2)
export GOOGLE_OAUTH_CLIENT_SECRET=$(grep VITE_GOOGLE_OAUTH_CLIENT_SECRET .env | cut -d'=' -f2)
uvx workspace-mcp --tools calendar
```

### Step 2: Authorize Google Calendar Access

When you first try to use Google Calendar tools, workspace-mcp will generate an authorization URL.

**Click this link to authorize:**

https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=851098345392-likb2dgqcsmfc3jd7ep966rj3flq13f1.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Foauth2callback&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=RANDOM_STATE&access_type=offline&prompt=consent

**What will happen:**
1. Browser opens to Google sign-in page
2. Sign in with: `samlin77@gmail.com`
3. Google asks for permission to access your calendar
4. Click "Allow"
5. Browser redirects to `http://localhost:8000/oauth2callback?code=...`
6. The workspace-mcp server receives the authorization code
7. Credentials are saved to: `~/.google_workspace_mcp/credentials/samlin77@gmail.com.json`

### Step 3: Verify It Works

After authorization, test the connection:

```bash
python3 test-calendar-tool.py
```

You should see your calendars listed!

## Troubleshooting

### "Port 8000 already in use"

Kill the process using port 8000:
```bash
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill
```

### "Authorization error" even after authorizing

The existing credentials might need new scopes. Delete them and re-authorize:
```bash
rm ~/.google_workspace_mcp/credentials/samlin77@gmail.com.json
# Then run the auth flow again
```

### "Credentials not found"

Make sure the OAuth callback server is running when you click the authorization link. The server must be active to receive the callback.

## OAuth Credentials Location

- **App credentials (OAuth Client ID/Secret):** `dive-app/.env`
- **User tokens (after authorization):** `~/.google_workspace_mcp/credentials/samlin77@gmail.com.json`

## Required Scopes

The authorization requests these Google Calendar scopes:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.readonly` - Read-only access
- `https://www.googleapis.com/auth/calendar.events` - Events management
- `https://www.googleapis.com/auth/userinfo.email` - Email address
- `https://www.googleapis.com/auth/userinfo.profile` - Basic profile
- `openid` - OpenID Connect

## Integration with Axen

Once OAuth is complete, Axen can:
1. Connect to Google Calendar MCP server
2. List your calendars
3. Read events
4. Create/modify/delete events
5. All through the AI chat interface!

The MCP backend implementation in `src-tauri/src/main.rs` automatically:
- Loads OAuth credentials from `.env`
- Passes them to the workspace-mcp subprocess
- Handles the OAuth flow when tools are called
