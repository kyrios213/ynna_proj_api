const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
dotenv.config();

// Mongoose
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true }, () => {
  console.log("Connected To MongoDB");
});

// MiddleWare
app.use(express.json());
app.use(morgan("common"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");

app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`App running at: http://localhost:${PORT}`);
});
