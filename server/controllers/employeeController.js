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
        subject: "🎉 Welcome to Lemon Media - Your Employee Portal Credentials",
        body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Lemon Media</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #050505; }

    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; }
      .stack-col { display: block !important; width: 100% !important; padding-right: 0 !important; margin-bottom: 16px !important; }
      .px-mobile { padding-left: 24px !important; padding-right: 24px !important; }
      .name-heading { font-size: 30px !important; }
      .cta-btn { display: block !important; width: 100% !important; box-sizing: border-box; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#050505;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#050505;">
    Your Lemon Media account is ready — welcome aboard, ${firstName}.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" class="email-container" width="640" cellpadding="0" cellspacing="0" style="width:640px; max-width:640px; background-color:#111111; border:1px solid #232323; border-radius:14px; overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px; line-height:4px; font-size:0; background-color:#c9a84c;">&nbsp;</td>
          </tr>

          <!-- Header / Logo strip -->
          <tr>
            <td class="px-mobile" style="padding: 28px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                    🍋 Lemon <span style="color:#c9a84c;">Media</span>
                  </td>
                  <td align="right" style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; color:#7a7a7a; letter-spacing: 2px; text-transform: uppercase;">
                    Onboarding
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cover image -->
          <tr>
            <td style="padding: 24px 0 0 0; line-height:0; font-size:0;">
              <img src="https://images.pexels.com/photos/15566229/pexels-photo-15566229.jpeg" width="640" alt="Lemon Media Team" style="width:100%; max-width:640px; height:auto; display:block;">
            </td>
          </tr>

          <!-- Welcome card -->
          <tr>
            <td class="px-mobile" style="padding: 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616; border:1px solid #2a2418; border-radius:10px; margin-top:-42px; position:relative;">
                <tr>
                  <td style="padding: 30px 32px 26px 32px;">
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; color:#c9a84c; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #2a2418; padding-bottom: 14px;">
                      Welcome to the Team
                    </div>

                    <h1 class="name-heading" style="font-family: Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 700; color: #ffffff; margin: 16px 0 4px 0; line-height: 1.15;">
                      ${firstName} ${lastName || ''}
                    </h1>
                    <div style="font-family: Georgia, serif; font-size: 13px; color:#8a8a8a; font-style: italic; padding-bottom: 16px; border-bottom: 1px solid #232323;">
                      Built by Sisters. Powered by Creativity.
                    </div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 18px;">
                      <tr>
                        <td class="stack-col" width="50%" style="padding-right: 12px; vertical-align:top;">
                          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Role</div>
                          <div style="font-family: Georgia, serif; font-size: 16px; color:#ffffff; font-weight: 600; margin-top:3px;">${position || "Team Member"}</div>
                        </td>
                        <td class="stack-col" width="50%" style="vertical-align:top;">
                          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Department</div>
                          <div style="font-family: Georgia, serif; font-size: 16px; color:#ffffff; font-weight: 600; margin-top:3px;">${department || "Engineering"}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td class="px-mobile" style="padding: 34px 44px 0 44px; font-family: Georgia, serif; font-size: 15px; line-height: 1.8; color:#b9b9b9;">
              We're delighted to welcome you to <strong style="color:#ffffff;">Lemon Media Company</strong> — a studio where <strong style="color:#c9a84c;">creativity meets purpose</strong>. As <strong style="color:#ffffff;">${position || "Team Member"}</strong> in <strong style="color:#ffffff;">${department || "Engineering"}</strong>, you're joining a team that's helped 350+ brands grow through content, performance marketing, and web development — all in-house.
            </td>
          </tr>

          <!-- Pull quote -->
          <tr>
            <td class="px-mobile" style="padding: 28px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1710; border-left: 3px solid #c9a84c; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 20px 26px;">
                    <div style="font-family: Georgia, serif; font-size: 18px; font-style: italic; color:#f0f0f0; line-height:1.5;">
                      "The most rewarding challenges are rarely solved by one team alone."
                    </div>
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#7a7a7a; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;">
                      — Lemon Media Philosophy
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details cards -->
          <tr>
            <td class="px-mobile" style="padding: 26px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="stack-col" width="48%" valign="top" style="background-color:#161616; border:1px solid #262626; border-radius:8px; padding: 18px 22px;">
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Start Date</div>
                    <div style="font-family: Georgia, serif; font-size: 16px; color:#ffffff; font-weight: 600; margin-top:4px;">
                      ${joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Today"}
                    </div>
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top:14px;">Status</div>
                    <div style="font-family: Georgia, serif; font-size: 16px; color:#4caf50; font-weight: 600; margin-top:4px;">● Active</div>
                  </td>
                  <td width="4%" style="font-size:0; line-height:0;">&nbsp;</td>
                  <td class="stack-col" width="48%" valign="top" style="background-color:#1a1710; border:1px solid #2a2418; border-radius:8px; padding: 18px 22px;">
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Reporting To</div>
                    <div style="font-family: Georgia, serif; font-size: 16px; color:#ffffff; font-weight: 600; margin-top:4px;">Hiring Manager</div>
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top:14px;">Location</div>
                    <div style="font-family: Georgia, serif; font-size: 16px; color:#ffffff; font-weight: 600; margin-top:4px;">New Delhi</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Credentials -->
          <tr>
            <td class="px-mobile" style="padding: 30px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #232323; border-bottom:1px solid #232323;">
                <tr>
                  <td style="padding: 22px 0;">
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; margin-bottom: 14px;">Portal Access</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family: Georgia, serif; font-size: 14px;">
                      <tr>
                        <td style="color:#7a7a7a; font-size: 11px; font-family: Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 10px; width: 90px;">Email</td>
                        <td style="color:#ffffff; font-weight: 500; padding-bottom: 10px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="color:#7a7a7a; font-size: 11px; font-family: Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Password</td>
                        <td>
                          <span style="background-color:#232323; padding: 4px 14px; border-radius:4px; font-family: 'Courier New', monospace; font-size: 14px; letter-spacing: 0.5px; color:#c9a84c;">${password}</span>
                          <span style="color:#666666; font-size: 11px; font-family: Helvetica, Arial, sans-serif; margin-left: 8px;">temporary</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td class="px-mobile" style="padding: 22px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616; border:1px solid #262626; border-radius:6px;">
                <tr>
                  <td align="center" style="padding: 14px 20px; font-family: Georgia, serif; font-size: 12px; color:#9a9a9a; line-height:1.6;">
                    <span style="color:#c9a84c; font-weight:700;">◆</span>&nbsp; Please reset your temporary password on first login.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="px-mobile" align="center" style="padding: 34px 44px 0 44px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#c9a84c" style="border-radius:6px;">
                    <a href="${process.env.VITE_BASE_URL || 'http://localhost:5173'}" class="cta-btn" style="display:inline-block; padding: 15px 48px; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color:#0a0a0a; text-decoration:none; border-radius:6px;">
                      Access Employee Portal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td class="px-mobile" style="padding: 34px 44px 36px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #232323;">
                <tr>
                  <td style="padding-top: 22px;">
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#666666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">A Note From Us</div>
                    <div style="font-family: Georgia, serif; font-size: 14px; color:#9a9a9a; line-height: 1.8;">
                      We look forward to the perspective you'll bring. Your journey with Lemon Media begins today.
                    </div>
                    <div style="font-family: Georgia, serif; font-size: 15px; color:#f0f0f0; font-weight: 600; margin-top: 16px;">Yours sincerely,</div>
                    <div style="font-family: Georgia, serif; font-size: 15px; color:#c9a84c; font-weight: 600;">The Lemon Media Team</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0a0a0a; padding: 22px 44px; border-top: 1px solid #1c1c1c;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="stack-col" style="font-family: Georgia, serif; font-size: 15px; font-weight: 600; color:#ffffff;">
                    Lemon Media
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 8px; color:#4d4d4d; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; font-weight:400;">
                      Built by Sisters. Powered by Creativity.
                    </div>
                    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 8px; color:#3a3a3a; margin-top: 8px;">
                      &copy; ${new Date().getFullYear()} All rights reserved.
                    </div>
                  </td>
                  <td align="right" valign="bottom" style="font-family: Helvetica, Arial, sans-serif; font-size: 9px; color:#c9a84c;">
                    hello@lemonmediaco.com
                    <div style="font-size: 8px; color:#3a3a3a; margin-top: 4px;">New Delhi &bull; Mumbai</div>
                  </td>
                </tr>
              </table>
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