const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const Admin = require('../../models/Admin');
const role = require('../../utils/role');
const { IsAdmin, verifyToken } = require('../../middleware/auth');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const { validate } = require('../../middleware/validate');


// @route    GET api/auth
// @desc     Get user by token
// @access   Private
/**
 * @swagger
 * /api/admin/auth:
 *   get:
 *     tags:
 *       - admin
 *     summary: Get admin by token.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *     description: Only Admin
 *     responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: *admin
 *      '404':
 *          description: Not found
*/
router.get('/auth', verifyToken, IsAdmin,async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/admin:
 *   get:
 *     tags:
 *       - admin
 *     parameters:
 *      -  in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *     summary: Get all admins.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *                schema:
 *                  type: array
 *                  items: *admin
 *       '404':
 *            description: Not found
*/
router.get('/', verifyToken, IsAdmin, async (req, res, next) => {
    try {
      const admins = await Admin.find();
      res.json(admins);
    } catch (err) {
      next(err);
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
 *         description: jwt admin authentication token
 *     summary: Get an admin.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *                schema:
 *                  type: array
 *                  items: *admin
 *       '404':
 *          description: Not found
*/
router.get('/:adminId', verifyToken, IsAdmin, async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.params.adminId);
      res.json(admin);
    } catch (err) {
      next(err);
    }
});

/**
 * @swagger
 * /api/admin:
 *   post:
 *     tags:
 *       - admin
 *     summary: Create an admin.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *admin
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *                schema:
 *                  type: string
 *                  example: Admin created successfully
 *       '404':
 *          description: Not found
*/
router.post('/', [
    check('username', 'username is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, verifyToken, IsAdmin, 
 async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try{
        // See if the admin exists
        let admin = await Admin.findOne({'username': req.body.username});

        if(admin){
          throw new ApiError(httpStatus.BAD_REQUEST, 'Admin with this username already exists');
        }

        admin = new Admin(req.body);

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);

        admin.password = await bcrypt.hash(req.body.password, salt);

        await admin.save();

        return res.json({msg: "Admin successfully created"});

    } catch(err){
        next(err);
    }
}
);

//@route   Post api/admin
//@desc    Login admin
//@access  Public
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     tags:
 *       - admin
 *     summary: Login a admin.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                token:
 *                  type: string
 *                  examples: jwt authentication token
*/
router.post( '/login',
  check('username', 'username is required').exists(),
  check('password', 'password is required').exists(),
  validate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;
      let admin = await Admin.findOne({"username": username });

      if (!admin) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Credentials');
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Credentials');
      }

      const payload = {
        admin: {
          id: admin.id
        },
        role: role.Admin
      };

      let token = await jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '2 days' }
      );

      res.json({ 
        token
      });

    } catch (err) {
      next(err);
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *     summary: Update an admin.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *           schema: *admin
 *      '404':
 *          description: Not found
*/
router.put('/:adminId', verifyToken, IsAdmin, async (req, res, next) => {

  try {
    const admin = await Admin.findByIdAndUpdate(req.params.adminId, {
      $set: req.body
    });
    res.json(admin);
  } catch (err) {
    next(error);
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *         description: jwt admin authentication token
 *     summary: Remove an admin.
 *     responses:
 *       '204':
 *          description: Successful
 *          content:
 *            application/json:
 *              schema: *admin
 *       '404':
 *          description: Not found
*/
router.delete('/:adminId', verifyToken, IsAdmin, async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.params.adminId);
      if (!admin) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
      }
      await admin.remove();
      res.json({ msg: 'Admin removed' });
    } catch (err) {
      next(err);
    }
});


module.exports = router;