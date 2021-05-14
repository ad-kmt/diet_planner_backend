const { getTrainingDataSetFromExcel } = require("../../ml/brain");

var quizEvaluator2 = async (input) => {
    let symptoms=[];
    input[1].questions.map(question => question.options.map(option=> {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    }));
    input[2].questions.map(question => question.options.map(option=> {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    }));

    let trainingDataSet = await getTrainingDataSetFromExcel();
    
    let trainingData = trainingDataSet.trainingData;
    let columns = trainingDataSet.columnNames;
    let limits = trainingDataSet.limits;
    let conclusionSum=[];
    for(let i=0;i<columns.length;i++){
        let sum=0;
        for(let j=0;j<symptoms.length;j++){
            if(symptoms[j]===1 && trainingData[i][j]>0){
                sum+=trainingData[i][j];
            }
        }
        conclusionSum.push(sum);
    }

    let height = input[0].questions[3].options[0];
    let weight = input[0].questions[4].options[0];
    let desiredWeight = input[0].questions[5].options[0];
    let quizConclusion=[];
    
    for(let i=0;i<conclusionSum.length;i++){
        if(conclusionSum[i]>=limits[i]) quizConclusion.push(columns[i]);
    }

    // const { gender, activity, age, height, weight, desiredWeight } = input[0];
    
    let bmr = 10 * weight + 6.25*height - 5*input[0].questions[2].options[0];
    
    input[0].questions[0].options[0].selected ? bmr += 5 : bmr -= 161;

    let tdee;

    if (input[0].questions[1].options[0].selected){
        tdee = 1.2 * bmr;
        activity=input[0].questions[1].options[0].option;
    }// Sedentary/Couch Potato
    
    else if (input[0].questions[1].options[1].selected){
        tdee = 1.375 * bmr;
        activity=input[0].questions[1].options[1].option;
    }// Light Exercise/Somewhat Active
    
    else if (input[0].questions[1].options[2].selected){
        tdee = 1.55 * bmr;
        activity=input[0].questions[1].options[2].option;
    }// Moderate Exercise/Average Activity
    
    else if (input[0].questions[1].options[3].selected){
        tdee = 1.725 * bmr;
        activity=input[0].questions[1].options[3].option;
    }// Active Individuals/Very Active
    
    else if (input[0].questions[1].options[4].selected){
        tdee = 1.9 * bmr;
        activity=input[0].questions[1].options[4].option; 
    }// Extremely Active Individuals/Extremely Active

    
    let desiredCalories, proteins, fats, carbs, estimatedWeight, estimatedDays;
    if (weight - desiredWeight < 0){
        desiredCalories = tdee + 250;
        estimatedWeight=(weight) + (desiredCalories*30/7700);
        if (input[0].questions[1].options[0].selected) proteins=1.32*weight;
        else if (input[0].questions[1].options[1].selected) proteins=1.76*weight;
        else if (input[0].questions[1].options[2].selected) proteins=2.2*weight;
        else if (input[0].questions[1].options[3].selected) proteins=2.42*weight;
        else if (input[0].questions[1].options[4].selected) proteins=2.64*weight;
        fats=(desiredCalories-(proteins*4))*0.45/9;
        carbs=(desiredCalories-(proteins*4))*0.55/4;
    }
    else if (weight - desiredWeight > 0){
        desiredCalories = tdee - 500;
        estimatedWeight=(weight) - (desiredCalories*30/7700);
        if (input[0].questions[1].options[0].selected) proteins=1.54*weight;
        else if (input[0].questions[1].options[1].selected) proteins=1.98*weight;
        else if (input[0].questions[1].options[2].selected) proteins=2.42*weight;
        else if (input[0].questions[1].options[3].selected) proteins=2.64*weight;
        else if (input[0].questions[1].options[4].selected) proteins=3.39*weight;
        fats=(desiredCalories-(proteins*4))*0.55/9;
        carbs=(desiredCalories-(proteins*4))*0.45/4;
    }
    else if (weight - desiredWeight === 0){
        desiredCalories = tdee;
        if (input[0].questions[1].options[0].selected) proteins=1.1*weight;
        else if (input[0].questions[1].options[1].selected) proteins=1.54*weight;
        else if (input[0].questions[1].options[2].selected) proteins=1.98*weight;
        else if (input[0].questions[1].options[3].selected) proteins=2.2*weight;
        else if (input[0].questions[1].options[4].selected) proteins=2.42*weight;
        fats=(desiredCalories-(proteins*4))*0.45/9;
        carbs=(desiredCalories-(proteins*4))*0.55/4;
    }
    
    estimatedDays=Math.abs(weight - desiredWeight)*1100/(desiredCalories*7);
    
    let desiredNutrients = {proteins, fats, carbs}
    
    let estimation = {estimatedDays, estimatedWeight};
    let foodRestriction;
    let healthRecords = {
        height, 
        weight, 
        desiredWeight, 
        desiredCalories,
        desiredNutrients, 
        quizConclusion, 
        foodRestriction, 
        activity
    };
    let result = {quizConclusion, healthRecords, estimation};
    // console.log(result);

    return result;
}

module.exports = {
    quizEvaluator2
};