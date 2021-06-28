const {
  GENDER,
  ACTIVITY,
  FOOD_INTOLERANCE,
  FOOD_RESTRICTIONS,
} = require("../../constants/quizConstants");
const gutTags = require("../../constants/gutTags");
const User = require("../../../models/User");
const readXlsxFile = require("read-excel-file/node");
var fs = require("fs");

var quizEvaluator = async (input, userId) => {
  let section1 = input[0];
  let section2 = input[1];
  let section3 = input[2];
  let section4 = input[3];

  // ------------------------- SECTION 1 - ABOUT YOU -----------------------------

  let gender = section1.questions[0].options[0].selected
    ? GENDER.MALE
    : GENDER.FEMALE;
  let activity = section1.questions[1].options.find(
    (option) => option.selected
  ).option;
  let age = section1.questions[2].answer;
  let height = section1.questions[3].answer;
  let weight = section1.questions[4].answer;
  let desiredWeight = section1.questions[5].answer;

  //BASAL METABOLIC RATE (BMR)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  gender === GENDER.MALE ? (bmr += 5) : (bmr -= 161);

  //TOTAL DAILY ENERGY EXPENDITURE (TDEE)
  let tdee;

  if (activity === ACTIVITY.SEDENTARY) {
    tdee = 1.2 * bmr;
  } // Sedentary/Couch Potato
  else if (activity === ACTIVITY.LIGHT) {
    tdee = 1.375 * bmr;
  } // Light Exercise/Somewhat Active
  else if (activity === ACTIVITY.MODERATE) {
    tdee = 1.55 * bmr;
  } // Moderate Exercise/Average Activity
  else if (activity === ACTIVITY.ACTIVE) {
    tdee = 1.725 * bmr;
  } // Active Individuals/Very Active
  else if (activity === ACTIVITY.EXTREMELY_ACTIVE) {
    tdee = 1.9 * bmr;
  } // Extremely Active Individuals/Extremely Active

  let desiredCalories,
    proteins,
    fats,
    carbs,
    estimatedWeightInAMonth,
    estimatedDays;

  //WEIGHT GAIN
  if (weight - desiredWeight < 0) {
    desiredCalories = tdee + 250;

    estimatedWeightInAMonth = weight + (0.15 * tdee * 90)/7700;
    estimatedDays = ((desiredWeight - weight) * 7700) / (0.15 * tdee * 3);
    
    if (activity === ACTIVITY.SEDENTARY) proteins = 1.32 * weight;
    else if (activity === ACTIVITY.LIGHT) proteins = 1.76 * weight;
    else if (activity === ACTIVITY.MODERATE) proteins = 2.2 * weight;
    else if (activity === ACTIVITY.ACTIVE) proteins = 2.42 * weight;
    else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins = 2.64 * weight;
    
    fats = ((desiredCalories - proteins * 4) * 0.45) / 9;
    carbs = ((desiredCalories - proteins * 4) * 0.55) / 4;
  }
  //WEIGHT LOSS
  else if (weight - desiredWeight > 0) {
    desiredCalories = tdee - 500;
    
    estimatedWeightInAMonth = weight - (0.25 * tdee * 90) / 7700;
    estimatedDays = ((weight - desiredWeight) * 7700) / (0.25 * tdee * 3);
    
    if (activity === ACTIVITY.SEDENTARY) proteins = 1.54 * weight;
    else if (activity === ACTIVITY.LIGHT) proteins = 1.98 * weight;
    else if (activity === ACTIVITY.MODERATE) proteins = 2.42 * weight;
    else if (activity === ACTIVITY.ACTIVE) proteins = 2.64 * weight;
    else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins = 3.39 * weight;
    
    fats = ((desiredCalories - proteins * 4) * 0.55) / 9;
    carbs = ((desiredCalories - proteins * 4) * 0.45) / 4;
  }
  //WEIGHT MAINTENENCE
  else if (weight - desiredWeight === 0) {
    desiredCalories = tdee;
    
    estimatedWeightInAMonth = weight;
    estimatedDays = 0;
    
    if (activity === ACTIVITY.SEDENTARY) proteins = 1.1 * weight;
    else if (activity === ACTIVITY.LIGHT) proteins = 1.54 * weight;
    else if (activity === ACTIVITY.MODERATE) proteins = 1.98 * weight;
    else if (activity === ACTIVITY.ACTIVE) proteins = 2.2 * weight;
    else if (activity === ACTIVITY.EXTREMELY_ACTIVE) proteins = 2.42 * weight;
    
    fats = ((desiredCalories - proteins * 4) * 0.45) / 9;
    carbs = ((desiredCalories - proteins * 4) * 0.55) / 4;
  }
  

  // ------------------------- SECTION 2 & 3 - ABOUT YOUR GUT & LIFESTYLE -----------------------------

  // Populating Symptom array. Symptom array stores boolean(0/1) value for all the options, if selected then 1 else 0.
  let symptoms = [];
  section2.questions.map((question) =>
    question.options.map((option) => {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    })
  );
  section3.questions.map((question) =>
    question.options.map((option) => {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    })
  );

  let trainingDataSet = await getQuizConclusionRulesFromExcel();

  let trainingData = trainingDataSet.trainingData;
  let conclusionNames = trainingDataSet.columnNames;
  let limits = trainingDataSet.limits;
  let symptomsWeight = trainingDataSet.weight;

  //ConclusionScore stores score for each conclusion, similar for ConclusionWeight
  let conclusionScore = [];
  let conclusionWeight = [];

  //Populating ConclusionScore and ConclusionWeight Array
  for (let i = 0; i < conclusionNames.length; i++) {
    let score = 0;
    let weightSum = 0;
    for (let j = 0; j < symptoms.length; j++) {
      if (symptoms[j] === 1 && trainingData[i][j] > 0) {
        score += trainingData[i][j];
        weightSum += symptomsWeight[j];
      }
    }
    conclusionScore.push(score);
    conclusionWeight.push(weightSum);
  }

  //QuizConclusion stores all conclusions that crosses threshold value stored in Limit Array
  let quizConclusion = [];
  //QuizConclusionWeight maintains weights of all the corresponding conclusions present in QuizConclusion Array
  let quizConclusionWeight = [];

  //Populating above two arrays
  for (let i = 0; i < conclusionScore.length; i++) {
    if (conclusionScore[i] >= limits[i]) {
      quizConclusion.push(conclusionNames[i]);
      quizConclusionWeight.push(conclusionWeight[i]);
    }
  }

  var majorConclusion = [];
  var minorConclusion = [];

  let maxWeightTillNow = 0;

  // if there's no conclusion whose limit is crossed, then we get Major and Minor conclusion based on Score = Weight*
  if (quizConclusion.length === 0) {
    for (let i = 0; i < conclusionNames.length; i++) {
      if (conclusionScore[i] >= 4 && conclusionWeight[i] > maxWeightTillNow) {
        majorConclusion.length === 0 ? majorConclusion.push(conclusionNames[i]) : majorConclusion[0] = conclusionNames[i];
        maxWeightTillNow = conclusionWeight[i];
      }
    }
    for (let i = 0; i < conclusionNames.length; i++) {
      if (conclusionScore[i] >= 4 && conclusionNames[i] != majorConclusion[0])
        minorConclusion.push(conclusionNames[i]);
    }
  } else {
    for (let i = 0; i < quizConclusion.length; i++) {
      if (quizConclusionWeight[i] > maxWeightTillNow) {
        majorConclusion.length === 0 ? majorConclusion.push(quizConclusion[i]) : majorConclusion[0] = quizConclusion[i];
        maxWeightTillNow = quizConclusionWeight[i];
      }
    }
    for (let i = 0; i < quizConclusion.length; i++) {
      if (quizConclusion[i] !== majorConclusion[0])
        minorConclusion.push(quizConclusion[i]);
    }
  }
  
  const finalConclusion = { majorConclusion, minorConclusion };
  //EVALUATING FOOD RESTRICTIONS FROM QUIZ
  let foodRestrictions = [];

  //FOOD INTOLERANCES
  section2.questions[4].options.forEach((o) => {
    if (o.selected) {
      if (o.option === FOOD_INTOLERANCE.LACTOSE) {
        foodRestrictions.push(gutTags.DAIRY_LACTOSE);
      } else if (o.option === FOOD_INTOLERANCE.GLUTEN) {
        foodRestrictions.push(gutTags.GLUTEN);
      }
    }
  });

  //FOOD RESTRICTIONS
  console.log(section3.questions[4]);
  section3.questions[4].options.forEach((o) => {
    if (o.selected) {
      if (o.option === FOOD_RESTRICTIONS.MEAT) {
        foodRestrictions.push(gutTags.MEAT);
        if (!foodRestrictions.includes(gutTags.RED_MEAT))
          foodRestrictions.push(gutTags.RED_MEAT);
        if (!foodRestrictions.includes(gutTags.FISH))
          foodRestrictions.push(gutTags.FISH);
        if (!foodRestrictions.includes(gutTags.SEA_FOOD))
          foodRestrictions.push(gutTags.SEA_FOOD);
        if (!foodRestrictions.includes(gutTags.CRUSTACEAN))
          foodRestrictions.push(gutTags.CRUSTACEAN);
      } else if (o.option === FOOD_RESTRICTIONS.RED_MEAT) {
        foodRestrictions.push(gutTags.RED_MEAT);
      } else if (o.option === FOOD_RESTRICTIONS.FISH) {
        foodRestrictions.push(gutTags.FISH);
      } else if (o.option === FOOD_RESTRICTIONS.CRUSTACEAN) {
        foodRestrictions.push(gutTags.CRUSTACEAN);
      } else if (o.option === FOOD_RESTRICTIONS.SEA_FOOD) {
        foodRestrictions.push(gutTags.SEA_FOOD);
      } else if (o.option === FOOD_RESTRICTIONS.DAIRY) {
        foodRestrictions.push(gutTags.DAIRY);
      } else if (o.option === FOOD_RESTRICTIONS.EGG) {
        foodRestrictions.push(gutTags.EGG);
      }
    }
  });

  //------------------------RETURN: CONCLUSION, HEALTH RECORDS, ESTIMATION--------------------------------------

  let desiredNutrients = { proteins, fats, carbs };
  let estimation = { estimatedDays, estimatedWeightInAMonth };

  let healthRecords = {
    height,
    weight,
    desiredWeight,
    desiredCalories,
    desiredNutrients,
    quizConclusion: finalConclusion,
    foodRestrictions,
    activity,
  };

  let quizResponse = input;

  const user = { gender, age, quizResponse, healthRecords };
  await User.findByIdAndUpdate(userId, user);

  let result = { conclusions: finalConclusion, healthRecords, estimation };

  return result;
};

var getQuizConclusionRulesFromExcel = async function () {
  var rows = await readXlsxFile("data/quiz-data.xlsx", { sheet: "Training" });

  /** `rows` is an array of rows, each row being an array of cells.
   * row1: column names
   * row2: conclusion count limits
   * row3-end: symptomp options
   */

  let columnNames = [];
  var trainingData = [];
  var limits = [];
  var weight = [];
  /**
   * col1: Ques. no.
   * col2: Symptoms
   * col3: Weight
   * col4-end: Conclusions
   */

  //Populating weight array
  for (let i = 2; i < rows.length; i++) {
    weight.push(rows[i][2]);
  }

  for (let j = 3; j < rows[0].length; j++) {
    //Populating ColumnNames and limit array
    columnNames.push(rows[0][j]);
    limits.push(rows[1][j]);

    //setting input
    var input = [];
    for (let i = 2; i < rows.length; i++) {
      input.push(rows[i][j]);
    }
    //pushing to training data set
    trainingData.push(input);
  }
  let trainingDataSet = { trainingData, columnNames, limits, weight };
  // console.log(trainingDataSet);
  return trainingDataSet;
};

module.exports = {
  quizEvaluator,
};
