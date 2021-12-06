const router = require("express").Router();
const argon2 = require("argon2");
const JWT = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Room = require("../models/Room");
const chechToken = require("../middleware/checkToken");

router.post(
  "/signup",
  [
    check("username", "Username must be atleast 5 characters").isLength({
      min: 5,
    }),
    check("password", "Password must be atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { username, password } = req.body;
    const errors = validationResult(req);

    try {
      if (errors.isEmpty()) {
        let user = await User.findOne({ username: username });
        if (!user) {
          const hashedPassword = await argon2.hash(password);
          const newUser = await new User({
            username: username,
            password: hashedPassword,
          });
          const user = await newUser.save();
          return res.status(201).json({ message: "New User Created" });
        }
        return res.status(400).json({ error: "User already exists" });
      }
      return res.status(400).json({ error: errors.errors });
    } catch (err) {
      res.status(400).json({ errors: err });
    }
  }
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword)
        return res.status(403).json({ error: "Invalid Username or Password" });
      if (user.room) {
        const room = await Room.findById(user.room);
        if (!room) {
          await user.updateOne({ room: "" });
        }
      }
      const token = await JWT.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: 10000000000,
        }
      );
      return res.status(200).json({ token });
    } else {
      return res.status(404).json({ error: "Invalid Username or Password" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

router.get("/user", chechToken, async (req, res) => {
  const user = await User.findById(req.userId);
  return res.status(200).json(user);
});

router.get("/get-user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  return res.status(200).json(user.username);
});
module.exports = router;
