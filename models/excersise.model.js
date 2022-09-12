const { default: mongoose, model } = require("mongoose");

const excersiseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});

const ExcersiseModel = model('Excersise', excersiseSchema)

module.exports = ExcersiseModel
