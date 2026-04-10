const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register
// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📩 Register request:", { name, email, password }); // 👈 ye add kar

    // check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ name, email, password });
    console.log("✅ User created:", user);

    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(400).json({ message: err.message });
  }
};


// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
