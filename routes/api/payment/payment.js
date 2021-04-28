const express = require('express');
const adminAuth = require('../../../middleware/adminAuth');
const router = express.Router();

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
 *    description: Use to get all payments
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *user
 *      '404':
 *          description: Not found
 */
 router.get('/', adminAuth,async (req, res) => {
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
 *      - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to get payment with paymentId
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *user
 *      '404':
 *          description: Not found
 */
 router.get('/:paymentId', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.findById(req.params.paymentId);
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;