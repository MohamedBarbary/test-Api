exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1) Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2) Check cookies
    if (!token && req.cookies.jwt) {
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
