const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const { protect, adminOnly } = authController;

router.post("/login", authController.login);
router.post("/Register", authController.registerUser);

router.get("/", protect, adminOnly, userController.getAllUsers);
router.post("/", protect, adminOnly, authController.registerUser);
router.post("/", protect, authController.logout);

router.get("/:id", protect, (req, res) => {
  if (req.user.admin || req.user._id.toString() === req.params.id) {
    return userController.getUser(req, res);
  }
  res
    .status(403)
    .json({ status: "fail", message: "You can only access your profile" });
});

router.patch("/:id", protect, adminOnly, userController.updateUser);
router.delete("/:id", protect, adminOnly, userController.deleteUser);

module.exports = router;
