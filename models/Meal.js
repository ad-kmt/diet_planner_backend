const mongoose = require("mongoose");


const NutritionalValuesSchema = new mongoose.Schema({
  protein: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  fat: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  carbs: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  sugars: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  saturatedFats: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  dietaryFibers: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  cholestrol: {
    amount: Number,
    unit: {
        type: String,
        default: "g"
    }
  },
  vitaminA: {
    amount: Number,
    unit: {
        type: String,
        default: "IU"
    }
  },
  niacin: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  vitaminB6: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  vitaminC: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  folate: {
    amount: Number,
    unit: {
        type: String,
        default: "mcg"
    }
  },
  calcium: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  iron: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  magnesium: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  potassium: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  sodium: {
    amount: Number,
    unit: {
        type: String,
        default: "mg"
    }
  },
  fatCalories: {
    amount: Number,
    unit: {
        type: String,
        default: "kcal"
    }
  },
  calories: {
    amount: Number,
    unit: {
        type: String,
        default: "kcal"
    }
  },
});

const IngredientSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    unit: String,
    pantry: String,
    type: String,
});

const MealSchema = new mongoose.Schema({
  // image: {}
  
  name: String,                                 // Name of the Dish
  code: String,                                 // Recipe code mentioned in Excel file
  category: String,
  gutTags: [String],
  steps: [String],
  ingredients: [IngredientSchema],
  cookingTime: Number,
  prepTime: Number,
  servings: Number,
  yield: Number,
  nutritionalValues: NutritionalValuesSchema,
  mealType: String,                             // Breakfast/Lunch/Dinner
  source: String,                               // Recipe Source link
});



module.exports = mongoose.model("meal", MealSchema);
