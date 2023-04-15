// Third-party dependencies
const path = require('path');
const express = require('express');
const session = require('express-session');
const jsforce = require('jsforce');

// Load and check configuration
require('dotenv').config();
const { loginUrl, consumerKey, consumerSecret, callbackUrl, apiVersion, sessionSecretKey, isHttps } = process.env;
if (!(loginUrl && consumerKey && consumerSecret && callbackUrl && apiVersion && sessionSecretKey)) {
  console.error('Cannot start app: missing mandatory configuration. Check your .env file.');
  process.exit(-1);
}

// Instantiate Salesforce client with .env configuration
const oauth2 = new jsforce.OAuth2({
  loginUrl,
  clientId: consumerKey,
  clientSecret: consumerSecret,
  redirectUri: callbackUrl
});

// Set up HTTP server
const app = express();
const port = process.env.PORT || 8080;
app.set('port', port);

// Enable server-side sessions
app.use(
  session({
    secret: sessionSecretKey,
    cookie: { secure: isHttps === 'true' },
    resave: false,
    saveUninitialized: false
  })
);

// Serve HTML pages under root directory
app.use('/', express.static(path.join(__dirname, '../public')));

/**
 * Attempts to retrieve the server session.
 * If there is no session, redirect with HTTP 401 and an error message.
 */
function getSession(req, res) {
  const session = req.session;
  if (!session.sfdcAuth) {
    res.status(401).send('No active session');
    return null;
  }
  return session;
}

function resumeSalesforceConnection(session) {
  return new jsforce.Connection({
    oauth2,
    instanceUrl: session.sfdcAuth.instanceUrl,
    accessToken: session.sfdcAuth.accessToken,
    version: apiVersion
  });
}

/**
 * Login endpoint
 */
app.get('/auth/login', (req, res) => {
  // Redirect to Salesforce login/authorization page
  res.redirect(oauth2.getAuthorizationUrl({ scope: 'api' }));
});

/**
 * Login callback endpoint (only called by Salesforce)
 */
app.get('/auth/callback', (req, res) => {
  if (!req.query.code) {
    res.status(500).send('Failed to get authorization code from server callback.');
    return;
  }

  // Authenticate with OAuth
  const conn = new jsforce.Connection({
    oauth2,
    version: apiVersion
  });
  conn.authorize(req.query.code, (err, userInfo) => {
    if (err) {
      console.log(`Salesforce authorization error: ${JSON.stringify(err)}`);
      res.status(500).json(err);
      return;
    }

    // Store oauth session data in server (never expose it directly to client)
    req.session.sfdcAuth = {
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken
    };

    // Redirect to app main page
    return res.redirect('/index.html');
  });
});

/**
 * Logout endpoint
 */
app.get('/auth/logout', (req, res) => {
  const session = getSession(req, res);
  if (!session) return;

  // Revoke OAuth token
  const conn = resumeSalesforceConnection(session);
  conn.logout((err) => {
    if (err) {
      console.error(`Salesforce OAuth revoke error: ${JSON.stringify(err)}`);
      res.status(500).json(err);
      return;
    }

    // Destroy server-side session
    session.destroy((err) => {
      if (err) {
        console.error(`Salesforce session destruction error: ${JSON.stringify(err
