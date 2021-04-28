const express = require('express');
const router = express.Router();
const { populateMealDb } = require('../../services/core/mealDatabase');
const { populateQuizDb } = require('../../services/core/quizDatabase');
const { trainModelFromExcel } = require('../../services/ml/brain');
const {verifyToken, IsAdmin, IsUser}= require("../../middleware/auth");

/**
 * @swagger
 * /api/service/upload/quiz-data:
 *   post:
 *     tags:
 *       - service
 *     summary: Upload quiz .xlsx.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
 router.post("/upload/quiz-data", verifyToken, IsAdmin, async (req, res) => {
    try {
      var file = req.files.quizExcelFile;
      var fileName = file.name;
      await file.mv('data/quiz-data.xlsx');
      populateQuizDb();
      trainModelFromExcel();
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
 *     summary: Upload quiz .xlsx.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
router.post("/upload/meal-data", verifyToken, IsAdmin, async (req, res) => {
try {
    var file = req.files.mealExcelFile;
    var fileName = file.name;
    await file.mv('data/meal-data.xlsx');
    populateMealDb();
    res.json("Success: File uploaded, database updated");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: File could not be uploaded");
}
});

  module.exports = router;