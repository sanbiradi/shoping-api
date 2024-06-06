const Product = require("../models/Product");
const Shopuser = require("../models/Shopuser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { generateNewToken } = require("./generateNewToken");

async function getProducts(req, res) {
  try {
    const { limit = 10, sortBy = "price", page = 1 } = req.query;
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);

    const totalResults = await Product.countDocuments({});
    const totalPages = Math.ceil(totalResults / limitInt);

    const options = {
      limit: limitInt,
      sort: { [sortBy]: 1 },
      skip: (pageInt - 1) * limitInt,
    };

    const products = await Product.find({}, null, options);

    res.json({
      results: products,
      page: pageInt,
      limit: limitInt,
      totalPages,
      totalResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const registerUser = async (req, res) => {
  // Validate request body
  await body("email").isEmail().run(req);
  await body("password").isLength({ min: 6 }).run(req);
  await body("name").notEmpty().run(req);
  await body("address.street").notEmpty().run(req);
  await body("address.city").notEmpty().run(req);
  await body("address.state").notEmpty().run(req);
  await body("address.pin").notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Early return on validation error
  }

  const { email, password, name, address } = req.body;

  try {
    let user = await Shopuser.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" }); // Early return if user exists
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new Shopuser({
      email,
      password: hashedPassword,
      name,
      address,
    });

    await user.save();

    const token = generateNewToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      userDetails: {
        _id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }); // Early return after successful response
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Server error" }); // Early return on server error
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Shopuser.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateNewToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      token,
      userDetails: {
        _id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.id;
    const result = await Shopuser.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete account", error: error.message });
  }
};

const SelfController = async (req, res) => {
  const authorization = req.headers["authorization"];
  const secretKey = process.env.SECRET_KEY;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: No token provided.");
  }

  const token = authorization.substring("Bearer ".length);

  if (!token) {
    return res.status(401).send("Unauthorized: No token provided.");
  }

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: "Token verification failed!" });
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < currentTimeInSeconds) {
      return res.status(400).send({ error: "Token is expired" });
    }

    try {
      console.log(decoded);
      const existingUser = await Shopuser.findById(decoded.user.id);

      if (!existingUser) {
        return res.status(404).send({ error: "User not found" });
      }

      const userDetails = {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        address: existingUser.address,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      };

      return res.status(200).send({ userDetails });
    } catch (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).send({ error: "Server error" });
    }
  });
};

module.exports = {
  getProducts,
  getProductById,
  loginUser,
  registerUser,
  deleteAccount,
  SelfController,
};
