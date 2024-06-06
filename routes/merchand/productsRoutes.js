const express = require("express");
const router = express.Router();
const upload = require("../../middleware/merchand/uploadsMiddle")

const ProductManagementController = require("../../controllers/Merchand/ProductManamentController");
const checkBearerToken = require("../../middleware/merchand/checkBearerToken");
router.post(
  "/",
  upload.array("images"),
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.createProduct
);

router.get(
  "/",
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.getProducts
);

router.get(
  "/:id",
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.getProductById
);

router.put(
  "/:id",
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.updateProductDetails
);

router.patch(
  "/:id",
  upload.array("images"),
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.uploadNewProductImages
);

router.delete(
  "/:id",
  checkBearerToken.getIdFromBearerToken,
  ProductManagementController.deleteProduct
);

module.exports = router;
