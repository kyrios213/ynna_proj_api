const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    min: 5,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  drawnUser: {
    type: String,
  },
  room: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
