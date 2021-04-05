const PriorityQueue = require("priorityqueuejs");
const Meal = require("../../models/Meal");
const User = require("../../models/User");

const getMeals = async (userId)=>{
    const user = await User.findById(userId);

    const dcalr=user.healthrecords.desiredCalories;
    const dpr=user.healthrecords.desiredNutrients.proteins;
    const dfr=user.healthrecords.desiredNutrients.fats;
    const dcr=user.healthrecords.desiredNutrients.carbs;

    const bCal = 0.3*dcalr;
    const lCal = 0.4*dcalr;
    const dCal = 0.3*dcalr;

    const bMeals = await Meal.find({mealTime: "breakfast"});
    const lMeals = await Meal.find({mealTime: "lunch"});
    const dMeals = await Meal.find({mealTime: "dinner"});

    // var queue = new PriorityQueue(function(a, b) {
    //   return b.err - a.err;
    // });
    var arr=[];
    bMeals.forEach(b => {
      lMeals.forEach(l => {
        dMeals.forEach(d => {
          const pErr = Math.pow(Math.abs((b.nutriValues.protein + l.nutriValues.protein + d.nutriValues.protein)-dpr),2);
          const fErr = Math.pow(Math.abs((b.nutriValues.fat + l.nutriValues.fat + d.nutriValues.fat)-dfr),2);
          const cErr = Math.pow(Math.abs((b.nutriValues.carb + l.nutriValues.carb + d.nutriValues.carb)-dcr),2);
          const calErr = Math.pow(Math.abs((b.calories + l.calories + d.calories)-dcalr),2);
          const tErr=pErr+fErr+cErr+calErr;
          // console.log(pErr, fErr, cErr, calErr);
          // const mealCombo = {
          //   b: b.id,
          //   l: l.id,
          //   d: d.id,
          //   err: tErr
          // }
          const mealCombo = {
            b: b,
            l: l,
            d: d,
            err: tErr
          }
          // console.log(mealCombo);
          // if(queue.size() <= 11 ){
          //   queue.enq(mealCombo);
          // } else {
          //   // queue.enq(mealCombo);
          // }
          if(arr.length<=10){
            arr.push(mealCombo);
          }
          else{
            var max=0;
            for(var i=0;i<arr.length;i++){
              if(arr[i].err>arr[max].err) max=i;
            }
            arr.splice(max, 1);
          }
        });
      });
    });

    // queue.forEach(meal => {
    //   console.log(meal.err)
    // });


    // for(var i=0; i<queue.size() ;){
    //   console.log(queue.deq().err);
    // }
    arr.sort(function(a, b){return a.err - b.err});
    for(var i=0; i<arr.length ;i++){
      // console.log(arr[i].err);
      console.log(arr[i].b.name, arr[i].l.name, arr[i].d.name);
    }
}

module.exports={
    getMeals: getMeals
}