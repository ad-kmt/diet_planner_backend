const express = require('express');
const httpStatus = require('http-status');
require("dotenv").config();
const router = express.Router();
const { verifyToken, IsUser } = require('../../../middleware/auth');
const { sendAccountActivationLink } = require('../../../services/core/auth/authService');
const { paymentViaStripe } = require('../../../services/core/user/paymentService');
const ApiError = require('../../../utils/ApiError');


router.post("/", async (req, res, next) => {
    try{
        const {user, plan, token} = req.body;

        if(plan){
            let payment = await paymentViaStripe(user.id, plan, token);
            sendAccountActivationLink();
            return res.status(201).send(payment);
        }
        else{
            throw new ApiError(httpStatus.BAD_REQUEST, "Plan was not selected");
        }
    }
    catch(err){
        next(err);
    }
}); 

module.exports = router;