const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Middleware: protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    // 1. Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2. Cookie
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token)
      return res
        .status(401)
        .json({ status: "fail", message: "You are not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return res
        .status(401)
        .json({ status: "fail", message: "User no longer exists" });

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: "fail", message: "Invalid token" });
  }
};

// Middleware: admin only
exports.adminOnly = (req, res, next) => {
  if (!req.user.admin)
    return res
      .status(403)
      .json({ status: "fail", message: "Admin privileges required" });
  next();
};

// REGISTER user (admin can create users)
exports.registerUser = async (req, res) => {
  try {
    const { fullName, phone, password, passwordConfirm, admin } = req.body;
    if (password !== passwordConfirm)
      return res
        .status(400)
        .json({ status: "fail", message: "Passwords do not match" });

    const user = await User.create({
      fullName,
      phone,
      password,
      admin: admin || false,
    });

    user.password = undefined;

    res.status(201).json({ status: "success", data: user });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res
        .status(400)
        .json({ status: "fail", message: "Phone and password required" });

    const user = await User.findOne({ phone }).select("+password");
    if (!user)
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid phone or password" });

    const correct = await bcrypt.compare(password, user.password);
    if (!correct)
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid phone or password" });

    const token = signToken(user._id);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // true in https
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: "success",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        admin: user.admin,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0),
  });

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};
