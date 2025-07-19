// api/trigger-workflow.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, payload = {}, metadata = {}, context = 'Global', summary = '' } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid workflow name' });
  }

  console.log(`⚡ [Trigger Workflow] Name: ${name}`, { payload, metadata, context });

  try {
    // ✅ Define workflows in a registry
    const workflows = {
      async send_slack_message(data) {
        const slackToken = process.env.SLACK_TOKEN;
        if (!slackToken) throw new Error('Missing SLACK_TOKEN environment variable');

        const channel = data.channel || '#general';
        const text = data.text || 'No text provided';

        const resp = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${slackToken}`
          },
          body: JSON.stringify({ channel, text })
        });

        const slackRes = await resp.json();
        if (!slackRes.ok) throw new Error(`Slack API error: ${JSON.stringify(slackRes)}`);

        return { channel, text, slackResponse: slackRes };
      },

      async create_task(data) {
        // 🛠️ Hook into your task system
        const { title, dueDate } = data;
        console.log(`📝 Creating task: ${title} due ${dueDate}`);
        return { created: true, title, dueDate };
      },

      async generic_logger(data) {
        console.log('📥 Generic Logger Workflow Triggered:', data);
        return { logged: true, received: data };
      }
    };

    // ✅ Execute workflow
    const workflow = workflows[name];
    if (!workflow) {
      return res.status(404).json({ error: `Workflow '${name}' not found` });
    }

    const result = await workflow(payload);

    // 🗒️ Build a default summary if none provided
    const logSummary = summary || `Workflow '${name}' executed successfully.`;
    const logPath = `/api/trigger-workflow/${name}`; // symbolic path for ledger

    // ✅ Call ledger-update to record the workflow trigger
    try {
      const ledgerResponse = await fetch(`${process.env.VERCEL_URL || ''}/api/ledger-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          summary: logSummary,
          logPath,
          metadata,
          workflowName: name
        })
      });

      if (!ledgerResponse.ok) {
        const ledgerError = await ledgerResponse.text();
        console.error('⚠️ Ledger update failed:', ledgerError);
      } else {
        console.log('✅ Ledger updated successfully');
      }
    } catch (ledgerErr) {
      console.error('❌ Error calling ledger-update:', ledgerErr);
    }

    // ✨ Return success
    return res.status(200).json({
      status: 'success',
      triggered: name,
      metadata,
      context,
      result
    });

  } catch (error) {
    console.error('❌ Workflow execution error:', error);
    return res.status(500).json({
      error: 'Workflow execution failed',
      details: error.message
    });
  }
}

