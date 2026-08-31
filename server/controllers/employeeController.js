import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../config/nodemailer.js";

// Get employees
// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;

    const where = {};

    if (department) {
      where.department = department;
    }

    const employees = await Employee.find(where)
      .sort({ createdAt: -1 })
      .populate("userId", "email role")
      .lean();

    const result = employees.map((emp) => ({
      ...emp,
      id: emp._id.toString(),
      userId: emp.userId
        ? {
          email: emp.userId.email,
          role: emp.userId.role,
        }
        : null,
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to Fetch Employees",
    });
  }
};


// create employee
// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      joinDate,
      password,
      role,
      employmentStatus,
      bio
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
    })

    const employee = await Employee.create({
      userId: user._id,
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      joinDate: new Date(joinDate),
      bio: bio || "",
    });

    // Dispatch welcome email with credentials asynchronously
    try {
      await sendEmail({
        to: email,
        subject: "🎉 Welcome to Lemon Media Company EMS - Your Login Credentials",
        body: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #facc15; padding: 12px 24px; border-radius: 9999px; font-weight: 900; color: #020617; font-size: 20px;">
                🍋 Lemon Media Company
              </div>
            </div>
            
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #cbd5e1;">
              <h2 style="color: #0f172a; margin-top: 0;">Welcome aboard, ${firstName}! 👋</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                We are thrilled to welcome you to <strong>Lemon Media Company</strong> as a <strong>${position || "Team Member"}</strong> in the <strong>${department || "Engineering"}</strong> department.
              </p>
              
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #713f12; font-size: 16px;">🔑 Your Account Credentials</h3>
                <p style="margin: 4px 0; color: #854d0e; font-size: 14px;"><strong>Portal Email:</strong> ${email}</p>
                <p style="margin: 4px 0; color: #854d0e; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #020617;">${password}</code></p>
              </div>

              <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                🔒 <strong>Important:</strong> For security reasons, please log in to your EMS portal and immediately change your temporary password under <strong>Settings & Profile</strong>.
              </p>

              <div style="text-align: center; margin-top: 28px;">
                <a href="${process.env.VITE_BASE_URL || 'http://localhost:5173'}" style="background-color: #facc15; color: #020617; font-weight: bold; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-size: 15px; display: inline-block;">
                  Sign In to EMS Portal →
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Lemon Media Company. All rights reserved.
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Welcome email dispatch failed:", emailErr);
    }

    return res.status(201).json({ success: true, employee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Create employee error:", error);
    return res.status(500).json({ error: "Failed to create employee" });
  }
};


// Update employee
// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      joinDate,
      password,
      role,
      employmentStatus,
      bio
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }


    await Employee.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      employmentStatus: employmentStatus || "ACTIVE",
      bio: bio || "",
    });

    // UPDATE USERR RECORD
    // Update user record
    const userUpdate = { email };
    if (role) userUpdate.role = role;
    if (password) userUpdate.password = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(employee.userId, userUpdate);

    return res.json({ success: true });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to Update employee" });
  }
}

// Delete employee
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    employee.isDeleted = true;
    employee.employmentStatus = "INACTIVE";
    await employee.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to Delete employee" });
  }
}