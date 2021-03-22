const express = require('express');
const router = express.Router();
const stripe = require("stripe")("sk_test_51IUb5BGODzbn4dY6MTsi7kqrVg8NEVR5N47rk3sjsClZDMw2bT17hkpl0XLx6KQXYqM6Q7FyHG8cwna3twMwfeup00m79asTYb");
const { v4: uuid } = require('uuid');


router.post("/", (req, res) => {
    
    const {product, token} = req.body;
    console.log("PRODUCT ", product);
    console.log("PRICE ", product.price);
    console.log(token);

    //so that user is not charged two times
    const idempontencyKey = uuid();

    return stripe.customers.create({
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

        }, {idempontencyKey})
    })
    .catch(err => console.log(err))
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))

}); 

module.exports = router;