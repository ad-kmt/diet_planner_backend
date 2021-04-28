const express = require('express');
require("dotenv").config();
const router = express.Router();
const { v4: uuid } = require('uuid');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/", (req, res) => {
    
    const {product, token} = req.body;
    console.log("PRODUCT ", product);
    console.log("PRICE ", product.price);
    console.log(token);

    //so that user is not charged two times
    const idempontencyKey = uuid();

    stripe.customers.create({
        email: token.email,
        source: token.id,
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100, //by default price comes in cents
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `purchase of ${product.name}`,
            shipping: {
                name: token.card.name,
            }

        })
    })
    .catch(err => console.log(err))
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))

}); 

module.exports = router;