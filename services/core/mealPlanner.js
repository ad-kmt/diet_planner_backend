const PriorityQueue = require("priorityqueuejs");

const getMeals = (userId)=>{
    const user = User.findById(userId);
    const dcalr=user.healthrecords.desireddCalories;
    const dpr=user.healthrecords.desiredNutrients.proteins;
    const dfr=user.healthrecords.desiredNutrients.fats;
    const dcr=user.healthrecords.desiredNutrients.carbs;
    const bCal = 0.3*dcalr;
    const lCal = 0.4*dcalr;
    const dCal = 0.3*dcalr;

    const bMeals = await Meal.find({mealTime: "breakfast"});
    const lMeals = await Meal.find({mealTime: "lunch"});
    const dMeals = await Meal.find({mealTime: "dinner"});

    var queue = new PriorityQueue(function(a, b) {
      return b.err - a.err;
    });
    
    bMeals.forEach(b => {
      lMeals.forEach(l => {
        dMeals.forEach(d => {
          const pErr = Math.pow(abs((b.nutriValues.protein + l.nutriValues.protein + d.nutriValues.protein)-dpr),2);
          const fErr = Math.pow(abs((b.nutriValues.fat + l.nutriValues.fat + d.nutriValues.fat)-dfr),2);
          const cErr = Math.pow(abs((b.nutriValues.carb + l.nutriValues.carb + d.nutriValues.carb)-dcr),2);
          const calErr = Math.pow(abs((b.calories + l.calories + d.calories)-dcalr),2);
          const tErr=pErr+fErr+cErr+calErr;
          const mealCombo = {
            b: b.id,
            l: l.id,
            d: d.id,
            err: tErr
          }
          console.log(mealCombo);

          queue.enq(mealCombo);

        });
      });
    });

    queue.forEach(meal => {
      console.log(meal)
    });
}

module.exports={
    getMeals: getMeals
}