const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  users: {
    type: Array,
  },
  host: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Room", RoomSchema);
