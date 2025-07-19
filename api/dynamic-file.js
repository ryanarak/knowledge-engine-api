import { google } from 'googleapis';

// 🔥 Direct mapping from folder names to their exact Google Drive folder IDs
const folderMap = {
  "Compliance": "1CBNiEqTPVN9JEosAZLCRgnY3QpYQoGcX",
  "Accounting": "1iCGd4Y64Kv5ynAg6dnzz9OBNdgYfP2lE",
  "Achievements": "1b9yYmJ8uDKOI0MKsgLXkCR2Jwzhk9MW5",
  "Ads / Advertisements": "1n8ilen86sTWSJGqRYktdmfEEC8LR59Ou",
  "Art & Media": "15hIjq7-8-Df_s65RkHEBCSsMJijwd_RI",
  "Automation": "1jhiF-omC1zP0d5B0GgFgwbNHbrc8ZSDX",
  "Branding / Brand Identity": "1snOqXBFU3_NQ768DTbYWJ-SZa8zhu6fA",
  "Business Development": "1DTp1yx3Va05_gcFpKFAtzbSrDFDjd-i4",
  "Checklists": "1UyTbG3stZK00vPBhMpi4XK_UZHOsky2w",
  "Clients": "1aAV4yGvHCYmmxRe2olrSPOuHdsh8XBBC",
  "Community": "1Nj44F2S5SPglYGHY6tD0fTmqsmuAyNY6",
  "Culture": "1HkH8CjmM4VRLPnrgxp9MckcLl32AcTHM",
  "Customer Insights / Feedback": "1YaZYN8xDhcSsyC6sxlq8Fl0hv1FnL8vB",
  "Customer Support": "1v9kxS1MO64kjDiGGBxNQf7l7mTVF-0N3",
  "Data & Analytics": "14dxgzjfTZbsi9xKUbCZ0nAv0GGwHpvet",
  "Data Science & AI": "15B3lyTQnLI5Ti1nSLYg52xweqnP6b2yS",
  "Decisions": "1_FeqB60Da9tQfsJXLrD95LW4t41pE_P0",
  "Design": "1sEywdBz3K9e4y9KeHmuV9DP5VY6rlDqF",
  "DevOps": "1AemAkWb5_oVP2BWoyEoldjXJCIiRl_z7",
  "Documentation / Archives": "1iNptxmzRJAIM349NfuQh4hiO1tEc8wcH",
  "Economics": "17jBJYdhfz6OUu58V9PSgFtBU70o20Nsp",
  "Education": "1HY7RxF-Fsm7ikPoESuecilieOWLuTVT6",
  "Engineering": "1MJJ2Xn_tAAZ2jC-nqA2Fv8YwaaWpbDmt",
  "Environment & Sustainability": "1cga12MSrrJXmZnh1DeI2hrkZUmvL1BF5",
  "Ethics": "12LblmSRckm94t8jQFjaju2Iw3D7BEJ-7",
  "Events": "1DnvpTVperFw_AfYuc-LB3ndOSQ9Rr_hV",
  "Experiments": "1RcXGs0FZ4cIszRZQ00-PCSkMi-rViVCV",
  "Feedback": "1X2Yk7nsDxVryXlKAgJr8YRvxcDU_bb9v",
  "Finance": "1gbEd8Hj1XcKhUHMSIipJfxmBQwJTUe4B",
  "Goals": "1medyNMgmls-3GNM2q8zRv9xxH5f1iRD6",
  "Health": "1BAzVieHxbW6fhzU_LhfxH8f4Ke6lpR5t",
  "Human Resources": "1mKHaCWZTZ6v6y0djXcA_WDfWU_kQDsn1",
  "Humanities": "1LhgqXqwnj0abJEWQ2PAdG9J_sP_8Vreq",
  "Innovation": "1CTit6VQVFsWHv5opkszB1k5HMZg0hjMG",
  "Insights": "1iVtjPdFVEoLSqU9ZG6XJ7gs9YoyxhriX",
  "Integrations": "1I5JPpuSKsYzqB2gT6iwkFyDtULH-T0rU",
  "Knowledge Management": "1epjGTyDUZ5PSaAlEh4nbvOjHkAdQw0yV",
  "Knowledge Shares": "1OcPxrof4DERMXQ5MWosTRgzMDG2TlX_X",
  "Learning Resources": "1u15DDCvjklevVQcLCvH2tZvIy3EB__17",
  "Legacy": "1Wa8vNcRm2VtvqOp4XsqISSxFaxJ6Azso",
  "Legal": "1VhUFcnv73jP5t-7crhB_3PisptoqvYlE",
  "Linguistics": "1O_ConaZg3fkC5q7MK6p-UrA2RAUr31Ei",
  "Logs": "1uYkXclxWV7-nb7ai8aJf7qapoD0g-9T2",
  "Marketing": "1cWw-q_lb8Q6N0__BStS9llsHU-6zqo2C",
  "Math": "1EGEJXRc8Ko0LQ2lu8bwT0zLaQQae4ois",
  "Mentorship": "1zGAivyhB3GgQhJx_e67ca1P9PP3iCKmO",
  "Narratives": "1wJnRMHMAPyu8QGuNSvS4SWGMzCoe4KFh",
  "Onboarding": "1bh74_kIoJw4G9ypJystUApqeKGxmEm6G",
  "Operations": "1q8_VNzb3wRS3tg_Sf9Ww1yC0zvsXHZRL",
  "Partnerships": "1E_9bZh7v7507r-_0-gvRCdZz5Imm9xlp",
  "Philosophy": "1-OXvc0T_PEdCeN_87-Zz_ne_qDcNxalP",
  "Playbooks": "1Fd2o35HUpwNQSTi3wprCijQTNKcLbW-H",
  "Policy & Governance": "1H0GIzaj81Mh7QJPmyCHdusYhOL7x1KY6",
  "Product Development": "1aNI2KdLjLZvo8a-_nOiTGnEWXcPH9FbM",
  "Programming": "1qR5NKdlDXpujDIEUNUCyMB1AYq3RQQ6G",
  "Projects": "1pXi4K7fxdAc4sQ4Q2hiMikCdFpQV3V8K",
  "Psychology": "1FU48NNbuwPZP5svusrLEt54r3PKfVghI",
  "Reflection": "1Ou_cF-iWBqUa6N9qwgXF5oqtZnckeNbu",
  "Relationships": "1PJB1MqTtJ62gc7EOzRpLeH9woRHBTU81",
  "Research": "1ueNjXDEFRgp4txhEiRqE6AfYI9yCByD6",
  "Sales": "1RSa9dy0E_mmd-EWRK_ejoXhTZBY-gIxl",
  "Sandbox": "1eMlYz2FKZcOgmAUR-3jKgeXIYGW9Eobu",
  "Science": "1UZntFQRwXqmCABypIUFxgBoafW3W3ZVt",
  "Security": "1wMbGirRfyDZ5kPktrpDrT6qpWm56_lTu",
  "Sociology": "1pBxlEQoNeFMivR4e9Q2G8PHFQbWzqTLN",
  "Spiritual": "1knFBUQuMKIOBcPbIpJ4a0Aj0niastNkA",
  "Standards": "1pcGzBJzFORnigkj-ZfwgP49V_7-KnSGk",
  "Strategy": "1mY5qoi1bnByweBlR5hoWGIxCWtFEIPf6",
  "Supply Chain": "1baWMfjMpJQjhoJGKCfkh7eMbVsd9dlwH",
  "Symbolic": "1m_3huEuU0Z14lxUBCjZt5rnszZbh7Q36",
  "Systems": "1_mmQ2IW82T0owbvypovB-L1BjcC3LmDw",
  "Technology": "10CaVL48jxFFpJOrF-WQhrHmiz6CFeAZX",
  "Templates": "1pEW5VGcuroRCyZvsBmcE7dxb7L7SNDCp",
  "UX/UI Design": "1j3H6BLMYic1iALYer_o7NfGu0-L-JtWX",
  "Vision": "1h9cg8EpO5KqdBauKIQgq9LxaR_eWJwv-"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { folderName, fileType, action, content } = req.body;
  if (!folderName || !fileType || !action) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const targetFolderId = folderMap[folderName];
  if (!targetFolderId) {
    return res.status(404).json({ error: `Folder ${folderName} not mapped` });
  }

  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const token = JSON.parse(process.env.GOOGLE_TOKEN);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    const targetFileName = `${folderName}_${fileType}.txt`;

    const fileList = await drive.files.list({
      q: `'${targetFolderId}' in parents and name='${targetFileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    let targetFile = fileList.data.files[0];

    if (action === 'read') {
      if (!targetFile) return res.status(404).json({ error: `File ${targetFileName} not found` });
      const fileContent = await drive.files.get(
        { fileId: targetFile.id, alt: 'media' },
        { responseType: 'text' }
      );
      return res.status(200).json({ content: fileContent.data });
    } else if (action === 'write') {
      if (!targetFile) {
        const created = await drive.files.create({
          requestBody: {
            name: targetFileName,
            parents: [targetFolderId],
            mimeType: 'text/plain',
          },
          media: {
            mimeType: 'text/plain',
            body: content,
          },
        });
        return res.status(200).json({ message: `File created`, id: created.data.id });
      } else {
        await drive.files.update({
          fileId: targetFile.id,
          media: {
            mimeType: 'text/plain',
            body: content,
          },
        });
        return res.status(200).json({ message: `File updated`, id: targetFile.id });
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('Error in dynamic-file handler:', err);
    return res.status(500).json({ error: err.message });
  }
}
