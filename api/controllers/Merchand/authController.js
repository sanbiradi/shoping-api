const bcrypt = require("bcrypt");
const Merchand = require("../../models/Merchand");
const EmailInbox = require("../../models/EmailInbox");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateNewToken, getTokenExpireTime } = require("../generateNewToken");
const { validatePassword } = require("../ValidatePassword");

async function registerController(req, res) {
  const captchac = req.query.captcha === "true";
  const { captcha } = req.body;
  if (captchac === false) {
    if (!captcha) {
      const lenghthOfObject = Object.keys(req.body).length;
      if (lenghthOfObject > 4) {
        return res
          .status(400)
          .json({ error: "more than 4 fields does not required." });
      } else if (lenghthOfObject < 4) {
        return res
          .status(400)
          .json({ error: "less than 4 fields does not required." });
      }

      const { email, password, name, companyName } = req.body;
      if (req.body) {
        if (!email) {
          return res.status(400).json({ error: "'email' field is required" });
        } else if (!password) {
          return res
            .status(400)
            .json({ error: "'password' field is required" });
        } else if (!name) {
          return res.status(400).json({ error: "'name' field is required" });
        } else if (!companyName) {
          return res.status(400).json({ error: "'company' field is required" });
        }
        //account exist or not
        const existingUser = await Merchand.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
        } else {
          const passwordHash = await bcrypt.hash(req.body.password, 10);

          const merchandData = new Merchand({
            name: req.body.name,
            email: req.body.email,
            password: passwordHash,
            companyName: req.body.companyName,
            picture: "https://i.imgur.com/CR1iy7U.png",
            role: "admin",
            deleted: false,
            isEmailVerified: false,
            AdminUsers: [],
            Products: [],
          });

          merchandData.save().then((user) => {
            const userDetails = {
              _id: user._id,
              name: user.name,
              email: user.email,
              companyName: user.companyName,
              picture: "https://i.imgur.com/CR1iy7U.png",
              deleted: false,
              role: user.role,
              isEmailVerified: user.isEmailVerified,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            };

            const token = generateNewToken(user._id);
            const expireTime = getTokenExpireTime(token);

            return res.status(200).json({
              message: "User registered successfully",
              userDetails,
              token,
              expireTime,
            });
          });
        }
      }
    } else {
      return res
        .status(400)
        .json({ error: "'captcha' property is not required!" });
    }
    //check body parameters
  }

  if (captchac === true) {
    //check body parameters
    const lenghthOfObject = Object.keys(req.body).length;
    if (lenghthOfObject > 5) {
      return res
        .status(400)
        .json({ error: "more than 5 fields does not required." });
    } else if (lenghthOfObject < 5) {
      return res
        .status(400)
        .json({ error: "less than 5 fields does not required." });
    }

    const { email, password, name, companyName, captcha } = req.body;
    if (req.body) {
      if (!email) {
        return res.status(400).json({ error: "'email' field is required" });
      } else if (!password) {
        return res.status(400).json({ error: "'password' field is required" });
      } else if (!name) {
        return res.status(400).json({ error: "'name' field is required" });
      } else if (!companyName) {
        return res.status(400).json({ error: "'company' field is required" });
      } else if (!captcha) {
        return res.status(400).json({ error: "'captcha' field is required" });
      }

      const recaptchaSecretKey = process.env.captcha_secret_key;

      await axios
        .post("https://www.google.com/recaptcha/api/siteverify", null, {
          params: {
            secret: recaptchaSecretKey,
            response: captcha,
          },
        })
        .then(async (response) => {
          if (response.data.success === true) {
            //account exist or not
            const existingUser = await Merchand.findOne({ email });
            if (existingUser) {
              return res.status(400).json({ error: "Email already exists" });
            } else {
              const passwordHash = await bcrypt.hash(req.body.password, 10);

              const merchandData = new Merchand({
                name: req.body.name,
                email: req.body.email,
                password: passwordHash,
                companyName: req.body.companyName,
                picture: "https://i.imgur.com/CR1iy7U.png",
                role: "admin",
                deleted: false,
                isEmailVerified: false,
              });

              merchandData.save().then((user) => {
                const userDetails = {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  companyName: user.companyName,
                  picture: "https://i.imgur.com/CR1iy7U.png",
                  deleted: false,
                  role: user.role,
                  isEmailVerified: user.isEmailVerified,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                };

                const token = generateNewToken(user._id);
                const expireTime = getTokenExpireTime(token);

                return res.status(200).json({
                  message: "User registered successfully",
                  userDetails,
                  token,
                  expireTime,
                });
              });
            }
          } else {
            return res.status(400).json({
              error: "captcha token is expired or verification failed",
              details: response.data,
            });
          }
        });
    }
  }
}

