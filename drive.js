// drive.js
const { google } = require('googleapis');

// Load service account credentials from environment
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

function getDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  return google.drive({ version: 'v3', auth });
}

module.exports = { getDrive };

