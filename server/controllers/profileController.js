import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const session = req.session;
    let employee = await Employee.findOne({ userId: session.userId });

    if (!employee) {
      const user = await User.findById(session.userId);
      return res.json({
        firstName: session.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        lastName: "USER",
        email: user?.email || session.email,
        position: session.role === "ADMIN" ? "Administrator" : "Staff Member",
        department: "Engineering",
        bio: "",
      });
    }

    return res.json(employee);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update profile
// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const session = req.session;
    let employee = await Employee.findOne({ userId: session.userId });

    if (!employee) {
      const user = await User.findById(session.userId);
      const email = user?.email || session.email || "user@system.com";
      employee = await Employee.create({
        userId: session.userId,
        firstName: session.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        lastName: "USER",
        email: email,
        phone: "0000000000",
        position: session.role === "ADMIN" ? "Administrator" : "Staff Member",
        department: "Engineering",
        joinDate: new Date(),
        bio: req.body.bio || "",
      });
      return res.json({ success: true, message: "Profile updated successfully" });
    }

    if (employee.isDeleted) {
      return res.status(400).json({
        error: "Your Account is deactivated. You cannot update your profile.",
      });
    }

    await Employee.findByIdAndUpdate(employee._id, {
      bio: req.body.bio,
    });

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update Profile: " + (error.message || "") });
  }
};
