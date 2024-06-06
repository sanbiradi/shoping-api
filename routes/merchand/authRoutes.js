const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// import of controllers
const merchandAuthController = require("../../controllers/Merchand/authController");

//routes
router.post("/register", merchandAuthController.registerController);
router.get("/login", merchandAuthController.loginController);
router.post("/self", merchandAuthController.SelfController);
router.post("/forget-password", merchandAuthController.forgetPassword);
router.post("/reset-password", merchandAuthController.resetPassword);
router.post("/verify-email", merchandAuthController.verifyEmail);
module.exports = router;

