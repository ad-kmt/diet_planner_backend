const httpStatus = require("http-status");
const User = require("../../../models/User");
const ApiError = require("../../../utils/ApiError");

exports.getUserById = async (userId) => {
    let user = await User.findById(userId);
    if(!user){
        throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    return user;
}

exports.getUserByEmail = async (email) => {
    let user = await User.findOne({email});
    if(!user){
        throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    return user;
}