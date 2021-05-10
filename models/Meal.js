const mongoose = require("mongoose");


const NutritionalValueSchema = new mongoose.Schema({
  name: String,
  amount: String,
  unit: String
})


const IngredientSchema = new mongoose.Schema({
    name: String,
    quantity: String,
    unit: String,
    pantry: String,
    type: String,
});

const MealSchema = new mongoose.Schema({
  
  name: String,                                 // Name of the Dish
  code: String,                                 // Recipe code mentioned in Excel file
  gutTags: [String],
  gutHealing: {
    type: Boolean,
    default: false,
  },
  steps: [String],
  ingredients: [IngredientSchema],
  cookingTime: String,
  prepTime: String,
  servings: String,
  yield: String,
  proteins: Number,                             // unit = g
  fats: Number,                                 // unit = g
  carbs: Number,                                // unit = g
  calories: Number,                             // unit = kcal
  nutritionalValues: [NutritionalValueSchema],
  mealType: String,                             // Breakfast/Lunch/Dinner
  source: String,                               // Recipe Source link
  image: String,                                // image link
});



module.exports = mongoose.model("meal", MealSchema);