async function loginController(req, res) {
  const captchac = req.query.captcha === "true";
  const { captcha } = req.body;
  if (!req.query.captcha) {
    return res
      .status(403)
      .json({ error: "captcha parameter must be in the url." });
  }

  if (captchac === false) {
    if (!captcha) {
      const lenghthOfObject = Object.keys(req.body).length;
      if (lenghthOfObject > 2) {
        return res
          .status(400)
          .json({ error: "more than 2 fields does not required." });
      } else if (lenghthOfObject < 2) {
        return res
          .status(400)
          .json({ error: "less than 2 fields does not required." });
      }

      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: "'email' is required" });
      } else if (!password) {
        return res.status(400).json({ error: "'password' is required" });
      }

      // Check if username or email already exists
      const existingUser = await Merchand.findOne({ email });
      if (existingUser) {
        // return res.send(existingUser);
        const matchedPassword = await bcrypt.compare(
          password,
          existingUser.password
        );

        if (matchedPassword === true) {
          const userDetails = {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            companyName: existingUser.companyName,
            picture: existingUser.picture,
            deleted: existingUser.deleted,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
          };

          const token = generateNewToken(existingUser._id);
          const expireTime = getTokenExpireTime(token);
          return res.status(200).json({
            message: "User Logined successfully",
            userDetails,
            token,
            expireTime,
          });
        } else {
          return res.status(404).json({
            error: "password does not matched, You entered the wrong password!",
          });
        }
      } else {
        return res.status(404).json({ error: "Account does not exist!" });
      }
    } else {
      return res.status(400).json({ error: "captcha field does not required" });
    }
  }

  if (captchac === true) {
    const lenghthOfObject = Object.keys(req.body).length;
    if (lenghthOfObject > 3) {
      return res
        .status(400)
        .json({ error: "more than 3 fields does not required." });
    } else if (lenghthOfObject < 3) {
      return res
        .status(400)
        .json({ error: "less than 3 fields does not required." });
    }

    if (req.body) {
      const { email, password, captcha } = req.body;
      if (!email) {
        return res.status(400).json({ error: "'email' field is required" });
      } else if (!password) {
        return res.status(400).json({ error: "'password' field is required" });
      } else if (!captcha) {
        return res.status(400).json({ error: "'captcha' field is required" });
      }

      const recaptchaSecretKey = process.env.captcha_secret_key;

      await axios
        .post("https://www.google.com/recaptcha/api/siteverify", null, {
          params: {
            secret: recaptchaSecretKey,
            response: captcha,
          },
        })
        .then(async (response) => {
          if (response.data.success === true) {
            // Check if username or email already exists
            const existingUser = await Merchand.findOne({ email });
            if (existingUser) {
              // return res.send(existingUser);
              const matchedPassword = await bcrypt.compare(
                password,
                existingUser.password
              );

              if (matchedPassword === true) {
                const userDetails = {
                  _id: existingUser._id,
                  name: existingUser.name,
                  email: existingUser.email,
                  companyName: existingUser.companyName,
                  picture: existingUser.picture,
                  deleted: existingUser.deleted,
                  createdAt: existingUser.createdAt,
                  updatedAt: existingUser.updatedAt,
                };

                const token = generateNewToken(existingUser._id);
                const expireTime = getTokenExpireTime(token);
                return res.status(200).json({
                  message: "User Logined successfully",
                  userDetails,
                  token,
                  expireTime,
                });
              } else {
                return res.status(404).json({
                  error:
                    "password does not matched, You entered the wrong password!",
                });
              }
            } else {
              return res.status(404).json({ error: "Account does not exist!" });
            }
          } else {
            return res.status(403).json({
              error: "captcha token is expired or verification failed.",
              details: response.data,
            });
          }
        });
    }
  }
}

