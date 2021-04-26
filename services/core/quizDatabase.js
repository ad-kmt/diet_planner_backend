const readXlsxFile = require("read-excel-file/node");
const config = require("config");
const _ = require("lodash");
const Quiz = require("../../models/Quiz");


var populateQuizDb = async () => {
  await readXlsxFile("data/quiz-data.xlsx", {sheet: "Quiz"}).then(async (rows) => {

    Quiz.collection.drop();
    console.log("Collection quizes removed successfully");
    // `rows` is an array of rows
    // each row being an array of cells.
    const column = rows[0];
    var sectionNumber = rows[1][0];
    var questionNumber = rows[1][2];
    var newSection = new Quiz();
    var newQuestion = {
        options: [],
    };
    for (let i = 1; i < rows.length; i++) {
        if(rows[i][0] === ""){
            break;
        }
        if (rows[i][0] != sectionNumber) {
            
            newSection.questions.push(newQuestion);
            
            sectionNumber=rows[i][0];
            questionNumber=rows[i][2];
            
            await newSection.save();
            // console.log(newSection.toObject());
            newSection = new Quiz();
            newQuestion = {
                options: [],
            };
        } else if (rows[i][2] != questionNumber) {
            newSection.questions.push(newQuestion);
            newQuestion = {
                options: [],
            };
            questionNumber = rows[i][2];
        }
        
        for (let j = 0; j < rows[i].length; j++) {
            if(rows[i][j] == null || rows[i][j] === ""){
                continue;
            }
            if(column[j]=="Section number"){
                newSection.sectionNumber=rows[i][j];
            } else if(column[j]=="Section name"){
                newSection.sectionName=rows[i][j];
            } else if(column[j]=="Question"){
                newQuestion.question=rows[i][j];
            } else if(column[j]=="Type"){
                newQuestion.type=rows[i][j];
            } else if(column[j]=="Options"){
                newQuestion.options.push(rows[i][j]);
            }
            // console.log(newSection);
        }
        
    }
  });
};

module.exports = {
  populateQuizDb,
};
