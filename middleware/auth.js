const jwt = require("jsonwebtoken");
const config = require("config");
const role = require("../services/utils/role");

exports.verifyToken = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  } else {
    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).json({ msg: "Token is not valid" });
        } else {
          if (decoded.role == role.Admin) {
            req.admin = decoded.admin;
            req.role = decoded.role;
          } else {
            req.user = decoded.user;
            req.role = decoded.role;
          }
          next();
        }
      });
    } catch (err) {
      console.error("something wrong with auth middleware");
      res.status(500).json({ msg: "Server Error" });
    }
  }
};

exports.IsUser = (req, res, next) => {
  if (req.role == role.User) {
    next();
  } else {
    return res.status(401).json({ msg: "Unauthorized" });
  }
};

exports.IsAdmin = (req, res, next) => {
  // console.log(req.role);
  if (req.role == role.Admin) {
    next();
  } else {
    return res.status(401).json({ msg: "Unauthorized" });
  }
};
