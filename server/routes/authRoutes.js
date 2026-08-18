const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ message: "Email i lozinka su obavezni." });
  try {
    const user = await User.findOne({ email });
    const valid = user && await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Pogresan email ili lozinka." });
    return res.json({ token: jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1d" }) });
  } catch (error) {
    console.error("Greska pri prijavi:", error);
    return res.status(500).json({ message: "Greska na serveru." });
  }
});

module.exports = router;
