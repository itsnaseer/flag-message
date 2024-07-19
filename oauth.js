const express = require('express');
const axios = require('axios');

const router = express.Router();
let tokenData = {}; // In-memory storage for tokens

router.get('/install', (req, res) => {
  const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=app_mentions:read,channels:history,channels:read,chat:write,commands,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,reactions:read&user_scope=&redirect_uri=${process.env.REDIRECT_URI}`;
  res.redirect(slackUrl);
});

router.get('/oauth_redirect', async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECT_URI
      }
    });

    if (!response.data.ok) {
      console.error('Error during OAuth flow:', response.data.error);
      return res.status(500).send('OAuth failed');
    }

    const { access_token, team } = response.data;
    const botUserId = response.data.bot_user_id;

    tokenData = { teamId: team.id, accessToken: access_token, botUserId };
    console.log('Token Data:', tokenData);

    res.send('App installed successfully!');
  } catch (error) {
    console.error('Error during OAuth flow:', error.response ? error.response.data : error.message);
    res.status(500).send('OAuth failed');
  }
});

const getToken = () => {
  console.log('Retrieved Token:', tokenData.accessToken);
  return tokenData.accessToken;
};

module.exports = { router, getToken };