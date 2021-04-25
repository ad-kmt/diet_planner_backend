/**
 * Requirement from CSV file
 * 1. Column names must not change
 * 2. Recipe code should be unique
 * 3. Format .csv
 * 4.
 *
 *
 * STEPS:
 *
 * 1. Read CSV file row by row
 * 2. While recipe-code is same keep populating fields in single Meal Object
 * 3. Save Meal in MongoDB
 * 4.
 */

const readXlsxFile = require("read-excel-file/node");

var populateMealDb = () => {
  readXlsxFile("data/Gut-Health-Recipes-Database.xlsx").then((rows) => {
    // `rows` is an array of rows
    // each row being an array of cells.
    for (i in rows) {
        // console.log(i);
      for (j in rows[i]) {
        console.dir(rows[i][j]);
      }
    }
  });
};

module.exports = {
    populateMealDb: populateMealDb
  };
