const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new Schema({
  name: String,
  department: String,
  rollNumber: {
    type: String,
    unique: true,
  },
  email: String,
  phone: String,
  image: {
    type: String,
    unique: true,
  },
  clubs: [String],
  wing: String,
  quote: String,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);
