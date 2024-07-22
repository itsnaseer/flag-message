const { App, SocketModeReceiver } = require('@slack/bolt');

// Initialize your Socket Mode receiver
const socketModeReceiver = new SocketModeReceiver({
  appToken: process.env.SLACK_APP_TOKEN,
});

// Initialize your Bolt app with the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: socketModeReceiver,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const messageFlagHandler = async ({ channel, ts, user, client }) => {
  try {
    // Ensure the bot is a member of the channel
    await client.conversations.join({ channel });

    // Get the message details
    const result = await client.conversations.history({
      channel: channel,
      latest: ts,
      inclusive: true,
      limit: 1
    });

    if (result.messages.length === 0) {
      throw new Error('No message found');
    }

    const message = result.messages[0];
    const messageLink = `https://${process.env.SLACK_WORKSPACE}.slack.com/archives/${channel}/p${ts.replace('.', '')}`;

    // Send a DM to the user who flagged the message
    await client.chat.postMessage({
      channel: user,
      text: 'We noticed you flagged a message. Please use the Continue button below to provide additional details or use the Dismiss button if this was an error.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'We noticed you flagged a message. Please use the Continue button below to provide additional details or use the Dismiss button if this was an error.'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Continue'
              },
              action_id: 'continue_button',
              value: JSON.stringify({ channel, ts, messageLink, messageText: message.text })
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Dismiss'
              },
              action_id: 'dismiss_button'
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error handling message flag:', error);
  }
};

app.event('reaction_added', async ({ event, client }) => {
  console.log('Reaction added event received:', event);
  if (event.reaction === 'flag-message') {
    console.log('Flag-message reaction detected');
    await messageFlagHandler({ channel: event.item.channel, ts: event.item.ts, user: event.user, client });
  }
});

app.shortcut('flag_message', async ({ shortcut, ack, client }) => {
  console.log('Message shortcut received:', shortcut);
  await ack();
  await messageFlagHandler({ channel: shortcut.channel.id, ts: shortcut.message.ts, user: shortcut.user.id, client });
});

app.action('continue_button', async ({ ack, body, client }) => {
  await ack();
  const { channel, ts, messageLink, messageText } = JSON.parse(body.actions[0].value);

  // Open a modal to collect additional details
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'submit_modal',
      private_metadata: JSON.stringify({ channel, ts, messageLink, messageText, user: body.user.id }),
      title: {
        type: 'plain_text',
        text: 'Additional Details'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'additional_details',
          label: {
            type: 'plain_text',
            text: 'Please provide additional details'
          },
          element: {
            type: 'plain_text_input',
            multiline: true,
            action_id: 'details_input'
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Submit'
      }
    }
  });
});

app.action('dismiss_button', async ({ ack, body, client }) => {
  await ack();
  // Send a thank you message for dismissing
  await client.chat.postMessage({
    channel: body.user.id,
    text: 'Thank you for checking.'
  });
});

app.view('submit_modal', async ({ ack, view, client }) => {
  await ack();
  const { channel, ts, messageLink, messageText, user } = JSON.parse(view.private_metadata);
  const additionalDetails = view.state.values.additional_details.details_input.value;

  // Send the message with additional details to the specified channel
  await client.chat.postMessage({
    channel: process.env.FLAGGED_MESSAGE_CHANNEL_ID,
    text: `A message was flagged:\n>${messageText}\n<${messageLink}|View message>\n\n*Additional Details:*\n${additionalDetails}`
  });

  // Thank the user for flagging the message
  await client.chat.postMessage({
    channel: user,
    text: 'Thank you for flagging the message. Administrators will review it.'
  });
});

// Start your app
(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running in Socket Mode!');
})();