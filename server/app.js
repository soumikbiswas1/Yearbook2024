const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/Student");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
require("dotenv").config();

app.use(cors({ credentials: true, origin: process.env.FRONTEND }));

const PORT = process.env.PORT | 5000;

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("*", function (req, res) {
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const port = process.env.PORT || PORT;

  const fullUrl = `${protocol}://${host}:${port}${url}`;

  const responseString = `Full URL is: ${fullUrl}`;
  res.send(responseString);
});

//form upload
app.post("/submit", async function (req, res) {
  console.log("The value is:", req.body);

  try {
    const student = await Student.create(req.body);

    console.log(student);

    res.status(200);
    res.json({ success: "The student has been added to the database" });
  } catch (err) {
    console.log(err.message);

    if (err.message.includes("duplicate key")) {
      return res.json({
        error: `The entry corresponding to roll number ${req.body.rollNumber} has already been entered.`,
      });
    }
    res.json({
      error: "Request Timed out! Please check your internet connection.",
    });
  }
});

app.post("/check/:rollNumber", async function (req, res) {
  console.log("The value is:", req.params.rollNumber);

  try {
    const student = await Student.findOne({
      rollNumber: req.params.rollNumber,
    });

    console.log(student);

    let result = {};

    if (student) {
      result = {
        error: `The entry corresponding to roll number ${req.params.rollNumber} has already been entered.`,
      };
    } else result = { success: "The entry is not present." };

    res.json(result);
  } catch (err) {
    console.log(err.message);
    res.json({
      error: "Request Timed out!Please contact the club if the issue persists",
    });
  }
});

//connect to node
app.listen(PORT, function (err) {
  if (err) throw err;
  else {
    console.log(`Server is running on : ${PORT};`);
  }
});
