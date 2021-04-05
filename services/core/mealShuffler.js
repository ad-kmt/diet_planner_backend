const Meal = require("../../models/Meal");
const User = require("../../models/User");

const shuffleBreakfast = async (userId, mealCombo) => {
    
    //get user data (tdcr)
    const user = await User.findById(userId);
    const tdcr = user.healthrecords.desiredCalories;
    const tdpr = user.healthrecords.desiredNutrients.proteins;

    //get lunch data (lCal)
    const lunch = await Meal.findById(mealCombo.lunch);
    const lCal = lunch.calories;
    const lp = lunch.nutriValues.protein;

    //get dinner data (dCal)
    const dinner = await Meal.findById(mealCombo.dinner);
    const dCal = dinner.calories;
    const dp = dinner.nutriValues.protein;

    const bCalReq = tdcr - lCal - dCal;
    const bpReq = tdpr - lp - dp;

    //logic to get all breakfast where  bcalreq - 50 <= bcal <= bcalreq + 50
    //return only 10 breakfast meals
    const breakfastMeals = Mealfind({
        mealTime: "breakfast",
        calories: {$gte : bCalReq-50, $lte: bCalReq+50},
        nutriValues:{protein: {$gte: bpReq-4, $lte: bpReq+4}},
    }).limit(10);
}

const shuffleLunch = async (userId, mealCombo) => {
    //get user data (tdcr)
    const user = await User.findById(userId);
    const tdcr = user.healthrecords.desiredCalories;
    const tdpr = user.healthrecords.desiredNutrients.proteins;

    //get breakfast data (lCal)
    const breakfast = await Meal.findById(mealCombo.breakfast);
    const bCal = breakfast.calories;
    const bp = breakfast.nutriValues.protein;

    //get dinner data (dCal)
    const dinner = await Meal.findById(mealCombo.dinner);
    const dCal = dinner.calories;
    const dp = dinner.nutriValues.protein;

    const lCalReq = tdcr - bCal - dCal;
    const lpReq = tdpr - bp - dp;

    //logic to get all lunch where  lcalreq - 50 <= lcal <= lcalreq + 50
    //return only 10 lunch meals
    const lunchMeals = Mealfind({
        mealTime: "lunch",
        calories: {$gte : lCalReq-50, $lte: lCalReq+50},
        nutriValues:{protein: {$gte: lpReq-4, $lte: lpReq+4}},
    }).limit(10);
}

const shuffleDinner = (userId, mealCombo) => {
    //get user data (tdcr)
    const user = await User.findById(userId);
    const tdcr = user.healthrecords.desiredCalories;
    const tdpr = user.healthrecords.desiredNutrients.proteins;

    //get breakfast data (dCal)
    const breakfast = await Meal.findById(mealCombo.breakfast);
    const bCal = breakfast.calories;
    const bp = breakfast.nutriValues.protein;

    //get lunch data (lCal)
    const lunch = await Meal.findById(mealCombo.lunch);
    const lCal = lunch.calories;
    const lp = lunch.nutriValues.protein;

    const dCalReq = tdcr - lCal - bCal;
    const dpReq = tdpr - lp - bp;

    //logic to get all dinner where  dcalreq - 50 <= dcal <= dcalreq + 50
    //return only 10 dinner meals
    const dinnerMeals = Mealfind({
        mealTime: "dinner",
        calories: {$gte: dCalReq-50, $lte: dCalReq+50},
        nutriValues:{protein: {$gte: dpReq-4, $lte: dpReq+4}},
    }).limit(10);
}

module.exports={
    shuffleBreakfast: shuffleBreakfast,
    shuffleLunch: shuffleLunch,
    shuffleDinner: shuffleDinner
}