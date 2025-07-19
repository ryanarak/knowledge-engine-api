// api/memory.js
import { google } from 'googleapis';

// 🛠️ Central folder map (Shared Drive IDs)
const folderMap = {
  "Knowledge Engine": "1W25IaUwycLXvldVmXuqsKkR9QFuWyO6_", // root Knowledge Engine folder
  "Compliance": "1VweenVvzp7019ILgZYVINiUQF-wxLuEQ",
  "Accounting": "19DJwCmOBInXTHD_p-Yw7v6Ou8_Sk0CVj",
  "Achievements": "1O4FSrhNaqxPC9_EtYbOI3Iw1M8DDfXiR",
  "Ads - Advertisements": "1WRDqHTym-JbQ_YX7ctU4G-kzbBOuilIh",
  "Art & Media": "1om5YL0HOx6w45GvMMSXo-tHtX7NUJIqx",
  "Automation": "1HOSOgglh1lBnB2Q6z-cUSz8htOODhW4w",
  "Branding - Brand Identity": "1pkW3y7tC6B0EE5C76cQDUS4n03TSMEqn",
  "Business Development": "1mG3iG8TX8jbThixL3WVHeUdlwaFrvL3n",
  "Checklists": "1fQAh04hbuiHICFkIY4Tyq2cPZvFHyjnm",
  "Clients": "1BO2V7O1E89x8RsufJva5atBRsZUaK-VV",
  "Community": "1JWxhyb56bBXyrWHH0zegmirDcL6ryeMv",
  "Customer Insights - Feedback": "1lHJfGK2v1940tzgckGaAaY7PUIJZxOhm",
  "Customer Support": "1FSETp5V8Nebb9SZEGoFxan9hnhYvDmiT",
  "Data & Analytics": "18lINm8lDaG736c0s3bc02iaIz0jizj0_",
  "Data Science & AI": "1TxXNNQZZfo8i8HdmDloYP_yoWPIs6xsT",
  "Decisions": "1gVTCSW_cmbFGVlD5sl0QO5ddt6IuLO4d",
  "Design": "1hQemJG8eMAYqW-vYUa61KL9627ATwMBU",
  "DevOps": "1o6_kbvxJ7UTNsgH5i5NbDc8MVCIJMEbH",
  "Documentation - Archives": "1dCwS0nBKQjum7j6aN0ZMEUawI5fH-meS",
  "Economics": "1ss_IJQWoRwcK4XyMJC64W2X0nD3-SUgr",
  "Education": "15x-NimdOP6V0_zJMTWN-hT89K9CxUS7u",
  "Engineering": "1GP_cBqxHd1C8-Y4WYeTWfByXXZxl0frk",
  "Environment & Sustainability": "188JtWPMZtZ2TfDZXVI_q4sTdSioJ8MGu",
  "Ethics": "1x7-mYqN7hTT2SlPDPxOZ-Vq_kJsF4MuN",
  "Events": "1CdZnI32d12CGWmOiVs91_ejslLKBVm1v",
  "Experiments": "1ry2i8hWUsSLKckbgkIVHMf1Tu1otpvhM",
  "Feedback": "1WmCR_7cX5n1ejJun3wiKRPormOlImdTz",
  "Finance": "1W3-52fCJdnOqGetsjoaIxle95pHXFpsR",
  "Goals": "1NX5U0RTaRp5ZMv-YBcLKMJgNr2XvsyM3",
  "Health": "101cDCpVqXPtx2anEhwEFtbWrHlkYb9mB",
  "Human Resources": "1-RScUAF8WIlKdsfZwUB6iOlZZeRjE_rK",
  "Humanities": "1GIdHl4rSJnEdXNb1hLDAqgryZKXK44ge",
  "Innovations": "1bXLelb-dB9bYTFj1gpy7nye8ojwpUTv-",
  "Insights": "1nhQXgbGunva8nfrTWyr2baLuMYDPJ5_s",
  "Integrations": "1uvp6vV2v9y0Z3x9iJ76JzfQLxXQHpyXV",
  "Knowledge Management": "19sltDLxtVLnKlqkiAzjNOiYgpEysUwC9",
  "Knowledge Shares": "1j6y5ltAax2kiUF5N4E7eg2jOznqqZ5ge",
  "Learning Resources": "1fH7ay5sM7H6n4vflMOpa9QJj_AoTzUvn",
  "Legacy": "1LlZcnpSlCDA8InMf_duolWUcxZnWKOUc",
  "Legal": "1URmvWCfMZxEkJ9tZsgOCzdAxju9-fNEW",
  "Linguistics": "1R6KcXmcX8WpC-M3LRP-n27uaS-hl7rsH",
  "Logs": "1Q5S1xljsFc-7SN4HqY8t00laVgC5VAPP",
  "Marketing": "1IswTLLkJAoXT5PCU88G7AUltK4Fyw5fx",
  "Math": "1y8wD9DRpPD6VkKwMhuzsdhHZl419rV-o",
  "Mentorship": "1qrEEEjlpWH-1crVmBYhGJ3W5fzGmHWrP",
  "Narratives": "10r_Io1Zd9thrAUFtis37wSoYe8d6-HpH",
  "Onboarding": "1tD0NVcXlJLSnyvqPVPBdw97aXeg3nMF0",
  "Operations": "18mzVIA79HJpcduv5ABQkBcEq5OoxWhGX",
  "Partnerships": "1wGRn-lCjKkor0WAuQE-iCWbS6InVXWo1",
  "Philosophy": "1568ldnsPj-rKoqkCvJ7l-L8UEl4tzx1J",
  "Playbooks": "18PPQzvRVjr2rq-NJUD3jhVoscTQobUhz",
  "Policy & Governance": "1HQQc8gXmZn999cULK404MedCJDB1Aw3z",
  "Product Development": "13KCMNnQJtdqq7-Ibis8-7oP5meHzNGyW",
  "Programming": "17y_qL2uCqxgHhBFUDz6HUvlcr0fjkTUS",
  "Projects": "1tbduYd_6S-Go7KuS1rNP_oOoxnxDzFUF",
  "Psychology": "1h_IYzjRNFi4ZEpt-omTXo-A1_Ll6Kia8",
  "Reflection": "1MH-IfuZPKgtSRK2knt-_yXghSV1TXCxO",
  "Relationships": "1RmHuaDJ6cbzHQAt3noq_yw_Yk4l2b3r0",
  "Research": "1Bvy_0NgQFXgMgcPK0DQKa8EKrv7Ec7uA",
  "Sales": "1rhTo7QWaTr2fB3lFnABRvtk5Te-MjlW-",
  "Sandbox": "1af9XCdweSCMgv0bqXcqxcdEibW0lJFWF",
  "Science": "1-UNQGO4XDH90Og1JZ-G3zLD7XnA4I0w_",
  "Security": "1wy9M2eMUDGFrRTst0zmxB8pdGSv7Uc_C",
  "Sociology": "14O9vn8kjzC_9Ur6M5oZYeCkySLcSblf1",
  "Spiritual": "1Z5Hd6Q_okwPYc48nYYT4yvB9cQh7jk1l",
  "Standards": "15jIj_i9meT2LIkZj06xLVJVxlcDCvens",
  "Strategy": "1L7zBmUFQWNDBYSYycNy6ptq0Yx5g_BaD",
  "Supply Chain": "1cqJ1MQGqO1ZAIQG6p9f3XbVxPQwo-avH",
  "Symbolic": "1TmiRoGKCk7o4OPHTCbZtlEdqM8iOGDWD",
  "Systems": "10tWMXrtk08iZQGy9qoj-AT2mmMhs-5xp",
  "Technology": "19SmsI5KxUzQkK32hqCTeqba2OSxQDGKo",
  "Templates": "1st5tt3f_stoc1I0V3Gtb_kJJuyBpDhYd",
  "UX-UI Design": "1o5diZptRJR3pU-txJzgOHPJAv87KjiqO",
  "Vision": "1y4Xms3qMOb4K9X2a5MkHiSOmFW7Eb3b1"
};

