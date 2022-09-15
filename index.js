const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("./config/database");
const UserModel = require("./models/user.model");
const ExcersiseModel = require("./models/excersise.model");
require("dotenv").config();

connect();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  const user = await (await new UserModel({ username }).save()).toJSON();
  delete user.__v;
  res.json(user);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const user = await UserModel.findById(_id);
  if (!user) {
    return res.status(404).send("User not found");
  }
  const excersiseToSave = {
    ...req.body,
    username: user.username,
    date: req.body.date ? new Date(req.body.date) : new Date(),
  };
  const excersise = await (
    await new ExcersiseModel(excersiseToSave).save()
  ).toJSON();
  delete excersise.__v;
  user.log.push(excersise);
  await user.save();
  return res.json({
    ...excersise,
    _id: user._id,
    date: new Date(excersise.date).toDateString(),
  });
});

app.get("/api/users", async (req, res) => {
  const users = await UserModel.find();
  return res.json(users);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { limit, from, to } = req.query;
  let match;
  if (from && to) {
    match = { date: { $gt: new Date(from), $lt: new Date(to) } };
  }
  const user = await UserModel.findById(req.params._id, "-__v").populate({
    path: "log",
    select: "-__v",
    options: { limit },
    match,
  });
  return res.json({
    _id: user.toJSON()._id,
    username: user.toJSON().username,
    count: user.log.length,
    log: user.toJSON().log.map((log) => {
      delete log._id;
      delete log.username;
      return { ...log, date: new Date(log.date).toDateString() };
    }),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
