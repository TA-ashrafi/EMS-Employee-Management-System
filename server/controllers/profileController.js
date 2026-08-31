import Employee from "../models/Employee.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const session = req.session;
    let employee = await Employee.findOne({ userId: session.userId });

    if (!employee && session.role === "ADMIN") {
      return res.json({
        firstName: "ADMIN",
        lastName: "USER",
        email: session.email,
        position: "Administrator",
        department: "Operations",
        bio: "",
      });
    }

    if (!employee) {
      return res.status(404).json({ error: "Employee profile not found" });
    }

    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Update profile
// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const session = req.session;
    let employee = await Employee.findOne({ userId: session.userId });

    if (!employee && session.role === "ADMIN") {
      employee = await Employee.create({
        userId: session.userId,
        firstName: "ADMIN",
        lastName: "USER",
        email: session.email || "admin@system.com",
        phone: "0000000000",
        position: "Administrator",
        department: "Operations",
        joinDate: new Date(),
        bio: req.body.bio || "",
      });
      return res.json({ success: true, message: "Profile updated successfully" });
    }

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
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
    return res.status(500).json({ error: "Failed to update Profile" });
  }
};
