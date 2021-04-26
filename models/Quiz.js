const mongoose = require("mongoose");

//Don't forget to change schema in swagger/models.yaml
const QuizSchema = new mongoose.Schema({
  sectionNumber: { type: Number },
  sectionName: { type: String },
  questions: [
    {
      question: {
        type: String,
      },
      type: {type: String},
      options: [{
        option:{type: String},
        selected:{type: Boolean}
      }],
    },
  ],
});

module.exports = mongoose.model("quiz", QuizSchema, "quizes");
