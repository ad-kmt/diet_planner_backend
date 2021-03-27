var calorieCalculator = (input) => {
    const {gender, age, weight, height, activity, weightChange} = input;

      let bmr = 10*weight + 6.25*height - 5*age;
      if(gender === 1) bmr+=5;
      else bmr-=161;
      
      let tdee;

      if(activity === 1 ) tdee=1.2*bmr;
      else if(activity === 2 ) tdee=1.375*bmr;
      else if(activity === 3 ) tdee=1.55*bmr;
      else if(activity === 4 ) tdee=1.725*bmr;
      else if(activity === 5 ) tdee=1.9*bmr;

      let calorie;

      if(weightChange===1) calorie=tdee+250;
      else if(weightChange===-1) calorie=tdee-500;
      else if(weightChange===0) calorie=tdee;

      return calorie;
}

module.exports = {
    calorieCalculator: calorieCalculator
};