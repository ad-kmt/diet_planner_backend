const { OAuth2Client } = require('google-auth-library');
const config = require("config");

const client = new OAuth2Client(
  config.get("google.clientId"),
  config.get("google.clientSecret"),
  /**
   * To get access_token and refresh_token in server side,
   * the data for redirect_uri should be postmessage.
   * postmessage is magic value for redirect_uri to get credentials without actual redirect uri.
   */
  'postmessage'
);

exports.getProfileInfo = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.get("google.clientId"),
  });

  const payload = ticket.getPayload();

  return payload;
};