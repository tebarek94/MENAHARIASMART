import jwt from "jsonwebtoken";
import { findUserById } from "../models/user.model.js";

// Verify JWT and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await findUserById(decoded.id);
    if (users.length === 0)
      return res.status(401).json({ message: "User not found" });

    req.user = users[0]; // attach user info to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};
