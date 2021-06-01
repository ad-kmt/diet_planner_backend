const Meal = require("../../../models/Meal");
const User = require("../../../models/User");
const mealType = require("../../constants/mealType");
const {
  nutrientRatio,
  errorMargin,
  GET_MEAL_MARGIN,
  RANDOM_ITERATION_COUNT,
  RANDOM_MEAL_LIST_SIZE,
} = require("../../constants/mealPlannerConstants");
const { SHUFFLE_MEAL_LIMIT } = require("../../constants/mealLimit");
const ApiError = require("../../../utils/ApiError");
const { INTERNAL_SERVER_ERROR } = require("http-status");
// const {getComboWithMealData} =require("./mealShuffler")

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
};

const getComboList = (
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
          dailyRequirement.calories * (1 + margin) &&
        primaryMeal.id != primaryMeal2.id
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
  combo.forEach((meal) => {
    proteins += meal.proteins;
    fats += meal.fats;
    carbs += meal.carbs;
    calories += meal.calories;
  });

  return {
    proteins,
    fats,
    carbs,
    calories,
  };
};

const addMealComboToMealMap = (mealCombo, mealMap) => {
  mealCombo.forEach((id) => {
    if (mealMap.has(id)) {
      mealMap.set(id, mealMap.get(id) + 1);
    } else {
      mealMap.set(id, 1);
    }
  });
};

const addDayMealComboToMealMap = (dayMealCombo, mealMap) => {
  let { breakfast, lunch, snacks, dinner } = dayMealCombo;
  addMealComboToMealMap(breakfast, mealMap);
  addMealComboToMealMap(lunch, mealMap);
  addMealComboToMealMap(snacks, mealMap);
  addMealComboToMealMap(dinner, mealMap);
};

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
  for (let index in mealCombo) {
    let meal = mealCombo[index];
    if (mealMap.has(meal.id)) {
      if (mealMap.get(meal.id) >= maxLimit) {
        return false;
      }
    }
  }
  return true;
};

/**
 *
 * @param {String} userId
 * @param {Number} mealMaxLimit
 * @param {Number} days
 * DEPRECATED
 */
