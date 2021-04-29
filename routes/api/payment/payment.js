const express = require('express');
const router = express.Router();
const { verifyToken, IsAdmin, IsUser} = require("../../../middleware/auth")

const Payment = require('../../../models/Payment');


// @route    GET /api/admin/payments
// @desc     Get all payments
// @access   Public
/**
 * @swagger
 * /api/payment:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *      -  in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *    summary: Use to get all payments
 *    description: Only Admin
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *payment
 *      '404':
 *          description: Not found
 */
 router.get('/', verifyToken, IsAdmin,  async (req, res) => {
    try {
      const payments = await Payment.find();
      res.json(payments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @access   Public
/**
 * @swagger
 * /api/payments/{paymentId}:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *      -  in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *    description: Use to get payment with paymentId
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *payment
 *      '404':
 *          description: Not found
 */
 router.get('/:id', verifyToken, IsAdmin,  async (req, res) => {
  try {
    const payments = await Payment.findById(req.params.id);
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;