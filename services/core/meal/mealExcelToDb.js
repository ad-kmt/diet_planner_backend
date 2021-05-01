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
const Meal = require("../../../models/Meal");
const config = require("config");
const excelToMongo = config.get("excelToMongo");
const _ = require("lodash");


var populateMealDb = async () => {
  await readXlsxFile("data/meal-data.xlsx").then(async (rows) => {

    Meal.collection.drop();
    console.log("Collection meals removed successfully");
    // `rows` is an array of rows
    // each row being an array of cells.
    const column = rows[0];
    var recipeCode = rows[1][0];
    var newMeal = new Meal();
    for (let i = 1; i < rows.length; i++) {

      if(rows[i][0] === ""){
        break;
      }
     
      if (rows[i][0] != recipeCode) {
        
        recipeCode=rows[i][0];
        await newMeal.save();
        // console.log(newMeal);

        newMeal = new Meal();
      }

      var ingredient={};
      var nutritionalValue={};

      for (let j = 1; j < rows[i].length; j++) {
        
        if(rows[i][j] == null){
          continue;
        } 
        if (column[j] === "Ingredients") {
          ingredient.name = rows[i][j];
        } else if (column[j] === "quantity") {
          ingredient.quantity = rows[i][j];
        } else if (column[j] === "Unit") {
          ingredient.unit = rows[i][j];
        } else if (column[j] === "steps") {
          newMeal.steps.push(rows[i][j]);
        } else if (column[j] === "Pantry") {
          ingredient.pantry = rows[i][j];
        } else if (column[j] === "Type of ingredient") {
          ingredient.type = rows[i][j];
        } else if (column[j] === "Nutritional information (name)") {
          nutritionalValue.name = rows[i][j];
        } else if (column[j] === "Nutritional information (amount)") {
          nutritionalValue.amount = rows[i][j];
          if(rows[i][j-1]==="Protein") newMeal.proteins=rows[i][j];
          else if(rows[i][j-1]==="Fat") newMeal.fats=rows[i][j];
          else if(rows[i][j-1]==="Carbohydrates") newMeal.carbs=rows[i][j];
          else if(rows[i][j-1]==="Calories") newMeal.calories=rows[i][j];
        } else if (column[j] === "Nutritional information (unit)") {
          nutritionalValue.unit = rows[i][j];
        } else if (column[j] === "Food Category (GUT TAG)") {
          newMeal.gutTags.push(rows[i][j]);
        } else {
          newMeal[excelToMongo[column[j]]] = rows[i][j];
        }
      }
      if(!_.isEmpty(ingredient)) newMeal.ingredients.push(ingredient);
      if(!_.isEmpty(nutritionalValue)) newMeal.nutritionalValues.push(nutritionalValue);
    }
  });
};

module.exports = {
  populateMealDb: populateMealDb,
};
