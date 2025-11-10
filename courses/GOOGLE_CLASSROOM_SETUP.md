# Google Classroom Integration Setup

This document explains how to set up Google Classroom integration for the courses system.

## Prerequisites

1. A Google Cloud Project
2. Google Classroom API enabled
3. Google Docs API enabled
4. Google Drive API enabled
5. OAuth 2.0 credentials configured

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs

Enable the following APIs in your Google Cloud Project:

- **Google Classroom API**
  - Go to APIs & Services > Library
  - Search for "Google Classroom API"
  - Click "Enable"

- **Google Docs API**
  - Search for "Google Docs API"
  - Click "Enable"

- **Google Drive API**
  - Search for "Google Drive API"
  - Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Choose "External" (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: "Wilmington High School Computer Science"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/classroom.coursework.me`
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive.file`
5. Add test users (students who will use the app)
6. Save and continue

### 4. Create OAuth 2.0 Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `https://wildcatklavigne.github.io` (or your domain)
   - `http://localhost:8000` (for local testing)
5. Add authorized redirect URIs:
   - `https://wildcatklavigne.github.io/courses/` (or your domain)
   - `http://localhost:8000/courses/` (for local testing)
6. Click "Create"
7. Copy the **Client ID** (not the client secret)

### 5. Configure the Application

1. Open `courses/script.js`
2. Find the line: `const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';`
3. Replace `'YOUR_GOOGLE_CLIENT_ID'` with your actual Client ID from step 4
4. Save the file

### 6. Deploy and Test

1. Commit and push your changes to GitHub
2. Wait for GitHub Pages to deploy
3. Open a module in the courses system
4. Click "Show My Responses (print view)"
5. In the print view, click "Sign in with Google"
6. Complete the OAuth flow
7. Select a course and assignment
8. Submit your response

## Important Notes

- **Student submissions must exist**: Students need to open the assignment in Google Classroom first before they can submit through this system. This creates the initial submission record.

- **Permissions**: Students will need to grant permissions for:
  - Viewing their Google Classroom courses
  - Creating Google Docs
  - Attaching files to assignments
  - Submitting assignments

- **Security**: Never commit your OAuth client secret to the repository. Only the Client ID is needed in the frontend code.

- **Testing**: During development, you can add test users in the OAuth consent screen. Once published, any Google account can use the app (subject to your consent screen settings).

## Troubleshooting

### "Please configure your Google OAuth Client ID"
- Make sure you've replaced `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

### "No active courses found"
- The student must be enrolled in at least one active Google Classroom course
- Make sure the student is signed in with the correct Google account

### "No assignments found for this course"
- The course must have at least one assignment
- The assignment must be accessible to the student

### "No submission found"
- The student must open the assignment in Google Classroom first
- This creates the initial submission record that this system uses

### API Errors
- Check that all required APIs are enabled
- Verify your OAuth credentials are correct
- Check the browser console for detailed error messages

## Support

For issues or questions, contact the system administrator.

