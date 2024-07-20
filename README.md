
#High-level Process
1. Flag messsages for administrator review using the :flag-message: reaction or a message shortcut. 

2. The user receives a direct message from the Flag Message app asking to provide additional details (Continue) or dismiss the message flag.
3. After providing details the message text, message link, and user-provided details are sent to an admin review channel. 


#Set Up


##Environment Variables
If deploying on heroku, set the Config Vars to set environment variables. Otherwise, you can use a .env file. Make sure to 

SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=your-app-level-token
SLACK_BOT_TOKEN=your-bot-user-oauth-token
SLACK_WORKSPACE=your-workspace-name
FLAGGED_MESSAGE_CHANNEL_ID=admin-review-channel-id

##Slack
1. Set up a private channel (Flagged Message Channel) for administrators to receive the review notifications. 
2. Copy the channel ID for the environment variables (either .env or Config Vars). 
3. Add the Message Flag app to the Flagged Message channel. 

##Technical Details
This app uses socket mode and Bolt for Javascript. Because this app is meant for 