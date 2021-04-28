const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const Admin = require('../../models/Admin');
const role = require('../../services/utils/role');
const { IsAdmin, verifyToken } = require('../../middleware/auth');

/**
 * @swagger
 * /api/admin:
 *   get:
 *     tags:
 *       - admin
 *     parameters:
 *      - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Get all admins.
 *     responses:
 *       '200':
 *          description: Successful
*/
router.get('/', verifyToken, IsAdmin, async (req, res) => {
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
 * /api/admin/{adminId}:
 *   get:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Get an admin.
 *     responses:
 *       '200':
 *          description: Successful
*/
router.get('/:adminId', verifyToken, IsAdmin, async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.adminId);
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
 *     summary: Create an admin.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *admin
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', [
    check('username', 'username is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], verifyToken, IsAdmin, 
 async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    // var {email, password} = req.body;

    try{
        // See if the admin exists
        let admin = await Admin.findOne({'username': req.body.username});

        if(admin){
            return res.status(400).json({errors: [{msg: 'Admin with this username already exists'} ] });
        }

        admin = new Admin(req.body);

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);

        admin.password = await bcrypt.hash(req.body.password, salt);

        await admin.save();

        return res.json({msg: "Admin successfully created"});

    } catch(err){
        console.log(err.message);
        res.status(500).send('Server error');
    }
}
);


router.post( '/login',
  check('username', 'username is required').isEmail(),
  check('password', 'password is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      let admin = await Admin.findOne({ username });

      if (!admin) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        admin: {
          id: admin.id
        },
        role: role.Admin
      };

      const { id, username } = admin;

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '2 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

/**
 * @swagger
 * /api/admin/{adminId}:
 *   put:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *     summary: Update an admin.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *admin
 *     responses:
 *       '200':
 *          description: Successful
*/
router.put('/:adminId', verifyToken, IsAdmin, async (req, res) => {

  try {
    const admin = await Admin.findByIdAndUpdate(req.params.adminId, {
      $set: req.body
    }, (error, data) => {
      if (error) {
        console.log(error)
        return next(error);
      } else {
        // res.json(data)
        console.log('Admin updated successfully!')
      }
    });
    await admin.save();
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/admin/{adminId}:
 *   delete:
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: adminId
 *         schema:
 *           type: string
 *     summary: Remove an admin.
 *     responses:
 *       '204':
 *          description: Successful
*/
router.delete('/:adminId', verifyToken, IsAdmin, async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.adminId);
  
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


module.exports = router;