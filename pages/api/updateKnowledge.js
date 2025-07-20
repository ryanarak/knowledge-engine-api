// api/updateKnowledge.js
import { google } from 'googleapis';

// ✅ New default Shared Drive ID
const DEFAULT_SHARED_DRIVE_ID = '0ABKmvBuklL0lUk9PVA';

// 🧹 Helper: infer MIME type based on extension
function getMimeType(filename) {
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.md')) return 'text/markdown';
  if (filename.endsWith('.csv')) return 'text/csv';
  if (filename.endsWith('.html')) return 'text/html';
  return 'text/plain';
}

// 🫕 Helper: update the ledger with a new entry
async function updateLedger(drive, sharedDriveId, context, summary, logPath) {
  const ledgerFolderId = '1dCwS0nBKQjum7j6aN0ZMEUawI5fH-meS'; // Documentation - Archives
  const ledgerFileName = 'Randall_Memory_Ledger.json';

  try {
    const ledgerQuery = await drive.files.list({
      corpora: 'drive',
      driveId: sharedDriveId,
      q: `'${ledgerFolderId}' in parents and name='${ledgerFileName}' and trashed=false`,
      fields: 'files(id,name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    let ledgerFileId;
    let ledgerContent = [];

    if (ledgerQuery.data.files.length > 0) {
      ledgerFileId = ledgerQuery.data.files[0].id;
      const contentRes = await drive.files.get(
        { fileId: ledgerFileId, alt: 'media', supportsAllDrives: true },
        { responseType: 'text' }
      );
      try {
        ledgerContent = JSON.parse(contentRes.data || '[]');
      } catch {
        ledgerContent = [];
      }
    } else {
      const createRes = await drive.files.create({
        requestBody: {
          name: ledgerFileName,
          parents: [ledgerFolderId],
          mimeType: 'application/json'
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify([], null, 2)
        },
        fields: 'id',
        supportsAllDrives: true
      });
      ledgerFileId = createRes.data.id;
    }

    ledgerContent.push({
      timestamp: new Date().toISOString(),
      context,
      summary,
      logPath
    });

    await drive.files.update({
      fileId: ledgerFileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(ledgerContent, null, 2)
      },
      supportsAllDrives: true
    });

    console.log('🪵 Ledger updated successfully.');
  } catch (err) {
    console.error('⚠️ Ledger update failed:', err.message);
  }
}

// 🚀 Helper: trigger additional workflows (e.g., Slack)
async function triggerWorkflow(name, payload) {
  try {
    if (name === 'send_slack_message' && process.env.SLACK_TOKEN) {
      const { default: fetch } = await import('node-fetch'); // ✅ dynamic import for ESM
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
        },
        body: JSON.stringify({
          channel: '#general',
          text: payload?.text || 'No text provided'
        })
      });
      console.log('✅ Slack workflow triggered.');
    }
  } catch (err) {
    console.error('⚠️ Workflow trigger failed:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, content, folderId, context = 'General', trigger = false } = req.body;
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid filename' });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid content' });
  }

  try {
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('Missing GOOGLE_CREDENTIALS env variable');
    }

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    const sharedDriveId = process.env.SHARED_DRIVE_ID || DEFAULT_SHARED_DRIVE_ID;
    const targetFolderId = folderId || sharedDriveId;

    const mimeType = getMimeType(filename);
    console.log(`📄 Processing file: ${filename} (${mimeType}) in folder: ${targetFolderId}`);

    const listRes = await drive.files.list({
      corpora: 'drive',
      driveId: sharedDriveId,
      q: `name='${filename}' and '${targetFolderId}' in parents and trashed=false`,
      fields: 'files(id,name,webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    let action;
    let fileId;
    let webViewLink;

    if (listRes.data.files.length > 0) {
      fileId = listRes.data.files[0].id;
      await drive.files.update({
        fileId,
        media: { mimeType, body: content },
        supportsAllDrives: true
      });
      action = 'updated';
      const fileInfo = await drive.files.get({
        fileId,
        fields: 'webViewLink',
        supportsAllDrives: true
      });
      webViewLink = fileInfo.data.webViewLink;
      console.log(`✅ Updated file: ${filename}`);
    } else {
      const createRes = await drive.files.create({
        requestBody: {
          name: filename,
          parents: [targetFolderId],
          mimeType
        },
        media: { mimeType, body: content },
        fields: 'id,webViewLink',
        supportsAllDrives: true
      });
      fileId = createRes.data.id;
      webViewLink = createRes.data.webViewLink;
      action = 'created';
      console.log(`✅ Created file: ${filename}`);
    }

    const logPath = `https://drive.google.com/file/d/${fileId}/view`;
    const summary = `${action.toUpperCase()} file: ${filename}`;
    await updateLedger(drive, sharedDriveId, context, summary, logPath);

    if (trigger) {
      await triggerWorkflow('send_slack_message', { text: `${summary}\n${logPath}` });
    }

    return res.status(200).json({
      status: 'success',
      action,
      filename,
      fileId,
      webViewLink,
      logPath,
      ledger: 'updated',
      workflowTriggered: !!trigger
    });
  } catch (err) {
    console.error('❌ Error in updateKnowledge:', err);
    return res.status(500).json({ error: 'Failed to update Knowledge Engine', details: err.message });
  }
}

