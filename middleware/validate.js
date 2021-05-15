const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

exports.validate = (req, res, next) => {
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        // Build your resulting errors however you want
        return `${location}[${param}]: ${msg}`;
      };

      const errors = validationResult(req).formatWith(errorFormatter);
      if (!errors.isEmpty()) {
        // Response will contain something like
        // { errors: [ "body[password]: must be at least 10 chars long" ] }
        let errorMsg = errors.array().join('; ');;
        next(new ApiError(httpStatus.BAD_REQUEST, errorMsg));
      }
      return next();
}