const jwt = require("jsonwebtoken");
function generateNewToken(id) {
  const secret_key = process.env.SECRET_KEY;
  return jwt.sign({ id }, secret_key, { expiresIn: "2h" });
}

function getTokenExpireTime(token) {
  const decodedToken = jwt.decode(token);

  if (decodedToken) {
    // Extract expiration time (in seconds) from the token payload
    const expirationTimeInSeconds = decodedToken.exp;

    // Convert expiration time from Unix timestamp (seconds) to milliseconds
    const expirationTimeInMilliseconds = expirationTimeInSeconds * 1000;

    // Create a Date object with the expiration time
    const expirationDate = new Date(expirationTimeInMilliseconds);

    // Format the expiration date as a string
    const formattedExpiration = expirationDate.toLocaleString(); // Or use any other desired date formatting method

    return formattedExpiration;
  } else {
    console.error("Failed to decode token");
  }
}

module.exports = {
  getTokenExpireTime,
  generateNewToken,
};

