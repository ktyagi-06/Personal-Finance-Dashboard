import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req,res) => {
  try {
    console.log(req.body);

    const { firstName,lastName,email,password } = req.body;

    const hashed = await bcrypt.hash(password,10);

    await User.create({
      firstName,lastName,email,password:hashed
    });

    res.json({ message:"User created" });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log("FOUND USER:", !!user);

  if (!user) return res.status(400).json({ msg: "No user" });

  const match = await bcrypt.compare(password, user.password);
  console.log("PASSWORD MATCH:", match);

  if (!match) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token });
});

export default router;