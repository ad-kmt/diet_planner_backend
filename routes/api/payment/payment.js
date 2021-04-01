const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
 
const User = require('../../models/User');

// @route    GET /api/admin/payments
// @desc     Get all payments
// @access   Public
/**
 * @swagger
 * /api/admin:
 *  get:
 *    tags:
 *      - user
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
 router.get('/', async (req, res) => {
    try {
      const payments = await Payment.find();
      res.json(payments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/admin/payment/{id}:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get a user's payments
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
 router.get('/payment/:userId', async (req, res) => {
    try {
      const userPayments = await Payment.find(req.params.userId);
      res.json(userPayments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});