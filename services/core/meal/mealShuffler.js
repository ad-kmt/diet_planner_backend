const Meal = require("../../../models/Meal");
const User = require("../../../models/User");
const mealType = require("../../constants/mealType");
const gutTags = require("../../constants/gutTags");
const {
  getMealPlan,
  getMealListForTestPhase,
  getNutriFactsFromCombo,
  getRandom,
  getComboList,
  checkMealLimitStatusInMealMap,
  addMealComboToMealMap,
} = require("./mealPlanner");
const {
  NUTRI_RATIO,
  ERROR_MARGIN,
  SHUFFLE_LIST_COUNT,
  RANDOM_ITERATION_COUNT,
  RANDOM_MEAL_LIST_SIZE,
  GET_MEAL_MARGIN,
} = require("../../constants/mealPlannerConstants");
const { SHUFFLE_MEAL_LIMIT } = require("../../constants/mealLimit");

const getGutHealingQueryCondition = (gutHealing) => {
  if (gutHealing) {
    return { $in: [true] };
  } else {
    return { $in: [true, false] };
  }
};

const getComboWithMealData = async (inputCombo, shuffleMealId) => {
  let combo = [];
  for (let i in inputCombo) {
    let meal = await Meal.findById(inputCombo[i]);
    if (shuffleMealId && meal.id == shuffleMealId) {
      continue;
    } else {
      combo.push(meal);
    }
  }
  return combo;
};

const getMealList = async (
  mealType,
  dailyRequirement,
  margin,
  foodRestrictions,
  testFoodTag,
  gutHealing
) => {
  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);
  let mealList;
  if (testFoodTag != null) {
    mealList = await Meal.find({
      mealType: mealType,
      calories: { $lte: dailyRequirement.calories * (1 + margin) },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: testFoodTag }, { gutTags: { $nin: foodRestrictions } }],
      //protein //fats //carbs
    });
  } else {
    mealList = await Meal.find({
      mealType: mealType,
      calories: { $lte: dailyRequirement.calories * (1 + margin) },
      gutHealing: gutHealingQueryCondition,
      gutTags: { $nin: foodRestrictions },
      //protein //fats //carbs
    });
  }
  return mealList;
};

const getNewComboListForExistingCombo = (
  primaryMealList,
  secondaryMealList,
  inputCombo,
  shuffleMealId,
  dailyRequirement,
  margin
) => {
  let newComboList = [];
  primaryMealList.forEach((meal) => {
    if (inputCombo.some((comboMeal) => comboMeal.id == meal.id)) {
      return;
    }
    if (inputCombo.some((comboMeal) => comboMeal.id == shuffleMealId)) {
      return;
    }

    let totalCalories = meal.calories;
    inputCombo.forEach((comboMeal) => {
      totalCalories += comboMeal.calories;
    });

    if (
      totalCalories >= dailyRequirement.calories * (1 - margin) &&
      totalCalories <= dailyRequirement.calories * (1 + margin)
    ) {
      let combo = [];
      combo.push(meal);
      combo.concat(inputCombo);
      newComboList.push(combo);
    }
  });
  if (secondaryMealList) {
    secondaryMealList.forEach((meal) => {
      if (inputCombo.some((comboMeal) => comboMeal.id == meal.id)) {
        return;
      }
      if (inputCombo.some((comboMeal) => comboMeal.id == shuffleMealId)) {
        return;
      }

      let totalCalories = meal.calories;
      inputCombo.forEach((comboMeal) => {
        totalCalories += comboMeal.calories;
      });

      if (
        totalCalories >= dailyRequirement.calories * (1 - margin) &&
        totalCalories <= dailyRequirement.calories * (1 + margin)
      ) {
        let combo = [];
        combo.push(meal);
        combo.concat(inputCombo);
        newComboList.push(combo);
      }
    });
  }

  return newComboList;
};

const shuffleMealPlan = async (userId, mealMaxLimit, extraFoodRestrictions) => {
  const user = await User.findById(userId);

  let { phase, week, testFoodTag } = user.currentPhase;
  console.log(user.currentPhase);
  if (phase == 1 && (week == 1 || week == 2 || week == 3)) {
    let { meals } = await getMealPlan({
      userId: user.id,
      mealMaxLimit,
      extraFoodRestrictions,
      days: 7,
      gutHealing: true,
    });
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 2 && testFoodTag == gutTags.GLUTEN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.GLUTEN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 2 && testFoodTag == gutTags.DAIRY) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.DAIRY,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.EGG) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.EGG,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.SOY) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.SOY,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.RED_MEAT) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.RED_MEAT,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.SEA_FOOD) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.SEA_FOOD,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.CRUSTACEAN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.CRUSTACEAN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.GRAIN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.GRAIN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.FISH) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.FISH,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && testFoodTag == gutTags.CORN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.CORN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 4) {
    let { meals } = await getMealPlan({
      userId: user.id,
      mealMaxLimit,
      extraFoodRestrictions,
      days: 7,
    });
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  }
};

const shuffleBreakfastSingle = async (params) => {
  let {
    userId,
    shuffleMealId,
    mealCombo,
    testFoodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyBreakfastRequirement = {
    calories: nutriRatio.breakfast * dailyCals,
    proteins: nutriRatio.breakfast * dailyProteins,
    fats: nutriRatio.breakfast * dailyFats,
    carbs: nutriRatio.breakfast * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(
    mealCombo.breakfast,
    shuffleMealId
  );

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let breakfastComboList = [];
  var breakfastList;
  var fillerLightList;

  let shuffleMeal = await Meal.findById(shuffleMealId);

  if (shuffleMeal.mealType == mealType.BREAKFAST) {
    breakfastList = await getMealList(
      mealType.BREAKFAST,
      dailyBreakfastRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    breakfastComboList = getNewComboListForExistingCombo(
      breakfastList,
      null,
      breakfastCombo,
      shuffleMealId,
      dailyBreakfastRequirement,
      GET_MEAL_MARGIN
    );
  } else if (shuffleMeal.mealType == mealType.FILLER_LIGHT) {
    breakfastList = await getMealList(
      mealType.BREAKFAST,
      dailyBreakfastRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    fillerLightList = await getMealList(
      mealType.FILLER_LIGHT,
      dailyBreakfastRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      null,
      gutHealing
    );

    breakfastComboList = getNewComboListForExistingCombo(
      breakfastList,
      fillerLightList,
      breakfastCombo,
      shuffleMealId,
      dailyBreakfastRequirement,
      GET_MEAL_MARGIN
    );
  }

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in breakfastComboList) {
      let breakfastCombo = breakfastComboList[index];
      if (!checkMealLimitStatusInMealMap(breakfastCombo, 1, mealMap)) continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(breakfastCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            breakfastCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }

    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Breakfast: ${breakfastList.length} | Filler A : ${
        fillerLightList ? fillerLightList.length : "NA"
      } `
    );
    console.log(`New Breakfast combos : ${breakfastComboList.length}`);
    console.log(
      `Success Breakfast Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );
    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  return mealShuffleList;
};

const shuffleLunchSingle = async (params) => {
  let {
    userId,
    shuffleMealId,
    mealCombo,
    testFoodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyLunchRequirement = {
    calories: nutriRatio.lunch * dailyCals,
    proteins: nutriRatio.lunch * dailyProteins,
    fats: nutriRatio.lunch * dailyFats,
    carbs: nutriRatio.lunch * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch, shuffleMealId);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let lunchComboList = [];
  var lunchList;
  var fillerMainList;

  let shuffleMeal = await Meal.findById(shuffleMealId);
  if (shuffleMeal.mealType == mealType.MAIN_MEAL) {
    lunchList = await getMealList(
      mealType.MAIN_MEAL,
      dailyLunchRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    lunchComboList = getNewComboListForExistingCombo(
      lunchList,
      null,
      lunchCombo,
      shuffleMealId,
      dailyLunchRequirement,
      GET_MEAL_MARGIN
    );
  } else if (shuffleMeal.mealType == mealType.FILLER_MAIN) {
    lunchList = await getMealList(
      mealType.MAIN_MEAL,
      dailyLunchRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    fillerMainList = await getMealList(
      mealType.FILLER_MAIN,
      dailyLunchRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      null,
      gutHealing
    );

    lunchComboList = getNewComboListForExistingCombo(
      lunchList,
      fillerMainList,
      lunchCombo,
      shuffleMealId,
      dailyLunchRequirement,
      GET_MEAL_MARGIN
    );
  }

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in lunchComboList) {
      let lunchCombo = lunchComboList[index];
      if (!checkMealLimitStatusInMealMap(lunchCombo, 1, mealMap)) continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(lunchCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            lunchCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }

    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Lunch: ${lunchList.length} | Filler B : ${
        fillerMainList ? fillerMainList.length : "NA"
      } `
    );
    console.log(`New Lunch combos : ${lunchComboList.length}`);
    console.log(
      `Success Lunch Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );
    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  return mealShuffleList;
};

const shuffleSnacksSingle = async (params) => {
  let {
    userId,
    shuffleMealId,
    mealCombo,
    testFoodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailySnacksRequirement = {
    calories: nutriRatio.snacks * dailyCals,
    proteins: nutriRatio.snacks * dailyProteins,
    fats: nutriRatio.snacks * dailyFats,
    carbs: nutriRatio.snacks * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks, shuffleMealId);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let snacksComboList = [];
  var snacksList;
  var fillerLightList;

  let shuffleMeal = await Meal.findById(shuffleMealId);
  if (shuffleMeal.mealType == mealType.SNACKS) {
    snacksList = await getMealList(
      mealType.SNACKS,
      dailySnacksRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    snacksComboList = getNewComboListForExistingCombo(
      snacksList,
      null,
      snacksCombo,
      shuffleMealId,
      dailySnacksRequirement,
      GET_MEAL_MARGIN
    );
  } else if (shuffleMeal.mealType == mealType.FILLER_LIGHT) {
    snacksList = await getMealList(
      mealType.SNACKS,
      dailySnacksRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    fillerLightList = await getMealList(
      mealType.FILLER_LIGHT,
      dailySnacksRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      null,
      gutHealing
    );

    snacksComboList = getNewComboListForExistingCombo(
      snacksList,
      fillerLightList,
      snacksCombo,
      shuffleMealId,
      dailySnacksRequirement,
      GET_MEAL_MARGIN
    );
  }

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in snacksComboList) {
      let snacksCombo = snacksComboList[index];
      if (!checkMealLimitStatusInMealMap(snacksCombo, 1, mealMap)) continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(snacksCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            snacksCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Snacks: ${snacksList.length} | Filler A : ${
        fillerLightList ? fillerLightList.length : "NA"
      } `
    );
    console.log(`New Snacks combos : ${snacksComboList.length}`);
    console.log(
      `Success Snacks Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );
    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  return mealShuffleList;
};

const shuffleDinnerSingle = async (params) => {
  let {
    userId,
    shuffleMealId,
    mealCombo,
    testFoodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyDinnerRequirement = {
    calories: nutriRatio.dinner * dailyCals,
    proteins: nutriRatio.dinner * dailyProteins,
    fats: nutriRatio.dinner * dailyFats,
    carbs: nutriRatio.dinner * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner, shuffleMealId);

  let dinnerComboList = [];
  var dinnerList;
  var fillerMainList;

  let shuffleMeal = await Meal.findById(shuffleMealId);
  if (shuffleMeal.mealType == mealType.MAIN_MEAL) {
    dinnerList = await getMealList(
      mealType.MAIN_MEAL,
      dailyDinnerRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    dinnerComboList = getNewComboListForExistingCombo(
      dinnerList,
      null,
      dinnerCombo,
      shuffleMealId,
      dailyDinnerRequirement,
      GET_MEAL_MARGIN
    );
  } else if (shuffleMeal.mealType == mealType.FILLER_MAIN) {
    dinnerList = await getMealList(
      mealType.MAIN_MEAL,
      dailyDinnerRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      testFoodTag,
      gutHealing
    );

    fillerMainList = await getMealList(
      mealType.FILLER_MAIN,
      dailyDinnerRequirement,
      GET_MEAL_MARGIN,
      foodRestrictions,
      null,
      gutHealing
    );

    dinnerComboList = getNewComboListForExistingCombo(
      dinnerList,
      fillerMainList,
      dinnerCombo,
      shuffleMealId,
      dailyDinnerRequirement,
      GET_MEAL_MARGIN
    );
  }

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in dinnerComboList) {
      let dinnerCombo = dinnerComboList[index];
      if (!checkMealLimitStatusInMealMap(dinnerCombo, 1, mealMap)) continue;

      let b = getNutriFactsFromCombo(dinnerCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(dinnerCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            dinnerCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Dinner: ${dinnerList.length} | Filler B : ${
        fillerMainList ? fillerMainList.length : "NA"
      } `
    );
    console.log(`New Dinner combos : ${dinnerComboList.length}`);
    console.log(
      `Success Dinner Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );
    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  return mealShuffleList;
};

const shuffleBreakfast = async (params) => {
  let { userId, mealCombo, testFoodTag, extraFoodRestrictions, gutHealing } =
    params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyBreakfastRequirement = {
    calories: nutriRatio.breakfast * dailyCals,
    proteins: nutriRatio.breakfast * dailyProteins,
    fats: nutriRatio.breakfast * dailyFats,
    carbs: nutriRatio.breakfast * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let mealShuffleList = [];
  let mealMap = new Map();

  addMealComboToMealMap(
    breakfastCombo.map((meal) => meal.id),
    mealMap
  );
  addMealComboToMealMap(
    breakfastCombo.map((meal) => meal.id),
    mealMap
  );

  var breakfastList = await getMealList(
    mealType.BREAKFAST,
    dailyBreakfastRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    testFoodTag,
    gutHealing
  );

  fillerLightList = await getMealList(
    mealType.FILLER_LIGHT,
    dailyBreakfastRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    null,
    gutHealing
  );

  let breakfastComboList = getComboList(
    breakfastList,
    fillerLightList,
    dailyBreakfastRequirement,
    GET_MEAL_MARGIN
  );

  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in breakfastComboList) {
      let breakfastCombo = breakfastComboList[index];
      if (!checkMealLimitStatusInMealMap(breakfastCombo, SHUFFLE_MEAL_LIMIT, mealMap))
        continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(breakfastCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            breakfastCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Breakfast: ${breakfastList.length} | Filler A : ${fillerLightList.length} `
    );
    console.log(`Breakfast combos : ${breakfastComboList.length}`);
    console.log(
      `Success Breakfast Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleLunch = async (params) => {
  let { userId, mealCombo, testFoodTag, extraFoodRestrictions, gutHealing } =
    params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyLunchRequirement = {
    calories: nutriRatio.lunch * dailyCals,
    proteins: nutriRatio.lunch * dailyProteins,
    fats: nutriRatio.lunch * dailyFats,
    carbs: nutriRatio.lunch * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let mealShuffleList = [];
  let mealMap = new Map();

  addMealComboToMealMap(
    lunchCombo.map((meal) => meal.id),
    mealMap
  );
  addMealComboToMealMap(
    lunchCombo.map((meal) => meal.id),
    mealMap
  );

  var lunchList = await getMealList(
    mealType.MAIN_MEAL,
    dailyLunchRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    testFoodTag,
    gutHealing
  );

  var fillerMainList = await getMealList(
    mealType.FILLER_MAIN,
    dailyLunchRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    null,
    gutHealing
  );

  let lunchComboList = getComboList(
    lunchList,
    fillerMainList,
    dailyLunchRequirement,
    GET_MEAL_MARGIN
  );

  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in lunchComboList) {
      let lunchCombo = lunchComboList[index];
      if (!checkMealLimitStatusInMealMap(lunchCombo, SHUFFLE_MEAL_LIMIT, mealMap))
        continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(lunchCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            lunchCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Lunch: ${lunchList.length} | Filler B : ${fillerMainList.length} `
    );
    console.log(`Lunch combos : ${lunchComboList.length}`);
    console.log(
      `Success Lunch Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleSnacks = async (params) => {
  let { userId, mealCombo, testFoodTag, extraFoodRestrictions, gutHealing } =
    params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailySnacksRequirement = {
    calories: nutriRatio.snacks * dailyCals,
    proteins: nutriRatio.snacks * dailyProteins,
    fats: nutriRatio.snacks * dailyFats,
    carbs: nutriRatio.snacks * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let mealShuffleList = [];
  let mealMap = new Map();

  addMealComboToMealMap(
    snacksCombo.map((meal) => meal.id),
    mealMap
  );
  addMealComboToMealMap(
    snacksCombo.map((meal) => meal.id),
    mealMap
  );

  var snacksList = await getMealList(
    mealType.SNACKS,
    dailySnacksRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    testFoodTag,
    gutHealing
  );

  fillerLightList = await getMealList(
    mealType.FILLER_LIGHT,
    dailySnacksRequirement,
    GET_MEAL_MARGIN,
    foodRestrictions,
    null,
    gutHealing
  );

  let snacksComboList = getComboList(
    snacksList,
    fillerLightList,
    dailySnacksRequirement,
    GET_MEAL_MARGIN
  );

  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in snacksComboList) {
      let snacksCombo = snacksComboList[index];
      if (!checkMealLimitStatusInMealMap(snacksCombo, SHUFFLE_MEAL_LIMIT, mealMap))
        continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(snacksCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            snacksCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Snacks: ${snacksList.length} | Filler A : ${fillerLightList.length} `
    );
    console.log(`Snacks combos : ${snacksComboList.length}`);
    console.log(
      `Success Snacks Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleDinner = async (params) => {
  let { userId, mealCombo, testFoodTag, extraFoodRestrictions, gutHealing } =
    params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(testFoodTag)) {
    throw new Error(
      `Food tag - ${testFoodTag}, is restricted for user - ${user.id}`
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

  const nutriRatio = NUTRI_RATIO;
  let margin = ERROR_MARGIN;

  const dailyDinnerRequirement = {
    calories: nutriRatio.dinner * dailyCals,
    proteins: nutriRatio.dinner * dailyProteins,
    fats: nutriRatio.dinner * dailyFats,
    carbs: nutriRatio.dinner * dailyCarbs,
  };

  let breakfastCombo = await getComboWithMealData(mealCombo.breakfast);

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let mealShuffleList = [];
  let mealMap = new Map();

  addMealComboToMealMap(
    dinnerCombo.map((meal) => meal.id),
    mealMap
  );
  addMealComboToMealMap(
    dinnerCombo.map((meal) => meal.id),
    mealMap
  );

  var dinnerList = await getMealList(
    mealType.MAIN_MEAL,
    dailyDinnerRequirement,
    margin,
    foodRestrictions,
    testFoodTag,
    gutHealing
  );

  var fillerMainList = await getMealList(
    mealType.FILLER_MAIN,
    dailyDinnerRequirement,
    margin,
    foodRestrictions,
    null,
    gutHealing
  );

  let dinnerComboList = getComboList(
    dinnerList,
    fillerMainList,
    dailyDinnerRequirement,
    margin
  );

  for (; margin <= 0.5; margin = margin + 0.01) {
    for (let index in dinnerComboList) {
      let dinnerCombo = dinnerComboList[index];
      if (!checkMealLimitStatusInMealMap(dinnerCombo, SHUFFLE_MEAL_LIMIT, mealMap))
        continue;

      let b = getNutriFactsFromCombo(breakfastCombo);
      let l = getNutriFactsFromCombo(lunchCombo);
      let s = getNutriFactsFromCombo(snacksCombo);
      let d = getNutriFactsFromCombo(dinnerCombo);

      const pErr = Math.abs(
        b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
      );
      // const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
      // const cErr = Math.abs(
      //   b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
      // );
      const calErr = Math.abs(
        b.calories + l.calories + d.calories + s.calories - dailyCals
      );

      if (mealShuffleList.length < SHUFFLE_LIST_COUNT) {
        if (
          calErr <= margin * dailyCals &&
          pErr <= 2 * margin * dailyProteins
          // fErr <= margin * dailyFats &&
          // cErr <= margin * dailyCarbs
        ) {
          mealShuffleList.push(dinnerCombo.map((meal) => meal.id));
          addMealComboToMealMap(
            dinnerCombo.map((meal) => meal.id),
            mealMap
          );
        }
      } else if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
        break;
      }
    }

    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${testFoodTag || "-"} | Food Restrictions: ${
        user.healthRecords.foodRestrictions
      } | Gut Healing: ${gutHealing || "-"};`
    );
    console.log(
      `Dinner: ${dinnerList.length} | Filler B : ${fillerMainList.length} `
    );
    console.log(`Dinner combos : ${dinnerComboList.length}`);
    console.log(
      `Success Dinner Combos : ${mealShuffleList.length} / ${SHUFFLE_LIST_COUNT}`
    );    console.log("-----------------------------------");

    if (mealShuffleList.length == SHUFFLE_LIST_COUNT) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

module.exports = {
  shuffleBreakfastSingle,
  shuffleLunchSingle,
  shuffleSnacksSingle,
  shuffleDinnerSingle,
  shuffleBreakfast,
  shuffleLunch,
  shuffleSnacks,
  shuffleDinner,
  shuffleMealPlan,
};
