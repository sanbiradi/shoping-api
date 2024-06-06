const express = require("express");
const router = express.Router();
const upload = require("../middleware/merchand/uploadsMiddle");
const shopController = require("../controllers/shopController");
const cartController = require("../controllers/cartController");
const checkBearerToken = require("../middleware/merchand/checkBearerToken");

//products route
router.get("/products", shopController.getProducts);
router.post(
  "/auth/register",
  upload.single("profile_pic"),
  shopController.registerUser
);
router.post("/auth/login", shopController.loginUser);
router.post("/auth/self", shopController.SelfController);
router.get("/products/:id", shopController.getProductById);

//accounts route
router.delete(
  "/customer/account",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  shopController.deleteAccount
);

// orders route
router.post(
  "/orders",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  cartController.createOrder
);
router.get(
  "/orders",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  cartController.getAllOrders
);
router.get(
  "/orders/:id",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  cartController.getOrderDetails
);

router.put(
  "/orders/confirm/:id",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  cartController.confirmOrder
);

router.patch(
  "/orders/:status/:id",
  checkBearerToken.getIdFromBearerTokenForShopUser,
  cartController.updateOrder
);



module.exports = router;
