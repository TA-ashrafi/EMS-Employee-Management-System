import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../config/nodemailer.js";

// Get employees
// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;

    const where = {
      isDeleted: { $ne: true },
    };

    if (department) {
      where.department = department;
    }

    const employees = await Employee.find(where)
      .sort({ createdAt: -1 })
      .populate("userId", "email role")
      .lean();

    // Filter out records where userId reference no longer exists in Users collection or isDeleted
    const result = employees
      .filter((emp) => emp.userId !== null && emp.userId !== undefined)
      .map((emp) => ({
        ...emp,
        id: emp._id.toString(),
        userId: {
          email: emp.userId.email,
          role: emp.userId.role,
        },
      }));

    return res.json(result);
  } catch (error) {
    console.error("Get employees error:", error);
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
        subject: "🎉 Welcome to Lemon Media Company - Your Employee Portal Credentials",
        body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Lemon Media</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ece8e0; font-family: 'Georgia', 'Times New Roman', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Main Email Container -->
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 660px; margin: 0 auto; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 8px 48px rgba(0,0,0,0.08);">

    <!-- Masthead - Full Company Branding -->
    <tr>
      <td style="padding: 28px 40px 18px 40px; background: #1a1a1a; border-bottom: 4px solid #f5a623;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 33%; vertical-align: middle;">
              <div style="font-size: 8px; color: #f5a623; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 400; font-family: Arial, sans-serif;">
                Est. 2020
              </div>
            </td>
            <td align="center" style="width: 34%;">
              <div style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; font-family: 'Georgia', serif;">
                🍋 <span style="color: #f5a623;">Lemon</span> Media
              </div>
              <div style="font-size: 8px; color: #888888; letter-spacing: 2px; text-transform: uppercase; font-weight: 400; font-family: Arial, sans-serif; margin-top: 2px;">
                Employee Management System
              </div>
            </td>
            <td align="right" style="width: 33%; vertical-align: middle;">
              <div style="font-size: 8px; color: #f5a623; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 400; font-family: Arial, sans-serif;">
                Welcome Edition
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Cover Image - Full Width -->
    <tr>
      <td style="padding: 0; line-height: 0;">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=660&h=380&fit=crop&crop=center"
             alt="Lemon Media Team"
             style="width: 100%; height: auto; display: block;">
      </td>
    </tr>

    <!-- Cover Overlay Text -->
    <tr>
      <td style="padding: 0 40px; margin-top: -40px; position: relative;">
        <div style="background: #ffffff; padding: 28px 32px 20px 32px; margin-top: -30px; border-left: 4px solid #f5a623; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="font-size: 9px; color: #f5a623; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; font-family: Arial, sans-serif;">
            Welcome to the Family
          </div>
          <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin: 6px 0 0 0; letter-spacing: -0.5px; line-height: 1.1; font-family: 'Georgia', serif;">
            ${firstName} ${lastName || ''}
          </h1>
          <div style="font-size: 14px; color: #666666; margin-top: 4px; font-family: 'Georgia', serif; font-style: italic;">
            "Built by Sisters. Powered by Creativity."
          </div>
        </div>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 28px 40px 36px 40px;">

        <!-- Drop Cap Introduction -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 15px; color: #444444; line-height: 1.9; font-family: 'Georgia', serif;">
              <span style="font-size: 52px; font-weight: 700; color: #f5a623; float: left; line-height: 0.75; margin-right: 8px; font-family: 'Georgia', serif;">W</span>e are delighted to welcome you to
              <strong style="color: #1a1a1a;">Lemon Media Company</strong> — a place where
              <strong style="color: #f5a623;">creativity meets purpose</strong>.
              As a <strong style="color: #1a1a1a;">${position || "Team Member"}</strong> in our
              <strong style="color: #1a1a1a;">${department || "Engineering"}</strong> team,
              you are now part of a story that began in 2020 with a simple mission:
              to help brands grow with in-house content, performance marketing,
              and web development — all under one roof.
            </td>
          </tr>
        </table>

        <!-- Pull Quote -->
        <div style="margin: 28px 0; padding: 22px 30px; background: #faf8f5; border-left: 4px solid #f5a623; border-radius: 0 8px 8px 0;">
          <p style="font-size: 22px; font-weight: 400; color: #1a1a1a; margin: 0; line-height: 1.5; font-family: 'Georgia', serif; font-style: italic;">
            "We believe the most rewarding challenges are rarely solved by one team alone."
          </p>
          <p style="font-size: 12px; color: #999999; margin: 8px 0 0 0; font-family: Arial, sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">
            — The Lemon Media Philosophy
          </p>
        </div>

        <!-- Two Column Employee Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr>
            <td style="width: 48%; padding: 20px 22px; background: #faf8f5; border-radius: 8px; border: 1px solid #f0ebe3; vertical-align: top;">
              <div style="font-size: 8px; color: #f5a623; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; font-family: Arial, sans-serif; margin-bottom: 8px;">
                Role
              </div>
              <div style="font-size: 19px; color: #1a1a1a; font-weight: 600; font-family: 'Georgia', serif;">
                ${position || "Team Member"}
              </div>
              <div style="font-size: 8px; color: #f5a623; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; font-family: Arial, sans-serif; margin: 14px 0 8px 0;">
                Department
              </div>
              <div style="font-size: 19px; color: #1a1a1a; font-weight: 600; font-family: 'Georgia', serif;">
                ${department || "Engineering"}
              </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; padding: 20px 22px; background: #faf8f5; border-radius: 8px; border: 1px solid #f0ebe3; vertical-align: top;">
              <div style="font-size: 8px; color: #f5a623; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; font-family: Arial, sans-serif; margin-bottom: 8px;">
                Start Date
              </div>
              <div style="font-size: 19px; color: #1a1a1a; font-weight: 600; font-family: 'Georgia', serif;">
                ${joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Today"}
              </div>
              <div style="font-size: 8px; color: #f5a623; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; font-family: Arial, sans-serif; margin: 14px 0 8px 0;">
                Status
              </div>
              <div style="font-size: 19px; color: #2e7d32; font-weight: 600; font-family: 'Georgia', serif;">
                ● Active
              </div>
            </td>
          </tr>
        </table>

        <!-- Credentials Section -->
        <div style="margin: 28px 0; border-top: 2px solid #f0ebe3; border-bottom: 2px solid #f0ebe3; padding: 20px 0;">
          <div style="font-size: 9px; color: #f5a623; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; font-family: Arial, sans-serif; margin-bottom: 14px;">
            Portal Access
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; font-family: 'Georgia', serif;">
            <tr>
              <td style="color: #888888; width: 100px; padding-bottom: 8px; font-size: 12px; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
              <td style="color: #1a1a1a; font-weight: 600; padding-bottom: 8px;">${email}</td>
            </tr>
            <tr>
              <td style="color: #888888; width: 100px; font-size: 12px; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Password</td>
              <td style="color: #1a1a1a; font-weight: 600;">
                <span style="background: #f0ebe3; padding: 4px 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 0.5px;">${password}</span>
                <span style="color: #999999; font-size: 12px; font-weight: 400; margin-left: 10px; font-family: Arial, sans-serif;">temporary</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Security Notice -->
        <div style="background: #f8f5f0; padding: 14px 20px; border-radius: 6px; margin-bottom: 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 30px; vertical-align: middle; font-size: 18px; color: #f5a623;">⬤</td>
              <td style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'Georgia', serif;">
                <strong style="color: #1a1a1a;">Security Notice:</strong> For your account safety, please reset your temporary password upon first login.
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 4px;">
          <tr>
            <td align="center">
              <a href="${process.env.VITE_BASE_URL || 'http://localhost:5173'}" style="display: inline-block; background: #1a1a1a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 16px 56px; border-radius: 0; text-decoration: none; text-align: center; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; border: 2px solid #1a1a1a; transition: all 0.3s ease;">
                Access Employee Portal
              </a>
            </td>
          </tr>
        </table>

        <!-- Closing Section -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #f0ebe3;">
          <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, sans-serif; margin-bottom: 10px;">
            Editor's Note
          </div>
          <p style="font-size: 14px; color: #444444; line-height: 1.8; margin: 0; font-family: 'Georgia', serif;">
            We look forward to your contributions and the fresh perspective you will bring to our team.
            Your journey with Lemon Media starts today.
          </p>
          <p style="font-size: 16px; color: #1a1a1a; font-weight: 600; margin: 14px 0 0 0; font-family: 'Georgia', serif;">
            Warm regards,
          </p>
          <p style="font-size: 16px; color: #f5a623; font-weight: 600; margin: 2px 0 0 0; font-family: 'Georgia', serif;">
            The Lemon Media Team
          </p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 40px 28px 40px; background: #1a1a1a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 50%;">
              <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; font-family: 'Georgia', serif;">
                🍋 Lemon Media
              </div>
              <div style="font-size: 9px; color: #888888; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif; margin-top: 4px;">
                Built by Sisters. Powered by Creativity.
              </div>
              <div style="font-size: 9px; color: #666666; font-family: Arial, sans-serif; margin-top: 8px;">
                &copy; ${new Date().getFullYear()} All Rights Reserved
              </div>
            </td>
            <td align="right" style="width: 50%; vertical-align: bottom;">
              <div style="font-size: 10px; color: #f5a623; font-family: Arial, sans-serif; letter-spacing: 1px; text-transform: uppercase;">
                hello@lemonmediaco.com
              </div>
              <div style="font-size: 8px; color: #555555; font-family: Arial, sans-serif; margin-top: 4px; letter-spacing: 0.5px;">
                New Delhi • Mumbai
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>

</body>
</html>`,
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