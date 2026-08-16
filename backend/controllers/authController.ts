import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { ENV } from "../config/env.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    res.status(500).json({ error: msg });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(400).json({ error: "User already exists with this email" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: cleanEmail,
      password_hash,
      full_name: full_name || cleanEmail.split("@")[0],
      role: role === "admin" ? "admin" : "staff",
    });

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    res.status(500).json({ error: msg });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(401).json({ valid: false, user: null });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, user: null });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: req.user });
}
