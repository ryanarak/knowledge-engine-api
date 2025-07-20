// pages/api/ledger-update.js
import { getDrive } from '../../drive'; // ✅ fixed import path

export default async function handler(req, res) {
  // ✅ Set JSON header early
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed. Use PATCH.' });
    return;
  }

  const { context, summary, logPath } = req.body;
  if (!context || !summary || !logPath) {
    res.status(400).json({ error: 'Missing required fields: context, summary, or logPath.' });
    return;
  }

  try {
    const drive = getDrive();

    // ✅ Replace with your correct folder ID if needed
    const folderId = '1dCwS0nBKQjum7j6aN0ZMEUawI5fH-meS';
    const fileName = 'Randall_Memory_Ledger.json';

    // 🔎 Search for an existing ledger file
    const fileRes = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    let fileId;
    let ledger = [];

    if (!fileRes.data.files || fileRes.data.files.length === 0) {
      // 🆕 Create a new ledger file if not found
      const createRes = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify([], null, 2),
        },
        fields: 'id',
      });
      fileId = createRes.data.id;
    } else {
      fileId = fileRes.data.files[0].id;

      // 📥 Fetch current ledger content
      const contentRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );
      try {
        ledger = JSON.parse(contentRes.data || '[]');
        if (!Array.isArray(ledger)) {
          console.warn('Ledger content was not an array. Resetting.');
          ledger = [];
        }
      } catch (parseErr) {
        console.error('Error parsing existing ledger JSON:', parseErr);
        ledger = [];
      }
    }

    // 📝 Append new entry
    ledger.push({
      timestamp: new Date().toISOString(),
      context,
      summary,
      logPath,
    });

    // 📤 Update the file on Google Drive
    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(ledger, null, 2),
      },
    });

    res.status(200).json({ success: true, message: 'Ledger updated', fileId });
  } catch (err) {
    console.error('Error in ledger-update handler:', err);
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}

