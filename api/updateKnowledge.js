import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, content } = req.body;

  try {
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('Missing GOOGLE_CREDENTIALS env variable');
    }
    if (!process.env.GOOGLE_TOKEN) {
      throw new Error('Missing GOOGLE_TOKEN env variable');
    }

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const token = JSON.parse(process.env.GOOGLE_TOKEN);

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // ✅ Use the exact folder ID instead of searching by name
    const folderId = '10jDyDi9RO-QHabrHHURXp9laVmhulIRH';

    // Check if file exists in that folder
    const fileQuery = `name='${filename}' and '${folderId}' in parents and trashed=false`;
    const fileRes = await drive.files.list({ q: fileQuery, fields: 'files(id,name)' });

    if (fileRes.data.files && fileRes.data.files.length > 0) {
      // Update file
      const fileId = fileRes.data.files[0].id;
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/plain', body: content },
      });
    } else {
      // Create file
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

