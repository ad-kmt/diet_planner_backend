const express = require('express');
const httpStatus = require('http-status');
require("dotenv").config();
const router = express.Router();
const { verifyToken, IsUser } = require('../../../middleware/auth');
const { sendAccountActivationLink } = require('../../../services/core/auth/authService');
const { paymentViaStripe } = require('../../../services/core/user/paymentService');
const { getUserById } = require('../../../services/core/user/userService');
const ApiError = require('../../../utils/ApiError');


router.post("/", async (req, res, next) => {
    try{
        let {user, plan, token} = req.body;
        user = await getUserById(user.id);
        
        if(plan){
            var payment = await paymentViaStripe(user.id, plan, token);
            
            if(user.account.isActivated){
                //Starting Phase Plan
                await startPhasePlan(user);
                res.json({message: `Your plan has started successfully. Please login to continue.`});
            }else{
                await sendAccountActivationLink(user);
                res.json({message: `Account Activation link has been sent to ${user.email}`});
            }
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