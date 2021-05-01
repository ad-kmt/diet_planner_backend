const express = require('express');
const router = express.Router();
const { populateMealDb } = require('../../services/core/meal/mealExcelToDb');
const { populateQuizDb } = require('../../services/core/quiz/quizExcelToDb');
const { trainModelFromExcel } = require('../../services/ml/brain');
const {verifyToken, IsAdmin, IsUser}= require("../../middleware/auth");

/**
 * @swagger
 * /api/service/upload/quiz-data:
 *   post:
 *     tags:
 *       - service
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               quizExcelFile:
 *                 type: string
 *                 format: binary
 *     summary: Upload quiz .xlsx.
 *     description: Only Admin
 *     responses:
 *       '200':
 *          description: Successful
 */
 router.post("/upload/quiz-data", verifyToken, IsAdmin, async (req, res) => {
    try {
      var file = req.files.quizExcelFile;
      await file.mv('data/quiz-data.xlsx');
      await populateQuizDb();
      await trainModelFromExcel();
      res.json("Success: File uploaded, database updated, new training model created.");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error: File could not be uploaded");
    }
  });

  /**
 * @swagger
 * /api/service/upload/meal-data:
 *   post:
 *     tags:
 *       - service
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mealExcelFile:
 *                 type: string
 *                 format: binary
 *     summary: Upload meal .xlsx.
 *     description: Only Admin
 *     responses:
 *       '200':
 *          description: Successful
 */
router.post("/upload/meal-data", verifyToken, IsAdmin, async (req, res) => {
try {
    var file = req.files.mealExcelFile;
    await file.mv('data/meal-data.xlsx');
    await populateMealDb();
    res.json("Success: File uploaded, database updated");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: File could not be uploaded");
}
});

  module.exports = router;