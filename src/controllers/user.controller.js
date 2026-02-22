import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByPhone,
  createUser,
  findUserById,
  updateUserProfile,
  updateUserPassword,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../models/user.model.js";

// ======================
// LOGIN
// ======================
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const users = await findUserByPhone(phone);
    if (users.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.user_id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// REGISTER
// ======================
export const register = async (req, res) => {
  try {
    const { full_name, phone, email, password, role_id } = req.body;

    // check if user exists
    const existingUsers = await findUserByPhone(phone);
    if (existingUsers.length > 0)
      return res.status(400).json({ message: "Phone already registered" });

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    // default role: Passenger if not provided
    const userRole = role_id || 3;

    const user_id = await createUser(
      full_name,
      phone,
      email,
      password_hash,
      userRole,
      "ACTIVE",
    );

    res.status(201).json({ message: "User registered successfully", user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// GET USER BY ID
// ======================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await findUserById(id);
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// UPDATE USER PROFILE
// ======================
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;
    await updateUserProfile(id, full_name, email);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// UPDATE PASSWORD
// ======================
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    await updateUserPassword(id, password_hash);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// UPDATE ROLE / STATUS (Admin)
// ======================
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;
    await updateUserRole(id, role_id);
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateUserStatus(id, status);
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// DELETE USER
// ======================
export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
