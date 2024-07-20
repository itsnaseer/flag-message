# Slack Message Flagging App

This app allows users to flag messages in Slack by adding a specific reaction or using a message shortcut. Flagged messages trigger a workflow that collects additional details and notifies administrators.
This app needs to be added to all channels for flagging. It will add itself to public channels as needed. Private channels need to have the app added explicitly. 

## High-level Process
1. Flag messsages for administrator review using the :flag-message: reaction or a message shortcut. 

2. The user receives a direct message from the Flag Message app asking to provide additional details (Continue) or dismiss the message flag.
3. After providing details the message text, message link, and user-provided details are sent to an admin review channel.

## Table of Contents

1. [Slack App Setup](#slack-app-setup)
2. [Heroku Deployment](#heroku-deployment)
3. [Slack Client Setup](#slack-client-setup)
4. [Environment Variables](#environment-variables)

## Slack App Setup

### Step 1: Create a Slack App

1. Go to [Slack API: Applications](https://api.slack.com/apps).
2. Click `Create New App`.
3. Choose `From scratch`.
4. Enter the App Name and select the Development Slack Workspace.
5. Click `Create App`.

### Step 2: Add Bot Permissions

1. In your app settings, go to `OAuth & Permissions`.
2. Scroll down to `Scopes` and add the following Bot Token Scopes:
    - `app_mentions:read`
    - `channels:history`
    - `channels:join`
    - `channels:read`
    - `chat:write`
    - `commands`
    - `groups:history`
    - `groups:read`
    - `im:history`
    - `im:read`
    - `mpim:history`
    - `mpim:read`
    - `reactions:read`
    - `users:read`
3. Click `Save Changes`.

### Step 3: Enable Socket Mode

1. In your app settings, go to `Socket Mode`.
2. Enable Socket Mode.
3. Create an App-Level Token with the scope `connections:write`.
4. Copy the token and keep it for later use.

### Step 4: Set Event Subscriptions

1. In your app settings, go to `Event Subscriptions`.
2. Enable `Enable Events`.
3. Add the Request URL: `https://<your-heroku-app-name>.herokuapp.com/slack/events` (Replace `<your-heroku-app-name>` with your Heroku app name).
4. Under `Subscribe to bot events`, add:
    - `reaction_added`
5. Click `Save Changes`.

### Step 5: Install the App

1. In your app settings, go to `Install App`.
2. Click `Install App to Workspace`.
3. Copy the `Bot User OAuth Token` and keep it for later use.

## Heroku Deployment

### Step 1: Create a Heroku App

1. Go to [Heroku](https://www.heroku.com/) and create a new account if you don't have one.
2. Create a new Heroku app.

### Step 2: Prepare Your Code

1. Ensure your code repository has the following files:
    - `app.js` (main application code)
    - `package.json` (list of dependencies)
    - `Procfile` (to specify the worker process)
    - `.gitignore` (to ignore node_modules and other unnecessary files)

### Step 3: Set Environment Variables

Set the following environment variables in your Heroku app:

    - SLACK_CLIENT_ID=your-client-id
    - SLACK_CLIENT_SECRET=your-client-secret
    - SLACK_SIGNING_SECRET=your-signing-secret
    - SLACK_APP_TOKEN=your-app-level-token
    - SLACK_BOT_TOKEN=your-bot-user-oauth-token
    - SLACK_WORKSPACE=your-workspace-name
    - FLAGGED_MESSAGE_CHANNEL_ID=your-channel-id


# Slack Client Setup

### Step 1: Add the App to Your Workspace

	1.	Go to the Slack workspace where you installed the app.
	2.	Invite the bot to the channels where it will be used: `/invite @your-bot-name`

### Step 2: Configure the Reaction and Shortcut

	1.	To flag a message, add the reaction `:flag-message:` to the message.
	2.	Alternatively, use the message shortcut to flag the message:
        •	Click on the three dots next to a message.
        •	Select More message shortcuts.
        •	Choose your app’s shortcut to flag the message.

# Environment Variables

	•	SLACK_CLIENT_ID: Your Slack app’s Client ID.
	•	SLACK_CLIENT_SECRET: Your Slack app’s Client Secret.
	•	SLACK_SIGNING_SECRET: Your Slack app’s Signing Secret.
	•	SLACK_APP_TOKEN: Your Slack app-level token for Socket Mode.
	•	SLACK_BOT_TOKEN: Your Slack bot user OAuth token.
	•	SLACK_WORKSPACE: Your Slack workspace name.
	•	FLAGGED_MESSAGE_CHANNEL_ID: The Slack channel ID where flagged messages and additional details are sent.