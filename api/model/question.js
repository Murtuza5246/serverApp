const mongoose = require("mongoose");

const questionsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  uploadedByName: { type: String, required: true },
  uploadedByEmail: { type: String, required: true },
  question: { type: String, required: true },
  comments: { type: Array },
  profileImage: { type: String },
  time: { type: String },
  date: { type: String },
  authType: { type: String, required: true },
  userId: { type: String },
});

const Question = mongoose.model("Question", questionsSchema);
module.exports = Question;
