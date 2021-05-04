const mongoose = require("mongoose");


const NutritionalValueSchema = new mongoose.Schema({
  name: String,
  amount: String,
  unit: String
})



// const NutritionalValuesSchema = new mongoose.Schema({
//   protein: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   fat: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   carbs: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   sugars: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   saturatedFats: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   dietaryFibers: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   cholestrol: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "g"
//     }
//   },
//   vitaminA: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "IU"
//     }
//   },
//   niacin: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   vitaminB6: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   vitaminC: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   folate: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mcg"
//     }
//   },
//   calcium: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   iron: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   magnesium: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   potassium: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   sodium: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "mg"
//     }
//   },
//   fatCalories: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "kcal"
//     }
//   },
//   calories: {
//     amount: Number,
//     unit: {
//         type: String,
//         default: "kcal"
//     }
//   },
// });

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
  gutHealing: Boolean,
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
