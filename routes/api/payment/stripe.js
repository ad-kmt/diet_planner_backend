const express = require('express');
require("dotenv").config();
const router = express.Router();
const { verifyToken, IsUser } = require('../../../middleware/auth');
const { paymentViaStripe } = require('../../../services/core/user/paymentService');


router.post("/", verifyToken, IsUser,  async (req, res) => {
    try{
        const user = req.user;
        const {plan, token} = req.body;

        // console.log("USER ", user);
        // console.log("PRODUCT ", plan);
        // console.log("PRICE ", plan.sellingPrice);
        // console.log(token);

        if(plan){
            let payment = await paymentViaStripe(user.id, plan, token);
            return res.status(201).send(payment);
        }
        else{
            res.status(500).send("Plan was not selected");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong");
    }
}); 

module.exports = router;