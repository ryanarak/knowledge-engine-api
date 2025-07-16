import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get filename and content from request body
  const { filename, content } = req.body;

  try {
    // Load service account credentials from environment variable
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      throw new Error('Missing GOOGLE_SERVICE_ACCOUNT environment variable');
    }
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // Authorize with Google Drive
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Find the folder ID for "Knowledge Engine"
    const folderQuery = "name='Knowledge Engine' and mimeType='application/vnd.google-apps.folder'";
    const folderRes = await drive.files.list({ q: folderQuery });
    if (!folderRes.data.files || folderRes.data.files.length === 0) {
      throw new Error('Knowledge Engine folder not found');
    }
    const folderId = folderRes.data.files[0].id;

    // Check if file already exists in that folder
    const fileQuery = `name='${filename}' and '${folderId}' in parents`;
    const fileRes = await drive.files.list({ q: fileQuery });

    if (fileRes.data.files && fileRes.data.files.length > 0) {
      // File exists → update it
      const fileId = fileRes.data.files[0].id;
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/plain', body: content },
      });
    } else {
      // File does not exist → create it
      await drive.files.create({
        requestBody: {
          name: filename,
          parents: [folderId],
          mimeType: 'text/plain',
        },
        media: { mimeType: 'text/plain', body: content },
      });
    }

    res.status(200).json({ status: 'success', message: `Updated ${filename}` });
  } catch (err) {
    console.error('Error updating Knowledge Engine:', err);
    res.status(500).json({ error: 'Failed to update Knowledge Engine', details: err.message });
  }
}

