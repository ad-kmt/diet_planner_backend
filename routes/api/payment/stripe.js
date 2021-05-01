const express = require('express');
require("dotenv").config();
const router = express.Router();
const Plan = require('../../../models/Plan');
const Payment = require('../../../models/Payment');
const { verifyToken, IsUser } = require('../../../middleware/auth');
const User = require('../../../models/User');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/", verifyToken, IsUser,  async (req, res) => {
    try{
        const user = req.user;
        console.log("USER ", user);
        
        const {product, token} = req.body;
        
        console.log("PRODUCT ", product);
        console.log("PRICE ", product.sellingPrice);
        console.log(token);

        if(product){

            const customer = await stripe.customers.create({
                email: token.email,
                source: token.id,
            }); 

            const charge = await stripe.charges.create({
                amount: product.sellingPrice * 100, //by default price comes in cents
                currency: 'inr',
                receipt_email: user.email,
                customer: customer.id,
                description: `Purchase of ${product.name}`,
            });
    
            if(!charge) throw Error('Payment failed');
            if(charge){
                const startDate = new Date();

                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + product.duration);
                const payment = await Payment.create({
                    "userId": user.id,
                    "amount": product.sellingPrice,
                    "currency": "inr",
                    "date": Date.now().toString(),
                    "plan": product.name
                });
                user.currentPlan = {};
                user.currentPlan.name = product.name;
                user.currentPlan.price = product.sellingPrice;
                user.currentPlan.paymentId = payment.id;
                user.currentPlan.startDate = startDate;
                user.currentPlan.expiryDate = expiryDate;
                console.log(user);
                await User.findByIdAndUpdate(user.id, user);
                return res.status(201).send(payment);
            }
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