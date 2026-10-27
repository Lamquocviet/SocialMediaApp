import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import { ENV } from "../config/env.js";

const ACCESS_TOKEN_TTL = ENV.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_TTL =
  Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const getPasswordHash = (user) => user?.hashedPassword || user?.password || "";

export const signUp = async (req, res) => {
  try {
    const { username, password, email, displayName } = req.body;

    if (!username || !password || !email || !displayName) {
      return res.status(400).json({
        message: "Username, password, email, and displayName are required",
      });
    }

    const duplicateUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (duplicateUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      email,
      displayName,
      profilePicture: "",
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signUp", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const storedHash = getPasswordHash(user);
    const passwordCorrect = storedHash
      ? await bcrypt.compare(password, storedHash)
      : false;

    if (!passwordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `Welcome ${user.displayName}`,
      accessToken,
      user,
    });
  } catch (error) {
    console.error("Error in signIn", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }

    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Error in signOut", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Refresh token is invalid or expired" });
    }

    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Refresh token has expired" });
    }

    const accessToken = jwt.sign({ userId: session.userId }, ENV.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error in refreshToken", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
