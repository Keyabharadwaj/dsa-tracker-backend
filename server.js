const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*"
}));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ User schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// ✅ Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashed });
  await user.save();

  res.json({ message: "User registered" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", email, password); // DEBUG

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("Wrong password");
      return res.json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret"
    );

    res.json({ token });

  } catch (err) {
    console.log("Login Error:", err); // 👈 THIS WILL SHOW REAL ERROR
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));