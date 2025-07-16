import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, content } = req.body;

  try {
    // Load OAuth client credentials (from file or env var)
    const credentialsPath = path.join(process.cwd(), 'credentials.json'); // your OAuth client secret JSON
    const tokenPath = path.join(process.cwd(), 'token.json'); // saved token from OAuth flow

    if (!fs.existsSync(credentialsPath)) {
      throw new Error('Missing credentials.json (download OAuth client secret from Google Cloud)');
    }
    if (!fs.existsSync(tokenPath)) {
      throw new Error('Missing token.json (run OAuth flow to generate it)');
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Find the folder ID for "Knowledge Engine"
    const folderQuery = "name='Knowledge Engine' and mimeType='application/vnd.google-apps.folder' and trashed=false";
    const folderRes = await drive.files.list({ q: folderQuery, fields: 'files(id,name)' });
    if (!folderRes.data.files || folderRes.data.files.length === 0) {
      throw new Error('Knowledge Engine folder not found');
    }
    const folderId = folderRes.data.files[0].id;

    // Check if the file exists in that folder
    const fileQuery = `name='${filename}' and '${folderId}' in parents and trashed=false`;
    const fileRes = await drive.files.list({ q: fileQuery, fields: 'files(id,name)' });

    if (fileRes.data.files && fileRes.data.files.length > 0) {
      // Update existing file
      const fileId = fileRes.data.files[0].id;
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/plain', body: content },
      });
    } else {
      // Create new file
      await drive.files.create({
        requestBody: {
          name: filename,
          parents: [folderId],
          mimeType: 'text/plain',
        },
        media: { mimeType: 'text/plain', body: content },
      });
    }

    return res.status(200).json({ status: 'success', message: `Updated ${filename}` });
  } catch (err) {
    console.error('Error updating Knowledge Engine:', err);
    return res.status(500).json({ error: 'Failed to update Knowledge Engine', details: err.message });
  }
}

