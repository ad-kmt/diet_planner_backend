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
 const mongoose = require("mongoose");
const readXlsxFile = require("read-excel-file/node");
const Meal = require("../../../models/Meal");
const config = require("config");
// const excelToMongo = config.get("excelToMongo");
const _ = require("lodash");
const excelCol = require("../../constants/mealExcelColumnNames");
const excelNutrient = require("../../constants/mealExcelNutrientNames");
const gutTags = require("../../constants/gutTags");



const excelToMongo = {
  [excelCol.RECIPE_CODE]: "code",
  [excelCol.MEAL_TYPE]: "mealType",
  [excelCol.RECIPE_NAME]: "name",
  [excelCol.SOURCE_LINK]: "source",
  [excelCol.IMAGE]: "image",
  [excelCol.MEAL_PREP_TIME]: "prepTime",
  [excelCol.COOKING_TIME]: "cookingTime",
  [excelCol.SERVINGS]: "servings",
  [excelCol.YIELD]: "yield"
}


let dropMealCollection = () => {

  const connection = mongoose.connection;
  connection.once("open", function() {
    console.log("MongoDB connected successfully");
    connection.db.listCollections().toArray(function(err, names) {
      if (err) {
          console.log(err);
      } else {
          for (i = 0; i < names.length; i++) {
              if ((names[i].name === "meals")) {
                  console.log("Meal Collection Exists in DB");
                  mongoose.connection.db.dropCollection(
                      "meals",
                      function(err, result) {
                          console.log("Collection droped");
                      }
                  );
                  console.log("Meal Collection No Longer Available");
              } 
          }
      }
  });
  });
}


var populateMealDb = async () => {
  await readXlsxFile("data/meal-data.xlsx").then(async (R) => {

    dropMealCollection();

    // `R` is an array of rows
    // each row being an array of cells.
    const column = R[0];
    var recipeCode = R[1][0];
    var newMeal = new Meal();

    for (let i = 1; i < R.length; i++) {

      if(R[i][0] === ""){
        break;
      }
     
      if (R[i][0] != recipeCode) {
        
        recipeCode=R[i][0];
        await newMeal.save();
        // console.log(newMeal);

        newMeal = new Meal();
      }

      var ingredient={};
      var nutritionalValue={};

      for (let j = 1; j < R[i].length; j++) {
        
        if(R[i][j] == null){
          continue;
        } 
        if(column[j] === excelCol.GUT_HEALING) {
          if(R[i][j] === gutTags.GUT_HEALING) newMeal.gutHealing = true;
        } else if (column[j] === excelCol.INGREDIENTS) {
          ingredient.name = R[i][j];
        } else if (column[j] === excelCol.QUANTITY) {
          ingredient.quantity = R[i][j];
        } else if (column[j] === excelCol.UNIT) {
          ingredient.unit = R[i][j];
        } else if (column[j] === excelCol.STEPS) {
          newMeal.steps.push(R[i][j]);
        } else if (column[j] === excelCol.PANTRY) {
          ingredient.pantry = R[i][j];
        } else if (column[j] === excelCol.INGREDIENT_TYPE) {
          ingredient.type = R[i][j];
        } else if (column[j] === excelCol.NUTRIENT_NAME) {
          nutritionalValue.name = R[i][j];
        } else if (column[j] === excelCol.NUTRIENT_AMOUNT) {
          nutritionalValue.amount = R[i][j];
          if(R[i][j-1] === excelNutrient.PROTEINS) newMeal.proteins=R[i][j];
          else if(R[i][j-1] === excelNutrient.FATS) newMeal.fats=R[i][j];
          else if(R[i][j-1] === excelNutrient.CARBS) newMeal.carbs=R[i][j];
          else if(R[i][j-1] === excelNutrient.CALORIES) newMeal.calories=R[i][j];
        } else if (column[j] === excelCol.NUTRIENT_UNIT) {
          nutritionalValue.unit = R[i][j];
        } else if (column[j] === excelCol.GUT_TAG) {
          newMeal.gutTags.push(R[i][j]);
        } else {
          newMeal[excelToMongo[column[j]]] = R[i][j];
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
