const PriorityQueue = require("priorityqueuejs");
const Meal = require("../../../models/Meal");
const User = require("../../../models/User");

const getMeals = async (userId) => {
  const user = await User.findById(userId);

  const dcalr = user.healthRecords.desiredCalories;
  const dpr = user.healthRecords.desiredNutrients.proteins;
  const dfr = user.healthRecords.desiredNutrients.fats;
  const dcr = user.healthRecords.desiredNutrients.carbs;

  const bMeals = await Meal.find({ mealType: "Breakfast" });
  const lMeals = await Meal.find({ mealType: "Breakfast" });
  const dMeals = await Meal.find({ mealType: "Breakfast" });
  var arr = [];
  bMeals.forEach((b) => {
    if(!b.proteins || !b.fats || !b.carbs || !b.calories) return;
    // console.log("%%%");
    lMeals.forEach((l) => {
      if(!l.proteins || !l.fats || !l.carbs || !l.calories) return;
      // console.log("$$$");
      dMeals.forEach((d) => {
        if(!d.proteins || !d.fats || !d.carbs || !d.calories) return;

        // console.log("###");
        const pErr = Math.abs(
          b.proteins +
            l.proteins +
            d.proteins -
            dpr
        );
        const fErr = Math.abs(
          b.fats + l.fats + d.fats - dfr
        );
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs - dcr
        );
        const calErr = Math.abs(b.calories + l.calories + d.calories - dcalr);

        const mealCombo = {
          b: b,
          l: l,
          d: d,
          err: calErr,
        };

        if (arr.length <= 7) {
          if (calErr <= 50 && pErr <= 4 && fErr <= 4 && cErr <= 2)
            arr.push(mealCombo);
        }
        // need to consider protein error also for top meals.
        else {
          var max = 0;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].err > arr[max].err) max = i;
          }
          arr.splice(max, 1);
        }
      });
    });
  });

  arr.sort(function (a, b) {
    return a.err - b.err;
  });
  for (var i = 0; i < arr.length; i++) {
    // console.log(arr[i].err);
    console.log(arr[i].b.name, arr[i].l.name, arr[i].d.name);
  }
  return arr;
};

module.exports = {
  getMeals: getMeals,
};
