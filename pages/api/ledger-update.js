// api/ledger-update.js
import { getDrive } from '../drive';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { context, summary, logPath } = req.body;
  if (!context || !summary || !logPath) {
    res.status(400).json({ error: 'Missing context, summary, or logPath' });
    return;
  }

  try {
    const drive = getDrive();

    // 🔥 Directly use the new folder ID for "Documentation / Archives"
    const folderId = '1dCwS0nBKQjum7j6aN0ZMEUawI5fH-meS';

    // 2. Find or create the ledger file
    const fileName = 'Randall_Memory_Ledger.json';
    let fileRes = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    let fileId;
    let ledger = [];
    if (!fileRes.data.files.length) {
      // Create the ledger file if it doesn't exist
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
      const contentRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );
      try {
        ledger = JSON.parse(contentRes.data || '[]');
      } catch {
        ledger = [];
      }
    }

    // 3. Append the new entry
    ledger.push({
      timestamp: new Date().toISOString(),
      context,
      summary,
      logPath,
    });

    // 4. Update the file with new content
    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(ledger, null, 2),
      },
    });

    res.status(200).json({ success: true, message: 'Ledger updated', fileId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

