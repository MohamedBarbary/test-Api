// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// GET all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ status: "success", results: users.length, data: users });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { fullName, phone, password, passwordConfirm } = req.body;

    if (!fullName || !phone || !password || !passwordConfirm)
      return res
        .status(400)
        .json({ status: "fail", message: "All fields required" });

    if (password !== passwordConfirm)
      return res
        .status(400)
        .json({ status: "fail", message: "Passwords do not match" });

    const existing = await User.findOne({ phone });
    if (existing)
      return res
        .status(400)
        .json({ status: "fail", message: "Phone already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName,
      phone,
      password: hashed,
      admin: false, // always normal user
    });

    newUser.password = undefined;

    res.status(201).json({ status: "success", data: newUser });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// GET one user (self or admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// UPDATE user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// DELETE user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    res.json({ status: "success", message: "User deleted" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