async function SelfController(req, res) {
  //header
  const authorization = req.headers["authorization"];
  const secretKey = process.env.SECRET_KEY;
  if (authorization.startsWith("Bearer ")) {
    const token = authorization.substring("Bearer ".length);
    if (token)
      jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
          return res
            .status(400)
            .send({ error: "Token verification is faild!" });
        } else {
          const decoded = jwt.decode(token);
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTimeInSeconds) {
            return res.status(400).send({ error: "Token is expired" });
          } else {
            const existingUser = await Merchand.findOne({ _id: user.id });
            const userDetails = {
              _id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              companyName: existingUser.companyName,
              picture: existingUser.picture,
              deleted: existingUser.deleted,
              createdAt: existingUser.createdAt,
              updatedAt: existingUser.updatedAt,
            };
            return res.status(200).send({ userDetails });
          }
        }
      });
  } else {
    // Token doesn't exist
    return res.status(401).send("Unauthorized: No token provided.");
  }
}

async function forgetPassword(req, res) {
  if (!req.body) {
    return res.status(403).json({
      code: "403",
      error: "'email' and 'captcha' these fields are required ",
    });
  }

  const { email, captcha } = req.body;

  if (!email) {
    return res.status(403).json({
      code: "403",
      error: "'email' field is required ",
    });
  }

  if (!captcha) {
    return res.status(403).json({
      code: "403",
      error: "'captcha' field is required ",
    });
  }

  const user = await Merchand.findOne({ email });

  if (!user) {
    return res
      .status(403)
      .json({ error: "Email does not exist please provide", code: "403" });
  }

  const recaptchaSecretKey = process.env.captcha_secret_key;

  try {
    await axios
      .post("https://www.google.com/recaptcha/api/siteverify", null, {
        params: {
          secret: recaptchaSecretKey,
          response: captcha,
        },
      })
      .then(async (response) => {
        if (response.data.success === true) {
          const checkEmail = await EmailInbox.findOne({ email });
          const token = generateNewToken(user._id);
          const newEmail = {
            token: token,
            subject: "reset-password",
          };

          if (!checkEmail) {
            const forgetEmail = new EmailInbox({
              email,
              emailsList: [newEmail],
            });
            forgetEmail.save().then((user) => {
              return res.status(403).json({
                user,
                message: "reset email has been sent to corresponding email.",
              });
            });
          } else {
            checkEmail.emailsList.push(newEmail);
            checkEmail.save().then((user) => {
              return res.status(403).json({
                user,
                message: "reset email has been sent to corresponding email.",
              });
            });
          }
        } else {
          return res.status(403).json({
            message: "captcha verification failed or token is expired",
            code: "403",
            stackerror: e,
          });
        }
      });
  } catch (e) {
    return res.status(403).json({
      message: "Verification failed or token has been expired",
      code: "403",
      stackerror: e,
    });
  }
}

async function resetPassword(req, res) {
  const token = req.query.token;
  const { password } = req.body;
  const secretKey = process.env.SECRET_KEY;
  if (!token) {
    return res
      .status(403)
      .json({ code: "403", message: "Token parameter is required" });
  }
  if (!password) {
    return res
      .status(403)
      .json({ code: "403", message: "'password' parameter is required" });
  }

  try {
    jwt.verify(token, secretKey, async (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ code: "403", message: "token is invalid", error: err });
      }
      if (user.id) {
        const existId = await Merchand.findOne({ _id: user.id });
        if (!existId) {
          return res
            .status(403)
            .json({ code: "403", message: "token is invalid" });
        }
        const checkNewPassword = validatePassword(password);
        if (checkNewPassword !== true) {
          return res
            .status(403)
            .json({ code: "403", message: checkNewPassword });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        existId.password = passwordHash;
        existId.save().then((user) => {
          return res
            .status(403)
            .json({ code: "403", user, message: "Password has been changed!" });
        });
      }
    });
  } catch (e) {
    return res.status(403).json({ code: "403", errorMessage: e });
  }
}

async function verifyEmail(req, res) {
  const token = req.query.token;

  const secretKey = process.env.SECRET_KEY;

  if (!token) {
    return res
      .status(403)
      .json({ code: "403", message: "Token parameter is required" });
  }

  try {
    jwt.verify(token, secretKey, async (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ code: "403", message: "token is invalid", error: err });
      }
      if (user.id) {
        const existId = await Merchand.findOne({ _id: user.id });
        if (!existId) {
          return res
            .status(403)
            .json({ code: "403", message: "token is invalid" });
        }

        existId.isEmailVerified = true;
        existId.save().then((user) => {
          return res
            .status(403)
            .json({ code: "403", message: "Email has been verified!" });
        });
      }
    });
  } catch (e) {
    return res.status(403).json({ code: "403", errorMessage: e });
  }
}

module.exports = {
  resetPassword,
  registerController,
  loginController,
  forgetPassword,
  SelfController,
  verifyEmail,
};
