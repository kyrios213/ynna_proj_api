const router = require("express").Router();
const checkToken = require("../middleware/checkToken");
const User = require("../models/User");
const Room = require("../models/Room");

router.post("/create-room", checkToken, async (req, res) => {
  const user = await User.findById(req.userId);

  try {
    if (user.room) {
      return res.status(403).json({ error: "User Already Joined a Room" });
    }
    const room = await new Room({
      host: user.username,
      users: [user.id],
    });
    await room.save();
    await user.updateOne({ room: room.id });
    return res.status(201).json({ roomId: room.id, host: room.host });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.get("/get-room/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const room = await Room.findById(id);
    res.status(200).json(room);
  } catch (err) {
    return res.status(404).json({ error: "Room doesn't exist" });
  }
});

router.post("/join-room/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  try {
    const room = await Room.findById(id);
    const user = await User.findById(req.userId);
    if (!room && user.room == id) {
      await user.updateOne({ room: "" });
    }
    if (user.room) {
      return res.status(403).json({ error: "User Already Joined a Room" });
    }
    await room.updateOne({ $push: { users: req.userId } });
    await user.updateOne({ room: room.id });
    return res.status(200).json({ message: "User successfully joined room" });
  } catch (err) {
    return res.status(404).json({ error: "No room found" });
  }
});

router.post("/leave-room/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const room = await Room.findById(id);
    const user = await User.findById(req.userId);
    if (!room && user.room == id) {
      await user.updateOne({ room: "" });
      return res.status(200).json({ error: "User has left the room" });
    }
    if (room.host === user.username) {
      await room.deleteOne();
      await user.updateOne({ room: "" });
      return res.status(200).json({ error: "Room has been deleted " });
    } else {
      await user.updateOne({ room: "" });
      await room.updateOne({ $pull: { users: user.id } });
      return res.status(200).json({ error: "User has left the room" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

router.patch("/giftTo/:id", checkToken, async (req, res) => {
  if (req.userId == req.params.id) {
    return res.status(403).json({ error: "Try Again" });
  }
  try {
    const gifter = await User.findById(req.userId);
    const gifted = await User.findById(req.params.id);

    const foundGifted = await User.findOne({ drawnUser: gifted.username });
    if (!foundGifted) {
      await gifter.updateOne({ drawnUser: gifted.username });
      return res
        .status(200)
        .json({ message: "Success", user: gifted.username });
    } else {
      return res
        .status(403)
        .json({ error: "User already has a gifter, Try again" });
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

module.exports = router;
