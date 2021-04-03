const User = require('../../models/User');
const Meal = require('../../models/Meal');

const getMeals = async (userId)=>{
    const user = await User.findById(userId);
    console.log(user);
    const dcalr=user.healthrecords.desiredCalories;
    const dpr=user.healthrecords.desiredNutrients.proteins;
    const dfr=user.healthrecords.desiredNutrients.fats;
    const dcr=user.healthrecords.desiredNutrients.carbs;
    const bCal = 0.3*dcalr;
    const lCal = 0.4*dcalr;
    const dCal = 0.3*dcalr;

    const bMeals = await Meal.find({mealTime: "breakfast"});
    const lMeals = await Meal.find({mealTime: "lunch"});
    const dMeals = await Meal.find({mealTime: "dinner"});

    
    
    bMeals.forEach(b => {
      lMeals.forEach(l => {
        dMeals.forEach(d => {
          const pErr = Math.pow(Math.abs((b.nutriValues.protein + l.nutriValues.protein + d.nutriValues.protein)-dpr),2);
          const fErr = Math.pow(Math.abs((b.nutriValues.fat + l.nutriValues.fat + d.nutriValues.fat)-dfr),2);
          const cErr = Math.pow(Math.abs((b.nutriValues.carb + l.nutriValues.carb + d.nutriValues.carb)-dcr),2);
          const calErr = Math.pow(Math.abs((b.calories + l.calories + d.calories)-dcalr),2);
          const tErr=pErr+fErr+cErr+calErr;
          console.log(pErr, fErr, cErr, calErr);
          const mealCombo = {
            b: b.id,
            l: l.id,
            d: d.id,
            err: tErr
          }
          console.log(mealCombo);
        });
      });
    });
}

module.exports={
    getMeals: getMeals
}