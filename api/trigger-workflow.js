export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, payload } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing workflow name' });
  }

  try {
    // Example workflow: send a Slack message
    if (name === 'send_slack_message') {
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
    }

    // Add more workflows here:
    // else if (name === 'create_task') { ... }

    return res.status(200).json({
      status: 'success',
      triggered: name,
      receivedPayload: payload
    });

  } catch (error) {
    console.error('Workflow error:', error);
    return res.status(500).json({ error: 'Workflow execution failed', details: error.message });
  }
}
