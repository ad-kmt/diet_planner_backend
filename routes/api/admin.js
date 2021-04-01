const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

/**
 * @swagger
 * /api/admin:
 *   get:
 *     tags:
 *       - admin
 *     summary: Get all admins. (Incomplete api)
 *     responses:
 *       '200':
 *          description: Successful
*/
router.get('/', async (req, res) => {
    try {
      const admins = await Admin.find();
      res.json(admins);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Get a admin. (Incomplete api)
 *     responses:
 *       '200':
 *          description: Successful
*/
router.get('/:id', async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
      res.json(admin);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/admin:
 *   post:
 *     tags:
 *       - admin
 *     summary: Create an admin. (Incomplete api)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *admin
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', [
    check('username', 'First name is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    var {username, password} = req.body;

    try{
        // See if the admin exists
        let admin = await Admin.findOne({'username': username});

        if(admin){
            return res.status(400).json({errors: [{msg: 'Admin already exists'} ] });
        }

        admin = new Admin(req.body);

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);

        admin.password = await bcrypt.hash(password, salt);

        await admin.save();

        // Return jsonwebtoken
        const payload = {
            admin: {
                id: admin.id
            }
        };

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn: 360000}, //time
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch(err){
        console.log(err.message);
        res.status(500).send('Server error');
    }
}
);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Update an admin. (Incomplete api)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *admin
 *     responses:
 *       '200':
 *          description: Successful
*/
router.put('/:id', auth, async (req, res) => {

    try {
      const meadminal = await Admin.findOneAndUpdate(req.meal.id, req.body, { new: true, upsert: true, setDefaultsOnInsert: true });

      await admin.save();

      res.json(admin);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Delete an admin. (Incomplete api)
 *     responses:
 *       '204':
 *          description: Successful
*/
router.delete('/:id', async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
  
      if (!admin) {
        return res.status(404).json({ msg: 'Admin not found' });
      }
  
      await admin.remove();
      res.json({ msg: 'Admin removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });