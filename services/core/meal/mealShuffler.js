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
  nutrientRatio,
  errorMargin,
  shuffleListReturnCount,
  RANDOM_ITERATION_COUNT,
  RANDOM_MEAL_LIST_SIZE,
} = require("../../constants/mealPlannerConstants");
const { SHUFFLE_MEAL } = require("../../constants/mealLimit");

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
  foodTag,
  gutHealing
) => {
  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);
  let mealList;
  if (foodTag != null) {
    mealList = await Meal.find({
      mealType: mealType,
      calories: { $lte: dailyRequirement.calories * (1 + margin) },
      gutHealing: gutHealingQueryCondition,
      $and: [{ gutTags: foodTag }, { gutTags: { $nin: foodRestrictions } }],
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

  let { phase, week, foodTest } = user.currentPhase;
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
  } else if (phase == 2 && foodTest == gutTags.GLUTEN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.GLUTEN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 2 && foodTest == gutTags.DAIRY) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.DAIRY,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.EGG) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.EGG,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.SOY) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.SOY,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.RED_MEAT) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.RED_MEAT,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.SEA_FOOD) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.SEA_FOOD,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.CRUSTACEAN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.CRUSTACEAN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.GRAIN) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.GRAIN,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.FISH) {
    let meals = await getMealListForTestPhase(
      user.id,
      gutTags.FISH,
      mealMaxLimit,
      extraFoodRestrictions
    );
    user.mealPlan.meals = meals;
    await User.findByIdAndUpdate(userId, user);
    return meals;
  } else if (phase == 3 && foodTest == gutTags.CORN) {
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
    let {meals} = await getMealPlan({
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
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  let breakfastCombo = await getComboWithMealData(
    mealCombo.breakfast,
    shuffleMealId
  );

  let lunchCombo = await getComboWithMealData(mealCombo.lunch);

  let snacksCombo = await getComboWithMealData(mealCombo.snacks);

  let dinnerCombo = await getComboWithMealData(mealCombo.dinner);

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    let breakfastComboList = [];
    var breakfastList;
    var fillerLightList;

    let shuffleMeal = await Meal.findById(shuffleMealId);
    if (shuffleMeal.mealType == mealType.BREAKFAST) {
      breakfastList = await getMealList(
        mealType.BREAKFAST,
        dailyBreakfastRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      breakfastComboList = getNewComboListForExistingCombo(
        breakfastList,
        null,
        breakfastCombo,
        shuffleMealId,
        dailyBreakfastRequirement,
        margin
      );
    } else if (shuffleMeal.mealType == mealType.FILLER_LIGHT) {
      breakfastList = await getMealList(
        mealType.BREAKFAST,
        dailyBreakfastRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      fillerLightList = await getMealList(
        mealType.FILLER_LIGHT,
        dailyBreakfastRequirement,
        margin,
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
        margin
      );
    }

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let breakfastComboListRandom = getRandom(
        breakfastComboList,
        RANDOM_MEAL_LIST_SIZE < breakfastComboList.length ? RANDOM_MEAL_LIST_SIZE : breakfastComboList.length
      );

      for (let index in breakfastComboListRandom) {
        let breakfastCombo = breakfastComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(breakfastCombo, 1, mealMap))
          continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(breakfastCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              breakfastCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Breakfast: ${breakfastList.length} | Filler A : ${
        fillerLightList ? fillerLightList.length : "NA"
      } `
    );
    console.log(`Breakfast combos : ${breakfastComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
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
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    let lunchComboList = [];
    var lunchList;
    var fillerMainList;

    let shuffleMeal = await Meal.findById(shuffleMealId);
    if (shuffleMeal.mealType == mealType.MAIN_MEAL) {
      lunchList = await getMealList(
        mealType.MAIN_MEAL,
        dailyLunchRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      lunchComboList = getNewComboListForExistingCombo(
        lunchList,
        null,
        lunchCombo,
        shuffleMealId,
        dailyLunchRequirement,
        margin
      );
    } else if (shuffleMeal.mealType == mealType.FILLER_MAIN) {
      lunchList = await getMealList(
        mealType.MAIN_MEAL,
        dailyLunchRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      fillerMainList = await getMealList(
        mealType.FILLER_MAIN,
        dailyLunchRequirement,
        margin,
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
        margin
      );
    }

    for (let i = 0; i < 10; i++) {
      let lunchComboListRandom = getRandom(
        lunchComboList,
        10 < lunchComboList.length ? 10 : lunchComboList.length
      );

      for (let index in lunchComboListRandom) {
        let lunchCombo = lunchComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(lunchCombo, 1, mealMap)) continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(lunchCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              lunchCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Lunch: ${lunchList.length} | Filler B : ${
        fillerMainList ? fillerMainList.length : "NA"
      } `
    );
    console.log(`Lunch combos : ${lunchComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
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
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    let snacksComboList = [];
    var snacksList;
    var fillerLightList;

    let shuffleMeal = await Meal.findById(shuffleMealId);
    if (shuffleMeal.mealType == mealType.SNACKS) {
      snacksList = await getMealList(
        mealType.SNACKS,
        dailySnacksRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      snacksComboList = getNewComboListForExistingCombo(
        snacksList,
        null,
        snacksCombo,
        shuffleMealId,
        dailySnacksRequirement,
        margin
      );
    } else if (shuffleMeal.mealType == mealType.FILLER_LIGHT) {
      snacksList = await getMealList(
        mealType.SNACKS,
        dailySnacksRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      fillerLightList = await getMealList(
        mealType.FILLER_LIGHT,
        dailySnacksRequirement,
        margin,
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
        margin
      );
    }

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let snacksComboListRandom = getRandom(
        snacksComboList,
        RANDOM_MEAL_LIST_SIZE < snacksComboList.length ? RANDOM_MEAL_LIST_SIZE : snacksComboList.length
      );

      for (let index in snacksComboListRandom) {
        let snacksCombo = snacksComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(snacksCombo, 1, mealMap)) continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(snacksCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              snacksCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Snacks: ${snacksList.length} | Filler A : ${
        fillerLightList ? fillerLightList.length : "NA"
      } `
    );
    console.log(`Snacks combos : ${snacksComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
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
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  const user = await User.findById(userId);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  let mealShuffleList = [];
  let mealMap = new Map();
  for (; margin <= 0.5; margin = margin + 0.01) {
    let dinnerComboList = [];
    var dinnerList;
    var fillerMainList;

    let shuffleMeal = await Meal.findById(shuffleMealId);
    if (shuffleMeal.mealType == mealType.MAIN_MEAL) {
      dinnerList = await getMealList(
        mealType.MAIN_MEAL,
        dailyDinnerRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      dinnerComboList = getNewComboListForExistingCombo(
        dinnerList,
        null,
        dinnerCombo,
        shuffleMealId,
        dailyDinnerRequirement,
        margin
      );
    } else if (shuffleMeal.mealType == mealType.FILLER_MAIN) {
      dinnerList = await getMealList(
        mealType.MAIN_MEAL,
        dailyDinnerRequirement,
        margin,
        foodRestrictions,
        foodTag,
        gutHealing
      );

      fillerMainList = await getMealList(
        mealType.FILLER_MAIN,
        dailyDinnerRequirement,
        margin,
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
        margin
      );
    }

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let dinnerComboListRandom = getRandom(
        dinnerComboList,
        RANDOM_MEAL_LIST_SIZE < dinnerComboList.length ? RANDOM_MEAL_LIST_SIZE : dinnerComboList.length
      );

      for (let index in dinnerComboListRandom) {
        let dinnerCombo = dinnerComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(dinnerCombo, 1, mealMap)) continue;

        let b = getNutriFactsFromCombo(dinnerCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(dinnerCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              dinnerCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Dinner: ${dinnerList.length} | Filler B : ${
        fillerMainList ? fillerMainList.length : "NA"
      } `
    );
    console.log(`Dinner combos : ${dinnerComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
      break;
    }
  }
  return mealShuffleList;
};

const shuffleBreakfast = async (params) => {
  let {
    userId,
    mealCombo,
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  for (; margin <= 0.5; margin = margin + 0.01) {
    var breakfastList = await getMealList(
      mealType.BREAKFAST,
      dailyBreakfastRequirement,
      margin,
      foodRestrictions,
      foodTag,
      gutHealing
    );

    fillerLightList = await getMealList(
      mealType.FILLER_LIGHT,
      dailyBreakfastRequirement,
      margin,
      foodRestrictions,
      null,
      gutHealing
    );

    let breakfastComboList = getComboList(
      breakfastList,
      fillerLightList,
      dailyBreakfastRequirement,
      margin
    );

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let breakfastComboListRandom = getRandom(
        breakfastComboList,
        RANDOM_MEAL_LIST_SIZE < breakfastComboList.length ? RANDOM_MEAL_LIST_SIZE : breakfastComboList.length
      );

      for (let index in breakfastComboListRandom) {
        let breakfastCombo = breakfastComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(breakfastCombo, SHUFFLE_MEAL, mealMap))
          continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(breakfastCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              breakfastCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Breakfast: ${breakfastList.length} | Filler A : ${fillerLightList.length} `
    );
    console.log(`Breakfast combos : ${breakfastComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleLunch = async (params) => {
  let {
    userId,
    mealCombo,
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  for (; margin <= 0.5; margin = margin + 0.01) {
    var lunchList = await getMealList(
      mealType.MAIN_MEAL,
      dailyLunchRequirement,
      margin,
      foodRestrictions,
      foodTag,
      gutHealing
    );

    var fillerMainList = await getMealList(
      mealType.FILLER_MAIN,
      dailyLunchRequirement,
      margin,
      foodRestrictions,
      null,
      gutHealing
    );

    let lunchComboList = getComboList(
      lunchList,
      fillerMainList,
      dailyLunchRequirement,
      margin
    );

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let lunchComboListRandom = getRandom(
        lunchComboList,
        RANDOM_MEAL_LIST_SIZE < lunchComboList.length ? RANDOM_MEAL_LIST_SIZE : lunchComboList.length
      );

      for (let index in lunchComboListRandom) {
        let lunchCombo = lunchComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(lunchCombo, SHUFFLE_MEAL, mealMap)) continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(lunchCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              lunchCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Lunch: ${lunchList.length} | Filler B : ${fillerMainList.length} `
    );
    console.log(`Lunch combos : ${lunchComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleSnacks = async (params) => {
  let {
    userId,
    mealCombo,
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  for (; margin <= 0.5; margin = margin + 0.01) {
    var snacksList = await getMealList(
      mealType.SNACKS,
      dailySnacksRequirement,
      margin,
      foodRestrictions,
      foodTag,
      gutHealing
    );

    fillerLightList = await getMealList(
      mealType.FILLER_LIGHT,
      dailySnacksRequirement,
      margin,
      foodRestrictions,
      null,
      gutHealing
    );

    let snacksComboList = getComboList(
      snacksList,
      fillerLightList,
      dailySnacksRequirement,
      margin
    );

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let snacksComboListRandom = getRandom(
        snacksComboList,
        RANDOM_MEAL_LIST_SIZE < snacksComboList.length ? RANDOM_MEAL_LIST_SIZE : snacksComboList.length
      );

      for (let index in snacksComboListRandom) {
        let snacksCombo = snacksComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(snacksCombo, SHUFFLE_MEAL, mealMap)) continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(snacksCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              snacksCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Snacks: ${snacksList.length} | Filler A : ${fillerLightList.length} `
    );
    console.log(`Snacks combos : ${snacksComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
      break;
    }
  }
  for (let [key, value] of mealMap) {
    console.log(key + " = " + value);
  }

  return mealShuffleList;
};

const shuffleDinner = async (params) => {
  let {
    userId,
    mealCombo,
    foodTag,
    extraFoodRestrictions,
    gutHealing,
  } = params;

  //get user data (tdcr)
  const user = await User.findById(userId);

  let gutHealingQueryCondition = getGutHealingQueryCondition(gutHealing);

  if (user.healthRecords.foodRestrictions.includes(foodTag)) {
    throw new Error(
      `Food tag - ${foodTag}, is restricted for user - ${user.id}`
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

  for (; margin <= 0.5; margin = margin + 0.01) {
    var dinnerList = await getMealList(
      mealType.MAIN_MEAL,
      dailyDinnerRequirement,
      margin,
      foodRestrictions,
      foodTag,
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

    for (let i = 0; i < RANDOM_ITERATION_COUNT; i++) {
      let dinnerComboListRandom = getRandom(
        dinnerComboList,
        RANDOM_MEAL_LIST_SIZE < dinnerComboList.length ? RANDOM_MEAL_LIST_SIZE : dinnerComboList.length
      );

      for (let index in dinnerComboListRandom) {
        let dinnerCombo = dinnerComboListRandom[index];
        if (!checkMealLimitStatusInMealMap(dinnerCombo, SHUFFLE_MEAL, mealMap)) continue;

        let b = getNutriFactsFromCombo(breakfastCombo);
        let l = getNutriFactsFromCombo(lunchCombo);
        let s = getNutriFactsFromCombo(snacksCombo);
        let d = getNutriFactsFromCombo(dinnerCombo);

        const pErr = Math.abs(
          b.proteins + l.proteins + d.proteins + s.proteins - dailyProteins
        );
        const fErr = Math.abs(b.fats + l.fats + d.fats + s.fats - dailyFats);
        const cErr = Math.abs(
          b.carbs + l.carbs + d.carbs + s.carbs - dailyCarbs
        );
        const calErr = Math.abs(
          b.calories + l.calories + d.calories + s.calories - dailyCals
        );

        if (mealShuffleList.length < shuffleListReturnCount) {
          if (
            calErr <= margin * dailyCals &&
            pErr <= margin * dailyProteins &&
            fErr <= margin * dailyFats &&
            cErr <= margin * dailyCarbs
          ) {
            mealShuffleList.push(dinnerCombo.map((meal) => meal.id));
            addMealComboToMealMap(
              dinnerCombo.map((meal) => meal.id),
              mealMap
            );
          }
        } else if (mealShuffleList.length == shuffleListReturnCount) {
          break;
        }
      }

      if (mealShuffleList.length == shuffleListReturnCount) {
        break;
      }
    }
    console.log(`Margin: ${margin * 100}%`);
    console.log(
      `Test Food: ${foodTag} | Food Restrictions: ${user.healthRecords.foodRestrictions} ${extraFoodRestrictions} | Gut Healing: ${gutHealing};`
    );
    console.log(
      `Dinner: ${dinnerList.length} | Filler B : ${fillerMainList.length} `
    );
    console.log(`Dinner combos : ${dinnerComboList.length}`);
    console.log(`Meal Plan Length: ${mealShuffleList.length}`);
    console.log("-----------------------------------");

    if (mealShuffleList.length == shuffleListReturnCount) {
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
