var brain = require("brain.js");
var fs = require("fs");
const config = require("config");
//Map that converts abbreviated form of conclusion to full form
const conclusionMap = config.get("Customer.conclusion");
//ML classification model in json format
const quizModelJson= require("./../../data/trained-net.json");

var evaluateQuizResult = function(input){

  //Neural Network Model
  const net = new brain.NeuralNetwork()
  //Initializing with JSON file
  net.fromJSON(quizModelJson)
  //Result
  const symptom = net.run(input)
  
  // console.debug(symptom)
    const conclusions=[];
    Object.entries(symptom).forEach(([key, value]) => {

      //Taking all conclusions with Probability > 0.1
      if(value>=0.1){
        conclusions.push(conclusionMap[key]);
      }
    });

    return conclusions;
}


var trainModel = function(){
  var net = new brain.NeuralNetwork();
  net.train([
    { input: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"PDC": 1} },
    { input: [0,0,0,0,0,0,1,1,0,0,1,1,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"IP": 1} },
    { input: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"IGF": 1} },
    { input: [0,0,1,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0], output: {"LSA": 1} },
    { input: [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"IG": 1} },
    { input: [0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"BI": 1} },
    { input: [0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], output: {"GI": 1} },
    { input: [1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], output: {"SIBO": 1} },
    { input: [0,1,1,0,0,0,1,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0], output: {"MA": 1} },
    { input: [0,1,1,0,0,0,1,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0], output: {"NoP": 1} },
  ]);
  
  // const output = net.run(input);

  // get json data
  // const json = net.toJSON()
  // write to file system
  fs.writeFileSync('trained-net.json', JSON.stringify(json));
  
  // return output;
};

module.exports = {
  evaluateQuizResult: evaluateQuizResult,
  trainModel: trainModel
};



//01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1