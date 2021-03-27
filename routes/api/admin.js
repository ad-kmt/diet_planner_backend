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