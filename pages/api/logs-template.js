// api/logs-template.js
import { google } from 'googleapis';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';

// ✅ Centralized folder map (latest version provided)
const folderMap = {
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

// Simple in-memory cache with 10-minute TTL
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Optional: rate limiter middleware for serverless protection
export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please try again later.' }
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { context } = req.query;
    if (!context) {
      return res.status(400).json({ error: 'Missing context parameter.' });
    }

    const sanitizedContext = sanitize(context);
    if (!folderMap[sanitizedContext]) {
      return res.status(404).json({ error: `Context folder '${sanitizedContext}' not found.` });
    }

    // Check cache first
    const cached = cache.get(sanitizedContext);
    if (cached) {
      return res.status(200).json({ ...cached, cacheHit: true });
    }

    const folderId = folderMap[sanitizedContext];
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    const fileName = `${sanitizedContext}_Template.txt`;
    const sharedDriveId = process.env.SHARED_DRIVE_ID;

    const fileRes = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name, modifiedTime, owners(displayName))',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      ...(sharedDriveId ? { driveId: sharedDriveId, corpora: 'drive' } : {})
    });

    if (!fileRes.data.files || fileRes.data.files.length === 0) {
      return res.status(404).json({ error: `Template file '${fileName}' not found.` });
    }

    const file = fileRes.data.files[0];
    const contentRes = await drive.files.get(
      { fileId: file.id, alt: 'media', supportsAllDrives: true },
      { responseType: 'text' }
    );

    const responsePayload = {
      template: contentRes.data,
      context: sanitizedContext,
      fileName: file.name,
      lastModified: file.modifiedTime,
      owner: file.owners?.[0]?.displayName || 'Unknown',
      source: 'Google Drive Shared Drive',
      retrievedAt: new Date().toISOString()
    };

    // Cache the response
    cache.set(sanitizedContext, responsePayload);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('[logs-template] Error:', err);
    return res.status(500).json({
      error: 'Internal server error.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

