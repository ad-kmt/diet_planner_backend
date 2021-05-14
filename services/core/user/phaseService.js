const mealLimit = require("../../constants/mealLimit");
const phaseNames = require("../../constants/phaseName");
const phaseStatus = require("../../constants/status");
const {
  getWeeklyMealPlan,
  getMealPlan,
  getMealListForTestPhase
} = require("../meal/mealPlanner");
const { DateTime } = require("luxon");
const User = require("../../../models/User");
const gutTags = require("../../constants/gutTags");
const Meal = require("../../../models/Meal");



exports.next = async (userId, completedPhase, nextPhase, mealMaxLimit) => {
  let user = await User.findById(userId).select("currentPhase phases mealPlan");

  // console.log(user);

    if (completedPhase.phase == 1 && completedPhase.week == 1){
        user.phases.phase1.week1.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 1 && completedPhase.week == 2){
        user.phases.phase1.week2.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 1 && completedPhase.week == 3){
        user.phases.phase1.week3.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 2 && completedPhase.foodTest == gutTags.GLUTEN){
        user.phases.phase1.status = phaseStatus.DONE
        user.phases.phase2.gluten.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 2 && completedPhase.foodTest == gutTags.DAIRY){
        user.phases.phase2.dairy.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.EGG){
        user.phases.phase3.egg.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.CORN){
        user.phases.phase3.corn.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.RED_MEAT){
        user.phases.phase3.redMeat.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.GRAIN){
        user.phases.phase3.grain.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.FISH){
        user.phases.phase3.fish.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.SOY){
        user.phases.phase3.soy.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.CRUSTACEAN){
        user.phases.phase3.crustacean.status = phaseStatus.DONE;
    } else if (completedPhase.phase == 3 && completedPhase.foodTest == gutTags.SEA_FOOD){
        user.phases.phase3.seaFood.status = phaseStatus.DONE;
    } 

    if (nextPhase.phase == 1 && nextPhase.week == 2) {
    
      //change currentPhase values
      let newWeekStartDate = DateTime.now();
      let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

      user.currentPhase.startDate = newWeekStartDate;
      user.currentPhase.endDate = newWeekEndDate;
      user.currentPhase.week = 2;
      user.currentPhase.phase = 1;

      user.phases.phase1.week2.status = phaseStatus.IN_PROGRESS;
      user.phases.phase1.week2.startDate = newWeekStartDate;
      user.phases.phase1.week2.endDate = newWeekEndDate;

      //change currentMealPlan
      let { meals } = await getMealPlan({userId: user.id, mealMaxLimit: mealLimit.DEFAULT, days: 7, gutHealing: true});
      user.mealPlan = {
        startDate: newWeekStartDate,
        endDate: newWeekEndDate,
        meals,
      };
    } else if (nextPhase.phase == 1 && nextPhase.week == 3) {
      //change currentPhase values
      let newWeekStartDate = DateTime.now();
      let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

      user.currentPhase.startDate = newWeekStartDate;
      user.currentPhase.endDate = newWeekEndDate;
      user.currentPhase.week = 3;
      user.currentPhase.phase = 1;

      user.phases.phase1.week3.status = phaseStatus.IN_PROGRESS;
      user.phases.phase1.week3.startDate = newWeekStartDate;
      user.phases.phase1.week3.endDate = newWeekEndDate;

      //change currentMealPlan
      let { meals } = await getMealPlan({userId: user.id, mealMaxLimit: mealLimit.DEFAULT, days: 7, gutHealing: true});
      user.mealPlan = {
        startDate: newWeekStartDate,
        endDate: newWeekEndDate,
        meals,
      };
    } else if (nextPhase.phase == 2 && nextPhase.foodTest == gutTags.GLUTEN) {

        user.phases.phase1.status = phaseStatus.DONE

        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = 1;
        user.currentPhase.phase = 2;
        user.currentPhase.foodTest = gutTags.GLUTEN

        user.phases.phase2.gluten.status = phaseStatus.IN_PROGRESS;
        user.phases.phase2.gluten.startDate = newWeekStartDate;
        user.phases.phase2.gluten.endDate = newWeekEndDate;
        user.phases.phase2.startDate = newWeekStartDate;
        user.phases.phase2.endDate = newWeekStartDate.plus({ days: 6 });

        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.GLUTEN, mealLimit.DEFAULT);

        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 2 && nextPhase.foodTest == gutTags.DAIRY) {
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = 2;
        user.currentPhase.phase = 2;
        user.currentPhase.foodTest = gutTags.DAIRY_LACTOSE;

        user.phases.phase2.dairy.status = phaseStatus.IN_PROGRESS;
        user.phases.phase2.dairy.startDate = newWeekStartDate;
        user.phases.phase2.dairy.endDate = newWeekEndDate;

        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.DAIRY, mealLimit.DEFAULT);

        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.EGG){

        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE

        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = null;
        user.currentPhase.phase = 3;
        user.currentPhase.foodTest = gutTags.EGG;

        if(user.phases.phase3.startDate==null){
          user.phases.phase3.startDate=newWeekStartDate;
        }
        user.phases.phase3.egg.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.egg.startDate = newWeekStartDate;
        user.phases.phase3.egg.endDate = newWeekEndDate;
       
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.EGG, mealLimit.DEFAULT)

        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.CORN){
        
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = null;
        user.currentPhase.phase = 3;
        user.currentPhase.foodTest = gutTags.CORN;

        user.phases.phase3.corn.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.corn.startDate = newWeekStartDate;
        user.phases.phase3.corn.endDate = newWeekEndDate;
        
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.CORN, mealLimit.DEFAULT);

        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.RED_MEAT){ 
        
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = null;
        user.currentPhase.phase = 3;
        user.currentPhase.foodTest = gutTags.RED_MEAT;

        user.phases.phase3.redMeat.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.redMeat.startDate = newWeekStartDate;
        user.phases.phase3.redMeat.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.RED_MEAT, mealLimit.DEFAULT)
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.GRAIN){
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.week = null;
        user.currentPhase.phase = 3;
        user.currentPhase.foodTest = gutTags.GRAIN;

        user.phases.phase3.grain.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.grain.startDate = newWeekStartDate;
        user.phases.phase3.grain.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.GRAIN, mealLimit.DEFAULT)
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.SOY){
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.phase = 3;
        user.currentPhase.week = null;
        user.currentPhase.foodTest = gutTags.SOY;

        user.phases.phase3.soy.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.soy.startDate = newWeekStartDate;
        user.phases.phase3.soy.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.SOY, mealLimit.DEFAULT);
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.SEA_FOOD){
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.phase = 3;
        user.currentPhase.week = null;
        user.currentPhase.foodTest = gutTags.SEA_FOOD;

        user.phases.phase3.seaFood.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.seaFood.startDate = newWeekStartDate;
        user.phases.phase3.seaFood.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.SEA_FOOD, mealLimit.DEFAULT);
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.FISH){
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.phase = 3;
        user.currentPhase.week = null;
        user.currentPhase.foodTest = gutTags.FISH;

        user.phases.phase3.fish.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.fish.startDate = newWeekStartDate;
        user.phases.phase3.fish.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.FISH, mealLimit.DEFAULT);
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 3 && nextPhase.foodTest == gutTags.CRUSTACEAN){
        //change phase 2 status
        user.phases.phase2.status = phaseStatus.DONE
        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.phase = 3;
        user.currentPhase.week = null;
        user.currentPhase.foodTest = gutTags.CRUSTACEAN;

        user.phases.phase3.crustacean.status = phaseStatus.IN_PROGRESS;
        user.phases.phase3.crustacean.startDate = newWeekStartDate;
        user.phases.phase3.crustacean.endDate = newWeekEndDate;
        //change currentMealPlan
        let meals = getMealListForTestPhase(gutTags.CRUSTACEAN, mealLimit.DEFAULT);
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } else if (nextPhase.phase == 4 ){
        
        //change phase 3 status
        user.phases.phase3.status = phaseStatus.DONE
        user.phases.phase3.endDate = DateTime.now().minus({days: 1});

        //change currentPhase values
        let newWeekStartDate = DateTime.now();
        let newWeekEndDate = newWeekStartDate.plus({ days: 6 });

        user.currentPhase.startDate = newWeekStartDate;
        user.currentPhase.endDate = newWeekEndDate;
        user.currentPhase.phase = 4;
        user.currentPhase.week = null;
        user.currentPhase.foodTest = null;

        user.phases.phase4.startDate = newWeekStartDate;
        user.phases.phase4.status = phaseStatus.IN_PROGRESS;

        //change currentMealPlan
        let { meals } = await getMealPlan({
          userId: user.id,
          mealMaxLimit: mealLimit.DEFAULT,
          days: 7
        });
        user.mealPlan = {
          startDate: newWeekStartDate,
          endDate: newWeekEndDate,
          meals,
        };
    } 

    // console.log(user.phases.phase1.week1);

  await User.findByIdAndUpdate(userId, user);
};

/**
 * Buys Plan: start date = utc next
 */
