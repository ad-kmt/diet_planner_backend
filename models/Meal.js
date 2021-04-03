const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    // image: {
    //     type: 
    // },
    name: {                             // Name of the Dish
        type: String,
    },
    recipe: {                           // Recipe
        steps: [
            {
                step:  {
                    type: String
                }
            }
        ],
        ingredients: [                  // Ingredients and their quantity
            {
                name:{
                    type: String
                },
                quantity:{
                    type: String
                }
            }
        ],
        cookingTime: {                  // Average cooking time 
            type: String
        }
    },
    calories: {                         // calories
        type: Number
    },
    nutriValues: {                // like - proteins, vitamins, minerals, iron etc.
        protein: {
            type: Number
        },
        fat: {
            type: Number
        },
        carb: {
            type: Number
        },
    },
    mealType: {                         // veg/non-veg
        type: String
    },
    recipeVideo: {                      // A link of Recipe video
        type: String
    },
    mealTime:{                          // Breakfast/Lunch/Dinner
        type: String
    }   
});

module.exports = mongoose.model('meal', MealSchema);