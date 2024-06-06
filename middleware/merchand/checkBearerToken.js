const jwt = require("jsonwebtoken");
const Merchand = require("../../models/Merchand");
const Shopuser = require("../../models/Shopuser")
async function getIdFromBearerToken(req, res, next) {
  const authorization = req.headers["authorization"];
  const secretKey = process.env.SECRET_KEY;
  if (!authorization) {
    res
      .status(401)
      .json({ error: "authorization token is required to processed!" });
  }
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.substring("Bearer ".length);
    if (token)
      jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Token verification is faild!", details: err });
        } else {
          const decoded = jwt.decode(token);
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTimeInSeconds) {
            return res.status(400).json({ error: "Token is expired" });
          } else {
            const existingUser = await Merchand.findOne({ _id: user.id });
            if (!existingUser)
              return res
                .status(403)
                .json({ error: "token is expired or verification failed!" });
            else {
              req.id = user.id;
              next();
            }
          }
        }
      });
  } else {
    // Token doesn't exist
    return res.status(401).send("Unauthorized: No token provided.");
  }
}

async function getIdFromBearerTokenForShopUser(req, res, next) {
  const authorization = req.headers["authorization"];
  const secretKey = process.env.SECRET_KEY;
  if (!authorization) {
    res
      .status(401)
      .json({ error: "authorization token is required to processed!" });
  }

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.substring("Bearer ".length);
    if (token)
      jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Token verification is faild!", details: err });
        } else {
          const decoded = jwt.decode(token);
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTimeInSeconds) {
            return res.status(400).json({ error: "Token is expired" });
          } else {
            const existingUser = await Shopuser.findOne({ _id: user.id });
            if (!existingUser)
              return res
                .status(403)
                .json({ error: "token is expired or verification failed!" });
            else {
              req.id = user.id;
              next();
            }
          }
        }
      });
  } else {
    // Token doesn't exist
    return res.status(401).send("Unauthorized: No token provided.");
  }
}

module.exports = {
  getIdFromBearerToken,
  getIdFromBearerTokenForShopUser
};