// 🛠️ Sanitize filenames for Drive
function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]+/g, '_').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logContent, fileName, folderKey, metadata, append = false } = req.body;
    if (!logContent || !fileName) {
      return res.status(400).json({ error: 'Missing logContent or fileName' });
    }

    const safeName = sanitizeFileName(fileName);
    const targetFolderId = folderKey ? folderMap[folderKey] : folderMap['Knowledge Engine'];
    if (!targetFolderId) {
      return res.status(404).json({ error: `Folder key '${folderKey}' not found in folderMap.` });
    }

    // 🛠️ Authenticate with Drive using environment variable
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS not set in environment');
    }
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    // 🔍 Look for existing file in Shared Drive
    const fileList = await drive.files.list({
      q: `'${targetFolderId}' in parents and name='${safeName}' and trashed=false`,
      fields: 'files(id,name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (append && fileList.data.files.length > 0) {
      // ✍️ Append to existing file
      const existingFileId = fileList.data.files[0].id;
      const existingContentRes = await drive.files.get(
        { fileId: existingFileId, alt: 'media', supportsAllDrives: true },
        { responseType: 'text' }
      );
      const updatedContent = `${existingContentRes.data}\n${logContent}`;
      await drive.files.update({
        fileId: existingFileId,
        media: { mimeType: 'text/plain', body: updatedContent },
        supportsAllDrives: true
      });
      return res.status(200).json({
        message: `File '${safeName}' updated (appended).`,
        fileId: existingFileId,
        folderUsed: folderKey || 'Knowledge Engine'
      });
    } else {
      // 🌊 Create a new file in Shared Drive
      const createRes = await drive.files.create({
        requestBody: {
          name: safeName,
          parents: [targetFolderId],
          mimeType: 'text/plain'
        },
        media: { mimeType: 'text/plain', body: logContent },
        fields: 'id,name',
        supportsAllDrives: true
      });

      // Optional metadata file
      if (metadata && typeof metadata === 'object') {
        const metaName = `${safeName}.meta.json`;
        await drive.files.create({
          requestBody: {
            name: metaName,
            parents: [targetFolderId],
            mimeType: 'application/json'
          },
          media: { mimeType: 'application/json', body: JSON.stringify(metadata, null, 2) },
          fields: 'id,name',
          supportsAllDrives: true
        });
      }

      return res.status(200).json({
        message: `Memory file '${safeName}' created successfully.`,
        fileId: createRes.data.id,
        folderUsed: folderKey || 'Knowledge Engine'
      });
    }
  } catch (err) {
    console.error('❌ Error in memory.js:', err);
    return res.status(500).json({ error: err.message });
  }
}
 