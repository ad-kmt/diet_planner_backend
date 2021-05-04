const PriorityQueue = require("priorityqueuejs");
const Meal = require("../../../models/Meal");
const User = require("../../../models/User");
const mealType = require("../../constants/mealType");



const getRandom = (arr, n) => {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

const getMeals = async (userId) => {
  const user = await User.findById(userId);

  const dcalr = user.healthRecords.desiredCalories;
  const dpr = user.healthRecords.desiredNutrients.proteins;
  const dfr = user.healthRecords.desiredNutrients.fats;
  const dcr = user.healthRecords.desiredNutrients.carbs;

  const bMeals = await Meal.find({ mealType: mealType.BREAKFAST });
  const lMeals = await Meal.find({ mealType: mealType.MAIN_MEAL });
  const dMeals = await Meal.find({ mealType: mealType.MAIN_MEAL });
  var arr = [];
  bMeals.forEach((b) => {
    if (!b.proteins || !b.fats || !b.carbs || !b.calories) return;
    // console.log("%%%");
    lMeals.forEach((l) => {
      if (!l.proteins || !l.fats || !l.carbs || !l.calories) return;
      // console.log("$$$");
      dMeals.forEach((d) => {
        if (!d.proteins || !d.fats || !d.carbs || !d.calories) return;

        // console.log("###");
        const pErr = Math.abs(b.proteins + l.proteins + d.proteins - dpr);
        const fErr = Math.abs(b.fats + l.fats + d.fats - dfr);
        const cErr = Math.abs(b.carbs + l.carbs + d.carbs - dcr);
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

const getComboListA = (
  primaryMealList,
  secondaryMealList,
  dailyRequirement,
  margin
) => {
  let comboList = [];

  primaryMealList.forEach((primaryMeal) => {
    if (
      primaryMeal.calories >= dailyRequirement.calories * (1 - margin) &&
      primaryMeal.calories <= dailyRequirement.calories * (1 + margin)
      // primaryMeal.proteins >= dailyRequirement.proteins * (1 - margin) &&
      // primaryMeal.proteins <= dailyRequirement.proteins * (1 + margin)
    ) {
      let combo = [];
      combo.push(primaryMeal);
      comboList.push(combo);
    }

    primaryMealList.forEach((primaryMeal2) => {
      if (
        primaryMeal.calories + primaryMeal2.calories >=
          dailyRequirement.calories * (1 - margin) &&
        primaryMeal.calories + primaryMeal2.calories <=
          dailyRequirement.calories * (1 + margin)
        // primaryMeal.proteins + primaryMeal2.proteins >= dailyRequirement.proteins * (1 - margin) &&
        // primaryMeal.proteins + primaryMeal2.proteins <= dailyRequirement.proteins * (1 + margin)
      ) {
        let combo = [];
        combo.push(primaryMeal);
        combo.push(primaryMeal2);
        comboList.push(combo);
      }
    });

    secondaryMealList.forEach((secondaryMeal) => {
      if (
        primaryMeal.calories + secondaryMeal.calories >=
          dailyRequirement.calories * (1 - margin) &&
        primaryMeal.calories + secondaryMeal.calories <=
          dailyRequirement.calories * (1 + margin)
        // primaryMeal.proteins + secondaryMeal.proteins >= dailyRequirement.proteins * (1 - margin) &&
        // primaryMeal.proteins + secondaryMeal.proteins <= dailyRequirement.proteins * (1 + margin)
      ) {
        let combo = [];
        combo.push(primaryMeal);
        combo.push(secondaryMeal);
        comboList.push(combo);
      }
    });
  });

  return comboList;
};

const getWeeklyMealPlanA = async (userId, foodTest) => {
  const user = await User.findById(userId);

  if (foodTest) {
  }

  const dailyCals = user.healthRecords.desiredCalories;
  const dailyProteins = user.healthRecords.desiredNutrients.proteins;
  const dailyFats = user.healthRecords.desiredNutrients.fats;
  const dailyCarbs = user.healthRecords.desiredNutrients.carbs;

  const nutriRatio = {
    breakfast: 0.2,
    lunch: 0.35,
    dinner: 0.3,
    snacks: 0.15,
  };

  const margin = 0.05;

  const dailyBreakfastRequirement = {
    calories: nutriRatio.breakfast * dailyCals,
    proteins: nutriRatio.breakfast * dailyProteins,
    fats: nutriRatio.breakfast * dailyFats,
    carbs: nutriRatio.breakfast * dailyCarbs,
  };

  const dailyLunchRequirement = {
    calories: nutriRatio.lunch * dailyCals,
    proteins: nutriRatio.lunch * dailyProteins,
    fats: nutriRatio.lunch * dailyFats,
    carbs: nutriRatio.lunch * dailyCarbs,
  };

  const dailyDinnerRequirement = {
    calories: nutriRatio.dinner * dailyCals,
    proteins: nutriRatio.dinner * dailyProteins,
    fats: nutriRatio.dinner * dailyFats,
    carbs: nutriRatio.dinner * dailyCarbs,
  };

  const dailySnacksRequirement = {
    calories: nutriRatio.snacks * dailyCals,
    proteins: nutriRatio.snacks * dailyProteins,
    fats: nutriRatio.snacks * dailyFats,
    carbs: nutriRatio.snacks * dailyCarbs,
  };

  const breakfastList = await Meal.find({
    mealType: mealType.BREAKFAST,
    calories: { $lte: dailyBreakfastRequirement.calories * (1 + margin) },
    proteins: { $lte: dailyBreakfastRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  const lunchList = await Meal.find({
    mealType: mealType.MAIN_MEAL,
    calories: { $lte: dailyLunchRequirement.calories * (1 + margin) },
    proteins: { $lte: dailyLunchRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  const snacksList = await Meal.find({
    mealType: mealType.SNACKS,
    calories: { $lte: dailySnacksRequirement.calories * (1 + margin) },
    proteins: { $lte: dailySnacksRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  const dinnerList = await Meal.find({
    mealType: mealType.MAIN_MEAL,
    calories: { $lte: dailyDinnerRequirement.calories * (1 + margin) },
    proteins: { $lte: dailyDinnerRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  const fillerLightList = await Meal.find({
    mealType: mealType.FILLER_LIGHT,
    calories: { $lte: dailyBreakfastRequirement.calories * (1 + margin) },
    proteins: { $lte: dailyBreakfastRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  const fillerMainList = await Meal.find({
    mealType: mealType.FILLER_MAIN,
    calories: { $lte: dailyLunchRequirement.calories * (1 + margin) },
    proteins: { $lte: dailyLunchRequirement.proteins * (1 + margin) },
    //protein //fats //carbs
  });

  let breakfastComboList = getComboListA(
    breakfastList,
    fillerLightList,
    dailyBreakfastRequirement,
    margin
  );
  let lunchComboList = getComboListA(
    lunchList,
    fillerLightList,
    dailyLunchRequirement,
    margin
  );
  let snacksComboList = getComboListA(
    snacksList,
    fillerLightList,
    dailySnacksRequirement,
    margin
  );
  let dinnerComboList = getComboListA(
    dinnerList,
    fillerLightList,
    dailyDinnerRequirement,
    margin
  );

  console.log("breakfast: " + breakfastList.length);
  console.log("Main Meal: " + lunchList.length);
  console.log("Snacks: " + snacksList.length);
  console.log("Filler A : " + fillerLightList.length);
  console.log("Filler B: " + fillerMainList.length);

  console.log("Daily calorie requirement: " + dailyCals);
  console.log(
    "Daily protein requirement: " + dailyBreakfastRequirement.proteins
  );
  console.log(
    "Range: MIN: " +
      dailyCals * (1 - margin) +
      " MAX: " +
      dailyCals * (1 + margin)
  );

  console.log("breakfast combo : " + breakfastComboList.length);
  console.log("lunch combo : " + lunchComboList.length);
  console.log("snacks combo : " + snacksComboList.length);
  console.log("dinner combo : " + dinnerComboList.length);
};

const getComboListB = (
  primaryMealList,
  secondaryMealList,
  dailyRequirement,
  margin
) => {
  let comboList = [];

  primaryMealList.forEach((primaryMeal) => {
    if (
      primaryMeal.calories >= dailyRequirement.calories * (1 - margin) &&
      primaryMeal.calories <= dailyRequirement.calories * (1 + margin)
    ) {
      let combo = [];
      combo.push(primaryMeal);
      comboList.push(combo);
    }

    primaryMealList.forEach((primaryMeal2) => {
      if (
        primaryMeal.calories + primaryMeal2.calories >=
          dailyRequirement.calories * (1 - margin) &&
        primaryMeal.calories + primaryMeal2.calories <=
          dailyRequirement.calories * (1 + margin) && primaryMeal.id != primaryMeal2.id
      ) {
        let combo = [];
        combo.push(primaryMeal);
        combo.push(primaryMeal2);
        comboList.push(combo);
      }
    });

    secondaryMealList.forEach((secondaryMeal) => {
      if (
        primaryMeal.calories + secondaryMeal.calories >=
          dailyRequirement.calories * (1 - margin) &&
        primaryMeal.calories + secondaryMeal.calories <=
          dailyRequirement.calories * (1 + margin)
      ) {
        let combo = [];
        combo.push(primaryMeal);
        combo.push(secondaryMeal);
        comboList.push(combo);
      }
    });
  });

  return comboList;
};

const getNutriFactsFromCombo = (combo) => {

  let proteins = 0;
  let fats = 0;
  let carbs = 0;
  let calories = 0;
  combo.forEach(meal => {
    proteins += meal.proteins;
    fats += meal.fats;
    carbs += meal.carbs;
    calories += meal.calories;
  })
    
  return {
    proteins,
    fats,
    carbs,
    calories
  }
};


const addMealComboToMealMap = (mealCombo, mealMap) => {
  mealCombo.forEach(meal => {
    if(mealMap.has(meal.name)){
      mealMap.set(meal.name, mealMap.get(meal.name) + 1)
    } else {
      mealMap.set(meal.name, 1)
    }
  })
}

const addDayMealComboToMealMap = (dayMealCombo, mealMap) => {
  let {breakfast, lunch, snacks, dinner} = dayMealCombo;
  addMealComboToMealMap(breakfast, mealMap);
  addMealComboToMealMap(lunch, mealMap);
  addMealComboToMealMap(snacks, mealMap);
  addMealComboToMealMap(dinner, mealMap);
}

/**
 * 
 * @param {*} mealCombo 
 * @param {*} maxLimit 
 * @param {*} mealMap
 * 
 * returns 
 * TRUE: if space available,
 * FALSE: if space not availabse        
 */
const checkMealLimitStatusInMealMap = (mealCombo, maxLimit, mealMap) => {
  
  for(let index in mealCombo){
    let meal= mealCombo[index];
    if(mealMap.has(meal.name)){
      if(mealMap.get(meal.name) >= maxLimit){
        return false
      } 
    }
  }
  return true;
}





const getWeeklyMealPlanB = async (userId) => {
  const user = await User.findById(userId);

  const dailyCals = user.healthRecords.desiredCalories;
  const dailyProteins = user.healthRecords.desiredNutrients.proteins;
  const dailyFats = user.healthRecords.desiredNutrients.fats;
  const dailyCarbs = user.healthRecords.desiredNutrients.carbs;

  const nutriRatio = {
    breakfast: 0.2,
    lunch: 0.35,
    dinner: 0.3,
    snacks: 0.15,
  };

  let margin = 0.01;
  let mealMaxLimit = 1;
  let days = 3;

  const dailyBreakfastRequirement = {
    calories: nutriRatio.breakfast * dailyCals,
    proteins: nutriRatio.breakfast * dailyProteins,
    fats: nutriRatio.breakfast * dailyFats,
    carbs: nutriRatio.breakfast * dailyCarbs,
  };

  const dailyLunchRequirement = {
    calories: nutriRatio.lunch * dailyCals,
    proteins: nutriRatio.lunch * dailyProteins,
    fats: nutriRatio.lunch * dailyFats,
    carbs: nutriRatio.lunch * dailyCarbs,
  };

  const dailyDinnerRequirement = {
    calories: nutriRatio.dinner * dailyCals,
    proteins: nutriRatio.dinner * dailyProteins,
    fats: nutriRatio.dinner * dailyFats,
    carbs: nutriRatio.dinner * dailyCarbs,
  };

  const dailySnacksRequirement = {
    calories: nutriRatio.snacks * dailyCals,
    proteins: nutriRatio.snacks * dailyProteins,
    fats: nutriRatio.snacks * dailyFats,
    carbs: nutriRatio.snacks * dailyCarbs,
  };

  
  var mealPlan = [];
  var mealMap = new Map();

  for(;margin<=0.05; margin=margin+0.01){

    const breakfastList = await Meal.find({
      mealType: mealType.BREAKFAST,
      calories: { $lte: dailyBreakfastRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    const lunchList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: { $lte: dailyLunchRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    const snacksList = await Meal.find({
      mealType: mealType.SNACKS,
      calories: { $lte: dailySnacksRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    const dinnerList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: { $lte: dailyDinnerRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    const fillerLightList = await Meal.find({
      mealType: mealType.FILLER_LIGHT,
      calories: { $lte: dailyBreakfastRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    const fillerMainList = await Meal.find({
      mealType: mealType.FILLER_MAIN,
      calories: { $lte: dailyLunchRequirement.calories * (1 + margin) },
      //protein //fats //carbs
    });
  
    let breakfastComboList = getComboListB(
      breakfastList,
      fillerLightList,
      dailyBreakfastRequirement,
      margin
    );
    let lunchComboList = getComboListB(
      lunchList,
      fillerMainList,
      dailyLunchRequirement,
      margin
    );
    let snacksComboList = getComboListB(
      snacksList,
      fillerLightList,
      dailySnacksRequirement,
      margin
    );
    let dinnerComboList = getComboListB(
      dinnerList,
      fillerMainList,
      dailyDinnerRequirement,
      margin
    );

    for(let i=0; i<10; i++){

      let breakfastComboListRandom = getRandom(breakfastComboList, 10 < breakfastComboList.length ? 10 : breakfastComboList.length);
      let lunchComboListRandom = getRandom(lunchComboList, 10 < lunchComboList.length ? 10 : lunchComboList.length);
      let snacksComboListRandom = getRandom(snacksComboList, 10 < snacksComboList.length ? 10 : snacksComboList.length);
      let dinnerComboListRandom = getRandom(dinnerComboList, 10 < dinnerComboList.length ? 10 : dinnerComboList.length);
  
      breakfastComboListRandom.forEach((breakfastCombo) => {
      // for(let breakfastCombo in breakfastComboListRandom){
        
        lunchComboListRandom.forEach((lunchCombo) => {
        // for(let lunchCombo in lunchComboListRandom){

          dinnerComboListRandom.forEach((dinnerCombo) => {
            // for(let dinnerCombo in dinnerComboListRandom){ 

            snacksComboListRandom.forEach((snacksCombo) => {
            // for(let snacksCombo in snacksComboListRandom){

              if(!checkMealLimitStatusInMealMap(breakfastCombo, mealMaxLimit, mealMap)) return;
              if(!checkMealLimitStatusInMealMap(lunchCombo, mealMaxLimit, mealMap)) return;
              if(!checkMealLimitStatusInMealMap(dinnerCombo, mealMaxLimit, mealMap)) return;
              if(!checkMealLimitStatusInMealMap(snacksCombo, mealMaxLimit, mealMap)) return;
              
              let b = getNutriFactsFromCombo(breakfastCombo);
              let l = getNutriFactsFromCombo(lunchCombo);
              let s = getNutriFactsFromCombo(snacksCombo);
              let d = getNutriFactsFromCombo(dinnerCombo);
    
              const pErr = Math.abs(b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins);
              const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
              const cErr = Math.abs(b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs);
              const calErr = Math.abs(b.calories + l.calories + d.calories + s.calories - dailyCals);
    
              const dayMealCombo = {
                breakfast: breakfastCombo,
                lunch: lunchCombo,
                snacks: snacksCombo,
                dinner: dinnerCombo,
                err: calErr,
              };
    
              if (mealPlan.length < days) {
                if (calErr <= margin*dailyCals && pErr <= margin*dailyProteins && fErr <= margin*dailyFats && cErr <= margin*dailyCarbs){ 
                  mealPlan.push(dayMealCombo);
                  addDayMealComboToMealMap(dayMealCombo, mealMap);
                } 
              } else if (mealPlan.length === days){
                // break;
              }

              // need to consider protein error also for top meals.
              // else {
              //   var max = 0;
              //   for (var i = 0; i < mealPlan.length; i++) {
              //     if (mealPlan[i].err > mealPlan[max].err) max = i;
              //   }
              //   if(mealPlan[max].err > dayMealCombo.err){
              //     mealPlan.splice(max, 1);
              //     mealPlan.push(dayMealCombo);
              //   }
              // }
            })
          })
        })
      })

      if(mealPlan.length === days) break;
    }
    console.log(`Margin: ${margin*100}%`);
    console.log(`Breakfast: ${breakfastList.length} | Main Meal: ${lunchList.length} | Snacks: ${snacksList.length} | Filler A : ${fillerLightList.length} | Filler B: ${fillerMainList.length} `);
    console.log(`Daily calorie requirement: ${dailyCals}`);
    // console.log(`Daily protein requirement: ${dailyBreakfastRequirement.proteins}`);
    console.log(`Range: MIN: ${dailyCals * (1 - margin)} MAX: ${dailyCals * (1 + margin)}`);
    console.log(`Breakfast combos : ${breakfastComboList.length} | Lunch combos : ${lunchComboList.length} | Snacks combos : ${snacksComboList.length} | Dinner combos : ${dinnerComboList.length}`);
    console.log(`Meal Plan Length: ${mealPlan.length}`);
    console.log("-----------------------------------");


    if(mealPlan.length === days) break;
  }

  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
    }

  console.log("--------------BREAKFAST---------------");
  console.log(mealPlan.map(mealCombo => mealCombo.breakfast.map(meal => meal.name)));
  console.log("--------------LUNCH---------------");
  console.log(mealPlan.map(mealCombo => mealCombo.lunch.map(meal => meal.name)));
  console.log("--------------SNACKS---------------");
  console.log(mealPlan.map(mealCombo => mealCombo.snacks.map(meal => meal.name)));
  console.log("--------------DINNER---------------");
  console.log(mealPlan.map(mealCombo => mealCombo.dinner.map(meal => meal.name)));
};

module.exports = {
  getMeals,
  getWeeklyMealPlanA,
  getWeeklyMealPlanB,
};
