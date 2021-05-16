const { evaluateQuizResult } = require("../../ml/brain");
const { GENDER, ACTIVITY, FOOD_INTOLERANCE, FOOD_RESTRICTIONS} = require("../../constants/quizConstants");
const gutTags= require("../../constants/gutTags");
const User = require("../../../models/User");


var quizEvaluatorOld = async (input, userId) => {
    
    let section1 = input[0];
    let section2 = input[1];
    let section3 = input[2];
    let section4 = input[3];


    // ------------------------- SECTION 1 - ABOUT YOU -----------------------------

    let gender = section1.questions[0].options[0].selected ? GENDER.MALE : GENDER.FEMALE;
    let activity = section1.questions[1].options.find(option => option.selected).option;
    let age = section1.questions[2].answer
    let height = section1.questions[3].answer;
    let weight = section1.questions[4].answer;
    let desiredWeight = section1.questions[5].answer;

    //BASAL METABOLIC RATE
    let bmr = 10 * weight + 6.25*height - 5*age;
    gender === GENDER.MALE ? bmr += 5 : bmr -= 161;

    //TOTAL DAILY ENERGY EXPENDITURE
    let tdee;

    if (activity === ACTIVITY.SEDENTARY){
        tdee = 1.2 * bmr;
    }// Sedentary/Couch Potato
    
    else if (activity === ACTIVITY.LIGHT){
        tdee = 1.375 * bmr;

    }// Light Exercise/Somewhat Active
    
    else if (activity === ACTIVITY.MODERATE){
        tdee = 1.55 * bmr;
    }// Moderate Exercise/Average Activity
    
    else if (activity === ACTIVITY.ACTIVE){
        tdee = 1.725 * bmr;
    }// Active Individuals/Very Active
    
    else if (activity === ACTIVITY.EXTREMELY_ACTIVE){
        tdee = 1.9 * bmr;
    }// Extremely Active Individuals/Extremely Active

    let desiredCalories, proteins, fats, carbs, estimatedWeightInAMonth, estimatedDays;

    //WEIGHT GAIN
    if (weight - desiredWeight < 0){
        desiredCalories = tdee + 250;
        estimatedWeightInAMonth=(weight) + (desiredCalories*30/7700);
        if (activity === ACTIVITY.SEDENTARY) proteins=1.32*weight;
        else if (activity === ACTIVITY.LIGHT) proteins=1.76*weight;
        else if (activity === ACTIVITY.MODERATE) proteins=2.2*weight;
        else if (activity === ACTIVITY.ACTIVE) proteins=2.42*weight;
        else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins=2.64*weight;
        fats=(desiredCalories-(proteins*4))*0.45/9;
        carbs=(desiredCalories-(proteins*4))*0.55/4;
    }
    //WEIGHT LOSS
    else if (weight - desiredWeight > 0){
        desiredCalories = tdee - 500;
        estimatedWeightInAMonth=(weight) - (desiredCalories*30/7700);
        if (activity === ACTIVITY.SEDENTARY) proteins=1.54*weight;
        else if (activity === ACTIVITY.LIGHT) proteins=1.98*weight;
        else if (activity === ACTIVITY.MODERATE) proteins=2.42*weight;
        else if (activity === ACTIVITY.ACTIVE) proteins=2.64*weight;
        else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins=3.39*weight;
        fats=(desiredCalories-(proteins*4))*0.55/9;
        carbs=(desiredCalories-(proteins*4))*0.45/4;
    }
    //WEIGHT MAINTENENCE
    else if (weight - desiredWeight === 0){
        desiredCalories = tdee;
        if (activity === ACTIVITY.SEDENTARY) proteins=1.1*weight;
        else if (activity === ACTIVITY.LIGHT) proteins=1.54*weight;
        else if (activity === ACTIVITY.MODERATE) proteins=1.98*weight;
        else if (activity === ACTIVITY.ACTIVE) proteins=2.2*weight;
        else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins=2.42*weight;
        fats=(desiredCalories-(proteins*4))*0.45/9;
        carbs=(desiredCalories-(proteins*4))*0.55/4;
    }
    estimatedDays=Math.abs(weight - desiredWeight)*1100/desiredCalories*7;
    
    // ------------------------- SECTION 2 & 3 - ABOUT YOUR GUT & LIFESTYLE -----------------------------

    //Input to ML Model to detect evaluate conclusion from quiz/symptoms.
    let symptomsData=[];

    section2.questions.map(question => question.options.map(option=> {
        option.selected ? symptomsData.push(1) : symptomsData.push(0);
    }));
    section3.questions.map(question => question.options.map(option=> {
        option.selected ? symptomsData.push(1) : symptomsData.push(0);
    }));

    const conclusions = evaluateQuizResult(symptomsData);
    let quizConclusion=conclusions;

    
    //EVALUATING FOOD RESTRICTIONS FROM QUIZ
    let foodRestrictions=[];

    //FOOD INTOLERANCES
    section2.questions[4].options.forEach(o => {
        if(o.selected){
            if(o.option === FOOD_INTOLERANCE.LACTOSE){
                foodRestrictions.push(gutTags.DAIRY_LACTOSE);
            } else if(o.option === FOOD_INTOLERANCE.GLUTEN){
                foodRestrictions.push(gutTags.GLUTEN);
            }
        }        
    });

    //FOOD RESTRICTIONS
    section3.questions[4].options.forEach(o => {
        if(o.selected){
            if(o.option === FOOD_RESTRICTIONS.MEAT){
                foodRestrictions.push(gutTags.MEAT);
                if(!foodRestrictions.includes(gutTags.RED_MEAT)) foodRestrictions.push(gutTags.RED_MEAT);
                if(!foodRestrictions.includes(gutTags.FISH)) foodRestrictions.push(gutTags.FISH);
                if(!foodRestrictions.includes(gutTags.SEA_FOOD)) foodRestrictions.push(gutTags.SEA_FOOD);
                if(!foodRestrictions.includes(gutTags.CRUSTACEAN)) foodRestrictions.push(gutTags.CRUSTACEAN);
            } else if(o.option === FOOD_RESTRICTIONS.RED_MEAT){
                foodRestrictions.push(gutTags.RED_MEAT);
            } else if(o.option === FOOD_RESTRICTIONS.FISH){
                foodRestrictions.push(gutTags.FISH);
            } else if(o.option === FOOD_RESTRICTIONS.CRUSTACEAN){
                foodRestrictions.push(gutTags.CRUSTACEAN);
            } else if(o.option === FOOD_RESTRICTIONS.SEA_FOOD){
                foodRestrictions.push(gutTags.SEA_FOOD);
            } else if(o.option === FOOD_RESTRICTIONS.DAIRY){
                foodRestrictions.push(gutTags.DAIRY);
            } else if(o.option === FOOD_RESTRICTIONS.EGG){
                foodRestrictions.push(gutTags.EGG);
            }
        }        
    });

    //------------------------RETURN: CONCLUSION, HEALTH RECORDS, ESTIMATION--------------------------------------

    let desiredNutrients = {proteins, fats, carbs}
    let estimation = {estimatedDays, estimatedWeightInAMonth};
    
    let healthRecords = {
        height, 
        weight, 
        desiredWeight, 
        desiredCalories,
        desiredNutrients, 
        quizConclusion, 
        foodRestrictions, 
        activity
    };

    let quizResponse = input;
    
    const user = {gender,age,quizResponse,healthRecords}
    await User.findByIdAndUpdate(userId, user);

    let result = {conclusions, healthRecords, estimation};
    

    return result;
}

module.exports = {
    quizEvaluatorOld
};