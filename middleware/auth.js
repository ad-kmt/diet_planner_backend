const jwt = require("jsonwebtoken");
const config = require("config");
const role = require("../utils/role");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

exports.verifyToken = function (req, res, next) {
  try {
    // Get token from header
    const token = req.header("x-auth-token");

    if (!token) {
      throw new  ApiError(httpStatus.UNAUTHORIZED, "No token, authorization denied");
    } else {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          throw new  ApiError(httpStatus.UNAUTHORIZED, "Token is not valid");
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
    }
  } catch (err) {
    next(err);
  }
};

exports.IsUser = (req, res, next) => {
  try {
    
    if (req.role == role.User) {
      next();
    } else {
      throw new  ApiError(httpStatus.FORBIDDEN, "Access Denied");
      // return res.status(401).json({ msg: "Unauthorized" });
    }

  } catch (error) {
    next(error)
  }
};

exports.IsAdmin = (req, res, next) => {
  try {
    
    if (req.role == role.Admin) {
      next();
    } else {
      throw new  ApiError(httpStatus.FORBIDDEN, "Access Denied");
      // return res.status(401).json({ msg: "Unauthorized" });
    }

  } catch (error) {
    next(error)
  }
};
