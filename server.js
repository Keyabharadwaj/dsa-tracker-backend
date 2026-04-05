const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo Error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const User = mongoose.model("User", {
  email: String,
  password: String,
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Register failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ error: "Missing fields" });
    }

    const user = await User.findOne({ email });
    console.log("USER:", user);

    if (!user) {
      return res.json({ error: "User not found" });
    }

    console.log("Entered password:", password);
    console.log("Stored password:", user.password);

    const valid = await bcrypt.compare(password, user.password);
    console.log("Password match:", valid);

    if (!valid) {
      return res.json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "d6ebddf5fb3a1e3cd40d66acf6c9a2eec5e47f69f535f9d3ac710cee7bcc72c5"
    );

    console.log("TOKEN GENERATED");

    res.json({ token });

  } catch (err) {
    console.log("FULL ERROR:", err); // 👈 THIS IS KEY
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));