const brain = require("./ml/brain");
const config = require("config");
const conclusionMap = config.get("Customer.conclusion");


var test = () =>{
    const symptoms=[01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1];
      const symptom = brain(symptoms, "D:/Ninju/Internship/Project-Backend/trained-net.json");
      console.log(symptom);
      const conclusions=[];
      Object.entries(symptom).forEach(([key, value]) => {
        // do something with key and val
        
        if(value>=0.1){

          conclusions.push(conclusionMap[key]);
          // const concl = conclusion.map(item => {
          //   if(Object.key(item) === key){
          //     return item.value;
          //   }
          // })
          // conclusions.push(concl);
        }
      });

      console.log(conclusions);
}

module.exports=test;