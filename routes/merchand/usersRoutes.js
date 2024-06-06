const express = require("express");
const router = express.Router();

const usersControllers = require("../../controllers/Merchand/usersControllers");
const userMiddleware = require("../../middleware/merchand/checkBearerToken");

router.patch(
  "/org",
  userMiddleware.getIdFromBearerToken,
  usersControllers.udapteOrgName
);

router.post(
  "/",
  userMiddleware.getIdFromBearerToken,
  usersControllers.createUser
);

router.patch(
  "/role/:id",
  userMiddleware.getIdFromBearerToken,
  usersControllers.updateUserRole
);

router.delete(
  "/:id",
  userMiddleware.getIdFromBearerToken,
  usersControllers.deleteUser
);

router.get("/",userMiddleware.getIdFromBearerToken,usersControllers.getUsers);
router.get("/auth/change-password",userMiddleware.getIdFromBearerToken,usersControllers.changePasswordUser);
module.exports = router;
