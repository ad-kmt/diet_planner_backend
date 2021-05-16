var brain = require("brain.js");
const config = require("config");
var fs = require('fs'); 
const readXlsxFile = require("read-excel-file/node");
//Map that converts abbreviated form of conclusion to full form
const conclusionMap = config.get("Customer.conclusion");
//ML classification model in json format
const quizModelJson= require("./../../data/quiz-evaluation-ml-model.json");

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
        conclusions.push(key);
      }
    });

    return conclusions;
}

var trainModelOld = function(){
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
  
  // write trained model as a json in file system
  fs.writeFileSync('data/trained-net.json', JSON.stringify(net.toJSON()));
  
  // return output;
};

var getTrainingDataSetFromExcel = async function(){
  var rows = await readXlsxFile("data/quiz-data.xlsx", {sheet: "Training"});
    // `rows` is an array of rows
    // each row being an array of cells.
  let columnNames = [];
  var trainingData = [];
  var limits=[];
  var weight=[]
  /**
   * col1: Ques. no.
   * col2: Symptoms
   * col3-end: Conclusions 
   */

  /**
   * training data format
   * {
   *  input: [...values]
   *  output: {"ResultCategory": "1"}
   * }
   */
  for(let i=2;i<rows.length;i++){
    weight.push(rows[i][2]);
  }
  for (let j = 3; j < rows[0].length; j++) {
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
  let trainingDataSet = {trainingData, columnNames, limits, weight};
  // console.log(trainingDataSet);
  return trainingDataSet;
}

var trainModelAndSave = function(trainingDataSet){
    //Training Neural Network Model
    var net = new brain.NeuralNetwork();
    net.train(trainingDataSet);

    // write trained model as a json in file system
    fs.writeFileSync('data/quiz-evaluation-ml-model.json', JSON.stringify(net.toJSON()));
}

var trainModelFromExcel = async function(){
  var trainingDataSet = await getTrainingDataSetFromExcel();
  // console.log(trainingDataSet);
  trainModelAndSave(trainingDataSet);
};

module.exports = {
  evaluateQuizResult,
  trainModelFromExcel,
  getTrainingDataSetFromExcel
};



//01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1