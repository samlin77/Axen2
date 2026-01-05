# Google Workspace MCP Setup Guide

This guide explains how to configure Google Workspace MCP servers (Calendar, Gmail, Drive, Docs, Sheets) in Axen.

## Prerequisites

- Python 3.11 or higher
- `uvx` package manager (installed automatically with modern Python)
- Google Cloud Project with OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Project:

1. Go to **APIs & Services > Library**
2. Search for and enable each API:
   - **Google Calendar API** - For calendar integration
   - **Gmail API** - For email management
   - **Google Drive API** - For file storage
   - **Google Docs API** - For document editing
   - **Google Sheets API** - For spreadsheet operations

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Configure the consent screen if prompted:
   - User Type: **External** (for testing) or **Internal** (for organization)
   - App name: `Axen AI Agent Platform`
   - User support email: Your email
   - Developer contact: Your email
4. Application type: **Desktop app**
5. Name: `Axen Desktop Client`
6. Click **Create**
7. Download the credentials JSON or copy:
   - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123xyz`)

## Step 4: Configure Axen Environment Variables

1. Open `dive-app/.env` file
2. Add your OAuth credentials:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here
```

3. Save the file

## Step 5: Install Python Dependencies

The Google Workspace MCP server uses Python. Ensure you have:

```bash
# Check Python version (must be 3.11+)
python3 --version

# Install uvx if not already installed
pip3 install uv
```

## Step 6: Connect MCP Servers in Axen

1. Launch Axen desktop app: `npm run tauri:dev`
2. Navigate to **MCP Servers** tab
3. You'll see the following Google Workspace servers:
   - **Google Calendar** - Manage events, scheduling, availability
   - **Gmail** - Search, send, organize emails
   - **Google Drive** - Upload, download, search files
   - **Google Docs** - Create, read, edit documents
   - **Google Sheets** - Create, read, edit spreadsheets

4. Click **Connect All** or connect individual servers

## Step 7: OAuth Authentication Flow

When connecting a Google Workspace server for the first time:

1. A browser window will open automatically
2. Sign in to your Google account
3. Grant permissions to Axen
4. The browser will show "Authentication successful"
5. Return to Axen - the server should now show **Connected**

## Troubleshooting

### "Missing OAuth credentials" error

**Cause:** Environment variables not set correctly

**Solution:**
- Verify `.env` file contains `VITE_GOOGLE_OAUTH_CLIENT_ID` and `VITE_GOOGLE_OAUTH_CLIENT_SECRET`
- Restart the Tauri app after updating `.env`

### "API not enabled" error

**Cause:** Required Google API not enabled in Cloud Console

**Solution:**
- Go to Google Cloud Console > APIs & Services > Library
- Enable the specific API mentioned in the error message
- Wait 1-2 minutes for activation
- Try connecting again

### "Invalid redirect URI" error

**Cause:** OAuth consent screen configuration mismatch

**Solution:**
- Go to Google Cloud Console > APIs & Services > Credentials
- Edit your OAuth 2.0 Client ID
- Ensure Application Type is "Desktop app"
- No redirect URIs should be configured for desktop apps

### Connection timeout

**Cause:** Network issues or MCP server startup delay

**Solution:**
- Check internet connection
- Try disconnecting and reconnecting
- Check Tauri console logs for detailed error messages

## Available Tools per Server

### Google Calendar
- `calendar_list` - List all calendars
- `event_list` - List events in a calendar
- `event_create` - Create new event
- `event_update` - Update existing event
- `event_delete` - Delete event

### Gmail
- `gmail_search` - Search emails
- `gmail_send` - Send email
- `gmail_list` - List messages
- `gmail_read` - Read email content
- `gmail_label` - Apply labels

### Google Drive
- `drive_list` - List files/folders
- `drive_search` - Search files
- `drive_upload` - Upload file
- `drive_download` - Download file
- `drive_delete` - Delete file
- `drive_share` - Share file

### Google Docs
- `docs_create` - Create new document
- `docs_read` - Read document content
- `docs_update` - Update document
- `docs_append` - Append to document

### Google Sheets
- `sheets_create` - Create new spreadsheet
- `sheets_read` - Read spreadsheet data
- `sheets_update` - Update cells
- `sheets_append` - Append rows

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use separate OAuth credentials** for development and production
3. **Rotate credentials** if they're accidentally exposed
4. **Limit API scopes** to only what's needed
5. **Review OAuth consent screen** regularly

## Next Steps

After connecting Google Workspace MCP servers:

1. Test basic operations using the **Tool Tester** in MCP Servers tab
2. Use Google tools in AI conversations
3. Explore agentic workflows combining multiple Google services
4. Configure additional MCP servers as needed

## References

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Workspace MCP GitHub](https://github.com/google/mcp)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
