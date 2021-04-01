const {evaluateQuizResult} = require("./ml/brain");
const config = require("config");
const conclusionMap = config.get("Customer.conclusion");


var test = () =>{
    const symptoms=[01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1];
      const conclusions = evaluateQuizResult(symptoms);
      console.log(conclusions);
}

module.exports=test;