const getWeeklyMealPlan = async (userId, mealMaxLimit, days) => {
  const user = await User.findById(userId);

  const dailyCals = user.healthRecords.desiredCalories;
  const dailyProteins = user.healthRecords.desiredNutrients.proteins;
  const dailyFats = user.healthRecords.desiredNutrients.fats;
  const dailyCarbs = user.healthRecords.desiredNutrients.carbs;

  const nutriRatio = nutrientRatio;

  let margin = errorMargin;

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

  for (; margin <= 0.05; margin = margin + 0.01) {
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

    let breakfastComboList = getComboList(
      breakfastList,
      fillerLightList,
      dailyBreakfastRequirement,
      margin
    );
    let lunchComboList = getComboList(
      lunchList,
      fillerMainList,
      dailyLunchRequirement,
      margin
    );
    let snacksComboList = getComboList(
      snacksList,
      fillerLightList,
      dailySnacksRequirement,
      margin
    );
    let dinnerComboList = getComboList(
      dinnerList,
      fillerMainList,
      dailyDinnerRequirement,
      margin
    );

    for (let i = 0; i < 10; i++) {
      let breakfastComboListRandom = getRandom(
        breakfastComboList,
        10 < breakfastComboList.length ? 10 : breakfastComboList.length
      );
      let lunchComboListRandom = getRandom(
        lunchComboList,
        10 < lunchComboList.length ? 10 : lunchComboList.length
      );
      let snacksComboListRandom = getRandom(
        snacksComboList,
        10 < snacksComboList.length ? 10 : snacksComboList.length
      );
      let dinnerComboListRandom = getRandom(
        dinnerComboList,
        10 < dinnerComboList.length ? 10 : dinnerComboList.length
      );

      breakfastComboListRandom.forEach((breakfastCombo) => {
        // for(let breakfastCombo in breakfastComboListRandom){

        lunchComboListRandom.forEach((lunchCombo) => {
          // for(let lunchCombo in lunchComboListRandom){

          dinnerComboListRandom.forEach((dinnerCombo) => {
            // for(let dinnerCombo in dinnerComboListRandom){

            snacksComboListRandom.forEach((snacksCombo) => {
              // for(let snacksCombo in snacksComboListRandom){

              if (
                !checkMealLimitStatusInMealMap(
                  breakfastCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                return;
              if (
                !checkMealLimitStatusInMealMap(
                  lunchCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                return;
              if (
                !checkMealLimitStatusInMealMap(
                  dinnerCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                return;
              if (
                !checkMealLimitStatusInMealMap(
                  snacksCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                return;

              let b = getNutriFactsFromCombo(breakfastCombo);
              let l = getNutriFactsFromCombo(lunchCombo);
              let s = getNutriFactsFromCombo(snacksCombo);
              let d = getNutriFactsFromCombo(dinnerCombo);

              const pErr = Math.abs(
                b.proteins +
                  l.proteins +
                  d.proteins +
                  s.proteins -
                  dailyProteins
              );
              // const fErr = Math.abs(
              //   b.fats + l.fats + d.fats + s.fats - dailyFats
              // );
              // const cErr = Math.abs(
              //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
              // );
              const calErr = Math.abs(
                b.calories + l.calories + d.calories + s.calories - dailyCals
              );

              const dayMealCombo = {
                breakfast: breakfastCombo.map((meal) => meal.id),
                lunch: lunchCombo.map((meal) => meal.id),
                snacks: snacksCombo.map((meal) => meal.id),
                dinner: dinnerCombo.map((meal) => meal.id),
                err: calErr,
              };

              if (mealPlan.length < days) {
                if (
                  calErr <= margin * dailyCals &&
                  pErr <= 2 * margin * dailyProteins
                  // fErr <= margin * dailyFats &&
                  // cErr <= margin * dailyCarbs
                ) {
                  mealPlan.push(dayMealCombo);
                  addDayMealComboToMealMap(dayMealCombo, mealMap);
                }
              } else if (mealPlan.length === days) {
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
            });
          });
        });
      });

      if (mealPlan.length === days) break;
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Breakfast: ${breakfastList.length} | Main Meal: ${lunchList.length} | Snacks: ${snacksList.length} | Filler A : ${fillerLightList.length} | Filler B: ${fillerMainList.length} `
    );
    console.log(`Daily calorie requirement: ${dailyCals}`);
    console.log(
      `Range: MIN: ${dailyCals * (1 - margin)} MAX: ${dailyCals * (1 + margin)}`
    );
    console.log(
      `Breakfast combos : ${breakfastComboList.length} | Lunch combos : ${lunchComboList.length} | Snacks combos : ${snacksComboList.length} | Dinner combos : ${dinnerComboList.length}`
    );
    console.log(`Meal Plan Length: ${mealPlan.length}`);
    console.log("-----------------------------------");

    if (mealPlan.length === days) break;
  }

  // for (let [key, value] of mealMap) {
  //   console.log(key + " = " + value);
  //   }

  // console.log("--------------BREAKFAST---------------");
  // console.log(mealPlan.map(mealCombo => mealCombo.breakfast.map(meal => meal.name)));
  // console.log("--------------LUNCH---------------");
  // console.log(mealPlan.map(mealCombo => mealCombo.lunch.map(meal => meal.name)));
  // console.log("--------------SNACKS---------------");
  // console.log(mealPlan.map(mealCombo => mealCombo.snacks.map(meal => meal.name)));
  // console.log("--------------DINNER---------------");
  // console.log(mealPlan.map(mealCombo => mealCombo.dinner.map(meal => meal.name)));

  return mealPlan;
};

/**
 *
 * @param {Object} params - userId, mealMaxLimit, days, foodTag, extraFoodRestrictions, testMeals, mealMap, gutHealing
 * @returns {Object} - mealMap, meals
 * LATEST
 */
const getMealPlan = async (params) => {
  let {
    userId,
    mealMaxLimit,
    days,
    foodTest,
    extraFoodRestrictions,
    testMeals,
    mealMap,
    gutHealing,
  } = params;

  if (mealMap != null) {
    for (let [key, value] of mealMap) {
      console.log(key + " = " + value);
    }
  }

  let gutHealingQueryCondition;
  if (gutHealing) {
    gutHealingQueryCondition = { $in: [true] };
  } else {
    gutHealingQueryCondition = { $in: [true, false] };
  }

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(foodTest)) {
    throw new Error(
      `Food tag - ${foodTest}, is restricted for user - ${user.id}`
    );
  }

  let foodRestrictions = user.healthRecords.foodRestrictions;
  if (extraFoodRestrictions != null) {
    foodRestrictions.concat(extraFoodRestrictions);
  }

  const dailyCals = user.healthRecords.desiredCalories;
  const dailyProteins = user.healthRecords.desiredNutrients.proteins;
  const dailyFats = user.healthRecords.desiredNutrients.fats;
  const dailyCarbs = user.healthRecords.desiredNutrients.carbs;

  const nutriRatio = nutrientRatio;

  let margin = errorMargin;

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
  if (mealMap == null) {
    mealMap = new Map();
  }

  var breakfastList;
  if (foodTest != null && testMeals != null && testMeals.breakfast) {
    breakfastList = await Meal.find({
      mealType: mealType.BREAKFAST,
      calories: {
        $lte: dailyBreakfastRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: foodTest }, { gutTags: { $nin: foodRestrictions } }],
      //protein //fats //carbs
    });
  } else {
    breakfastList = await Meal.find({
      mealType: mealType.BREAKFAST,
      calories: {
        $lte: dailyBreakfastRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      gutTags: { $nin: foodRestrictions },
      //protein //fats //carbs
    });
  }

  var lunchList;
  if (foodTest != null && testMeals != null && testMeals.lunch) {
    lunchList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: {
        $lte: dailyLunchRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: foodTest }, { gutTags: { $nin: foodRestrictions } }],
      //protein //fats //carbs
    });
  } else {
    lunchList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: {
        $lte: dailyLunchRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      gutTags: { $nin: foodRestrictions },
      //protein //fats //carbs
    });
  }
  var snacksList;
  if (foodTest != null && testMeals != null && testMeals.snacks) {
    snacksList = await Meal.find({
      mealType: mealType.SNACKS,
      calories: {
        $lte: dailySnacksRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: foodTest }, { gutTags: { $nin: foodRestrictions } }],
      //protein //fats //carbs
    });
  } else {
    snacksList = await Meal.find({
      mealType: mealType.SNACKS,
      calories: {
        $lte: dailySnacksRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      gutTags: { $nin: foodRestrictions },
      //protein //fats //carbs
    });
  }

  var dinnerList;
  if (foodTest != null && testMeals != null && testMeals.dinner) {
    dinnerList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: {
        $lte: dailyDinnerRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: foodTest }, { gutTags: { $nin: foodRestrictions } }],
      //protein //fats //carbs
    });
  } else {
    dinnerList = await Meal.find({
      mealType: mealType.MAIN_MEAL,
      calories: {
        $lte: dailyDinnerRequirement.calories * (1 + GET_MEAL_MARGIN),
      },
      gutHealing: gutHealingQueryCondition,
      gutTags: { $nin: foodRestrictions },
      //protein //fats //carbs
    });
  }

  const fillerLightList = await Meal.find({
    mealType: mealType.FILLER_LIGHT,
    calories: {
      $lte: dailyBreakfastRequirement.calories * (1 + GET_MEAL_MARGIN),
    },
    gutHealing: gutHealingQueryCondition,
    gutTags: { $nin: foodRestrictions },
    //protein //fats //carbs
  });

  const fillerMainList = await Meal.find({
    mealType: mealType.FILLER_MAIN,
    calories: { $lte: dailyLunchRequirement.calories * (1 + GET_MEAL_MARGIN) },
    gutHealing: gutHealingQueryCondition,
    gutTags: { $nin: foodRestrictions },
    //protein //fats //carbs
  });

  let breakfastComboList = getComboList(
    breakfastList,
    fillerLightList,
    dailyBreakfastRequirement,
    GET_MEAL_MARGIN
  );
  let lunchComboList = getComboList(
    lunchList,
    fillerMainList,
    dailyLunchRequirement,
    GET_MEAL_MARGIN
  );
  let snacksComboList = getComboList(
    snacksList,
    fillerLightList,
    dailySnacksRequirement,
    GET_MEAL_MARGIN
  );
  let dinnerComboList = getComboList(
    dinnerList,
    fillerMainList,
    dailyDinnerRequirement,
    GET_MEAL_MARGIN
  );

  console.log("Received data from database");


  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let breakfastComboListRandom = getRandom(
        breakfastComboList,
        RANDOM_MEAL_LIST_SIZE < breakfastComboList.length
          ? RANDOM_MEAL_LIST_SIZE
          : breakfastComboList.length
      );
      let lunchComboListRandom = getRandom(
        lunchComboList,
        RANDOM_MEAL_LIST_SIZE < lunchComboList.length
          ? RANDOM_MEAL_LIST_SIZE
          : lunchComboList.length
      );
      let snacksComboListRandom = getRandom(
        snacksComboList,
        RANDOM_MEAL_LIST_SIZE < snacksComboList.length
          ? RANDOM_MEAL_LIST_SIZE
          : snacksComboList.length
      );
      let dinnerComboListRandom = getRandom(
        dinnerComboList,
        RANDOM_MEAL_LIST_SIZE < dinnerComboList.length
          ? RANDOM_MEAL_LIST_SIZE
          : dinnerComboList.length
      );

      // breakfastComboListRandom.forEach((breakfastCombo) => {
      for (let bi in breakfastComboListRandom) {
        let breakfastCombo = breakfastComboListRandom[bi];
        // lunchComboListRandom.forEach((lunchCombo) => {
        for (let li in lunchComboListRandom) {
          let lunchCombo = lunchComboListRandom[li];
          // dinnerComboListRandom.forEach((dinnerCombo) => {
          for (let di in dinnerComboListRandom) {
            let dinnerCombo = dinnerComboListRandom[di];
            // snacksComboListRandom.forEach((snacksCombo) => {
            for (let si in snacksComboListRandom) {
              let snacksCombo = snacksComboListRandom[si];
              if (
                !checkMealLimitStatusInMealMap(
                  breakfastCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                continue;
              if (
                !checkMealLimitStatusInMealMap(
                  lunchCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                continue;
              if (
                !checkMealLimitStatusInMealMap(
                  dinnerCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                continue;
              if (
                !checkMealLimitStatusInMealMap(
                  snacksCombo,
                  mealMaxLimit,
                  mealMap
                )
              )
                continue;

              let b = getNutriFactsFromCombo(breakfastCombo);
              let l = getNutriFactsFromCombo(lunchCombo);
              let s = getNutriFactsFromCombo(snacksCombo);
              let d = getNutriFactsFromCombo(dinnerCombo);

              const pErr = Math.abs(
                b.proteins +
                  l.proteins +
                  d.proteins +
                  s.proteins -
                  dailyProteins
              );
              // const fErr = Math.abs(
              //   b.fats + l.fats + d.fats + s.fats - dailyFats
              // );
              // const cErr = Math.abs(
              //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
              // );
              const calErr = Math.abs(
                b.calories + l.calories + d.calories + s.calories - dailyCals
              );

              const dayMealCombo = {
                breakfast: breakfastCombo.map((meal) => meal.id),
                lunch: lunchCombo.map((meal) => meal.id),
                snacks: snacksCombo.map((meal) => meal.id),
                dinner: dinnerCombo.map((meal) => meal.id),
                err: calErr,
              };

              if (mealPlan.length < days) {
                if (
                  calErr <= margin * dailyCals &&
                  pErr <= 2 * margin * dailyProteins
                  // fErr <= margin * dailyFats &&
                  // cErr <= margin * dailyCarbs
                ) {
                  mealPlan.push(dayMealCombo);
                  addDayMealComboToMealMap(dayMealCombo, mealMap);
                }
              } else if (mealPlan.length == days) {
                break;
              }
            }
          }
        }
      }

      if (mealPlan.length == days) break;
    }
    console.log(`Margin: ${margin * 100}% Random Iteration Count:  ${RANDOM_ITERATION_COUNT} Random meal combo size: ${RANDOM_MEAL_LIST_SIZE}`);
    console.log(
      `Test Food: ${foodTest || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Breakfast: ${breakfastList.length} | Main Meal: ${lunchList.length} | Snacks: ${snacksList.length} | Filler A : ${fillerLightList.length} | Filler B: ${fillerMainList.length} `
    );
    console.log(
      `Daily cal. req. : ${dailyCals} | Range: MIN: ${
        dailyCals * (1 - margin)
      } MAX: ${dailyCals * (1 + margin)}`
    );
    console.log(
      `Breakfast combos : ${breakfastComboList.length} | Lunch combos : ${lunchComboList.length} | Snacks combos : ${snacksComboList.length} | Dinner combos : ${dinnerComboList.length}`
    );
    console.log(
      `Meal Plan Length: ${mealPlan.length} / ${days} | Meal Max Limit: ${mealMaxLimit}`
    );
    console.log("-----------------------------------");

    if (mealPlan.length == days) break;
  }

  if(mealPlan.length !== days){
    throw new ApiError(INTERNAL_SERVER_ERROR, "Meal Plan could not be generated");
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  console.log("--------------BREAKFAST---------------");
  console.log(mealPlan.map((mealCombo) => mealCombo.breakfast));
  console.log("--------------LUNCH---------------");
  console.log(mealPlan.map((mealCombo) => mealCombo.lunch));
  console.log("--------------SNACKS---------------");
  console.log(mealPlan.map((mealCombo) => mealCombo.snacks));
  console.log("--------------DINNER---------------");
  console.log(mealPlan.map((mealCombo) => mealCombo.dinner));

  return {
    meals: mealPlan,
    mealMap,
  };
};

const getMealListForTestPhase = async (
  userId,
  foodTest,
  mealMaxLimit,
  extraFoodRestrictions
) => {
  //change currentMealPlan

  let mealObjectDay1to2 = await getMealPlan({
    userId,
    mealMaxLimit: mealMaxLimit,
    extraFoodRestrictions: extraFoodRestrictions
      ? extraFoodRestrictions.concat([foodTest])
      : [foodTest],
    days: 2,
    gutHealing: true,
  });

  let testMealsDay3to4 = {
    breakfast: false,
    lunch: true,
    snacks: true,
    dinner: false,
  };
  let mealObjectDay3to4 = await getMealPlan({
    userId,
    mealMaxLimit: mealMaxLimit,
    days: 2,
    extraFoodRestrictions,
    foodTest: foodTest,
    testMeals: testMealsDay3to4,
    mealMap: mealObjectDay1to2.mealMap,
  });

  let testMealsDay5 = {
    breakfast: false,
    lunch: true,
    snacks: true,
    dinner: true,
  };
  let mealObjectDay5 = await getMealPlan({
    userId,
    mealMaxLimit: mealMaxLimit,
    days: 1,
    extraFoodRestrictions,
    foodTest,
    testMeals: testMealsDay5,
    mealMap: mealObjectDay3to4.mealMap,
  });

  let mealObjectDay6to7 = await getMealPlan({
    userId,
    mealMaxLimit: mealMaxLimit,
    days: 2,
    extraFoodRestrictions: extraFoodRestrictions
      ? extraFoodRestrictions.concat([foodTest])
      : [foodTest],
    mealMap: mealObjectDay5.mealMap,
  });

  let meals = mealObjectDay1to2.meals;
  meals.concat(
    mealObjectDay3to4.meals,
    mealObjectDay5.meals,
    mealObjectDay6to7.meals
  );
  return meals;
};

module.exports = {
  getWeeklyMealPlan,
  getMealPlan,
  getMealListForTestPhase,
  getNutriFactsFromCombo,
  getComboList,
  getRandom,
  checkMealLimitStatusInMealMap,
  addMealComboToMealMap,
};
