const { default: mongoose, model } = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  log: [{type: mongoose.Types.ObjectId, ref:'Excersise'}]
});

const UserModel = model("User", userSchema);

module.exports = UserModel;
