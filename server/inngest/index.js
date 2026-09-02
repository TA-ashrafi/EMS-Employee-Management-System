import sendEmail from "../config/nodemailer.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import User from "../models/User.js";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "fullstack-ems" });

// Auto Check-out for employees
const autoCheckOut = inngest.createFunction(
    {
        id: "auto-check-out",
        triggers: [{ event: "employee/check-out" }]
    },
    async ({ event, step }) => {
        const { employeeId, attendanceId } = event.data;

        // Wait for 9 hours
        await step.sleepUntil("wait-for-the-9-hours", new Date(new Date().getTime() + 9 * 60 * 60 * 1000));

        // Get Attendance data
        let attendance = await Attendance.findById(attendanceId);

        if (!attendance?.checkOut) {
            // Get Employee data
            const employee = await Employee.findById(employeeId);

            // Send reminder email
            console.log(` Sending reminder email to ${employee?.email || employeeId}`);
            await sendEmail({
                to: employee.email,
                subject: "Check-in Notification - Lemon Media",
                body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">

    <!-- Spacer -->
    <tr><td style="height: 40px;"></td></tr>

    <!-- Logo -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
          Lemon Media
        </div>
        <div style="font-size: 10px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; font-weight: 400;">
          Employee Management
        </div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="width: 32px; height: 2px; background: #c9a84c;"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 32px 36px 32px;">

        <h2 style="font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0 0 16px 0; letter-spacing: -0.2px;">
          Hi ${employee.firstName},
        </h2>

        <p style="font-size: 15px; color: #555555; line-height: 1.7; margin: 0 0 8px 0;">
          You have a check-in in <strong style="color: #1a1a1a;">${employee.department}</strong> today:
        </p>

        <!-- Time -->
        <div style="margin: 20px 0 20px 0; padding: 16px 20px; background: #f8f8f8; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.3px;">
            ${new Date(attendance.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
          <div style="font-size: 13px; color: #888888; margin-top: 4px;">
            ${new Date(attendance.checkIn).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <!-- Reminder -->
        <div style="background: #fafaf8; border-left: 3px solid #c9a84c; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0 20px 0;">
          <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">
            Please make sure to <strong style="color: #1a1a1a;">check-out in one hour</strong>.
          </p>
        </div>

        <p style="font-size: 14px; color: #777777; line-height: 1.7; margin: 16px 0 0 0;">
          If you have any questions, please contact your admin.
        </p>

        <!-- Closing -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
          <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px 24px 32px; background: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; color: #aaaaaa;">Lemon Media Company</td>
            <td align="right" style="font-size: 11px; color: #aaaaaa;">${new Date().getFullYear()}</td>
          </tr>
        </table>
      </td>
    </tr>

  </table>

</body>
</html>`
            });



            // Wait for 1 more hour (total 10 hours)
            await step.sleepUntil("wait-for-the-1-hour", new Date(new Date().getTime() + 1 * 60 * 60 * 1000));

            // Get fresh attendance data
            attendance = await Attendance.findById(attendanceId);

            if (!attendance?.checkOut) {
                // Fix: Create proper Date object
                const checkInTime = new Date(attendance.checkIn).getTime();
                const autoCheckOutTime = new Date(checkInTime + 4 * 60 * 60 * 1000);

                attendance.checkOut = autoCheckOutTime;
                attendance.workingHours = 4;
                attendance.dayType = "Half Day";
                attendance.status = "LATE";

                await attendance.save();
                console.log(`Auto check-out completed with LATE status for employee ${employeeId}`);
            }
        }

        return { success: true, message: "Auto check-out completed" };
    }
);

// Send Email to admin, If admin doesn't take action on leave application within 24 hours
const leaveApplicationReminder = inngest.createFunction(
    {
        id: "leave-application-reminder",
        triggers: [{ event: "leave/pending" }]
    },
    async ({ event, step }) => {
        const { leaveApplicationId } = event.data;

        // wait for 24 hours
        await step.sleepUntil("wait-for-the-24-hours", new Date(new Date().getTime() + 24 * 60 * 60 * 1000));

        const leaveApplication = await LeaveApplication.findById(leaveApplicationId);

        if (leaveApplication?.status === "PENDING") {
            const employee = await Employee.findById(leaveApplication.employeeId);

            const admins = await User.find({ role: "ADMIN" });

            for (const admin of admins) {
                console.log(`Sending reminder email to admin: ${admin.email}`);
                await sendEmail({
                    to: process.env.ADMIN_EMAIL || admin.email,
                    subject: "Leave Application Notification - Lemon Media",
                    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">

    <!-- Spacer -->
    <tr><td style="height: 40px;"></td></tr>

    <!-- Logo -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
          Lemon Media
        </div>
        <div style="font-size: 10px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; font-weight: 400;">
          Employee Management
        </div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="width: 32px; height: 2px; background: #c9a84c;"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 32px 36px 32px;">

        <h2 style="font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0 0 16px 0; letter-spacing: -0.2px;">
          Hi Admin,
        </h2>

        <p style="font-size: 15px; color: #555555; line-height: 1.7; margin: 0 0 8px 0;">
          You have a leave application from <strong style="color: #1a1a1a;">${employee?.firstName || ''} ${employee?.lastName || ''}</strong> in <strong style="color: #1a1a1a;">${employee?.department || 'N/A'}</strong> department:
        </p>

        <!-- Dates -->
        <div style="margin: 20px 0 20px 0; padding: 16px 20px; background: #f8f8f8; border-radius: 8px; text-align: center;">
          <div style="font-size: 20px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.2px;">
            ${new Date(leaveApplication?.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span style="color: #aaaaaa; font-weight: 300; margin: 0 6px;">—</span>
            ${new Date(leaveApplication?.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style="font-size: 13px; color: #888888; margin-top: 4px;">
            ${Math.ceil((new Date(leaveApplication?.endDate) - new Date(leaveApplication?.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
          </div>
        </div>

        <!-- Leave Details -->
        <div style="background: #fafaf8; border-radius: 8px; padding: 14px 18px; margin: 16px 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 50%;">
                <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Leave Type</div>
                <div style="font-size: 14px; color: #1a1a1a; margin-top: 2px;">${leaveApplication?.leaveType || 'N/A'}</div>
              </td>
              <td style="width: 50%;">
                <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Status</div>
                <div style="font-size: 14px; color: #c9a84c; margin-top: 2px; font-weight: 500;">● Pending</div>
              </td>
            </tr>
          </table>
          <div style="border-top: 1px solid #f0f0f0; margin-top: 10px; padding-top: 10px;">
            <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Reason</div>
            <div style="font-size: 14px; color: #555555; margin-top: 2px; font-style: italic;">
              "${leaveApplication?.reason || 'No reason provided'}"
            </div>
          </div>
        </div>

        <!-- Action -->
        <div style="background: #fafaf8; border-left: 3px solid #c9a84c; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0 20px 0;">
          <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">
            Please take action on this leave application.
          </p>
        </div>

        <!-- Closing -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
          <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px 24px 32px; background: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; color: #aaaaaa;">Lemon Media Company</td>
            <td align="right" style="font-size: 11px; color: #aaaaaa;">${new Date().getFullYear()}</td>
          </tr>
        </table>
      </td>
    </tr>

  </table>

</body>
</html>`
                });
            }

            console.log(`Reminder sent for leave application ${leaveApplicationId}`);
        }

        return { success: true, message: "Leave reminder processed" };
    }
);

// Cron: Check attendance at 11:30 AM IST (06:00 UTC) and email absent employees
const attendanceReminderCron = inngest.createFunction(
    {
        id: "attendance-reminder-cron",
        triggers: [{ cron: "TZ=Asia/Kolkata 30 11 * * *" }] // 06:00 UTC = 11:30 AM IST
    },
    async ({ step }) => {
        // Step 1: Get today's date range (IST)
        const { startUTC, endUTC } = await step.run("get-today-date", () => {
            const startUTC = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30");
            const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
            return {
                startUTC: startUTC.toISOString(),
                endUTC: endUTC.toISOString()
            };
        });

        // Step 2: Get all active, non-deleted employees
        const activeEmployees = await step.run("get-active-employees", async () => {
            const employees = await Employee.find({
                isDeleted: false,
                employmentStatus: "ACTIVE",
            }).lean();
            return employees.map((e) => ({
                _id: e._id.toString(),
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                department: e.department
            }));
        });

        // Step 3: Get employee IDs on approved leave today
        const onLeaveIds = await step.run("get-on-leave-ids", async () => {
            const leaves = await LeaveApplication.find({
                status: "APPROVED",
                startDate: { $lt: new Date(endUTC) },
                endDate: { $gt: new Date(startUTC) },
            }).lean();
            return leaves.map((l) => l.employeeId.toString());
        });

        // Step 4: Get employee IDs who already checked in today
        const checkedInIds = await step.run("get-checked-in-ids", async () => {
            const attendances = await Attendance.find({
                date: {
                    $gte: new Date(startUTC),
                    $lt: new Date(endUTC)
                },
            }).lean();
            return attendances.map((a) => a.employeeId.toString());
        });

        // Step 5: Filter absent employees (not on leave & not checked in)
        const absentEmployees = activeEmployees.filter((emp) => !onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._id));

        // Step 6: Send reminder emails
        if (absentEmployees.length > 0) {
            await step.run("send-reminder-emails", async () => {
                const emailPromises = absentEmployees.map(async (emp) => {
                    console.log(`Sending reminder email to ${emp.email}`);
                    return await sendEmail({
                        to: emp.email,
                        subject: "Attendance Reminder - Lemon Media",
                        body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">

    <!-- Spacer -->
    <tr><td style="height: 40px;"></td></tr>

    <!-- Logo -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="font-size: 20px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
          Lemon Media
        </div>
        <div style="font-size: 10px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; font-weight: 400;">
          Employee Management
        </div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 32px;">
        <div style="width: 32px; height: 2px; background: #c9a84c;"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 32px 36px 32px;">

        <h2 style="font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0 0 16px 0; letter-spacing: -0.2px;">
          Hi ${emp.firstName},
        </h2>

        <p style="font-size: 15px; color: #555555; line-height: 1.7; margin: 0 0 16px 0;">
          We noticed you haven't marked your attendance yet today.
        </p>

        <!-- Deadline -->
        <div style="margin: 20px 0 20px 0; padding: 16px 20px; background: #fafaf8; border-radius: 8px; text-align: center; border: 1px solid #f0f0f0;">
          <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Deadline Passed</div>
          <div style="font-size: 24px; font-weight: 600; color: #c9a84c; margin-top: 4px; letter-spacing: -0.2px;">
            11:30 AM IST
          </div>
          <div style="font-size: 13px; color: #888888; margin-top: 4px;">
            Your attendance record is currently missing
          </div>
        </div>

        <!-- Action -->
        <div style="background: #fafaf8; border-radius: 8px; padding: 14px 18px; margin: 16px 0 20px 0;">
          <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Action Required</div>
          <p style="font-size: 14px; color: #555555; line-height: 1.7; margin: 4px 0 0 0;">
            Please log in and check in as soon as possible, or contact your administrator if you are facing any issues.
          </p>
        </div>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 24px 0;">
          <tr>
            <td align="center">
              <a href="${process.env.VITE_BASE_URL || 'http://localhost:5173'}" style="display: inline-block; background: #1a1a1a; color: #ffffff; font-size: 13px; font-weight: 500; padding: 12px 40px; text-decoration: none; text-align: center; border-radius: 8px;">
                Mark Attendance Now
              </a>
            </td>
          </tr>
        </table>

        <!-- Department & Date -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 13px; color: #999999;">
              Department: <strong style="color: #1a1a1a; font-weight: 500;">${emp.department || 'N/A'}</strong>
            </td>
            <td align="right" style="font-size: 13px; color: #999999;">
              ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </td>
          </tr>
        </table>

        <!-- Closing -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
          <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px 24px 32px; background: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; color: #aaaaaa;">Lemon Media Company</td>
            <td align="right" style="font-size: 11px; color: #aaaaaa;">${new Date().getFullYear()}</td>
          </tr>
        </table>
      </td>
    </tr>

  </table>

</body>
</html>`
                    });
                });
                await Promise.all(emailPromises);
            });
        }

        return {
            totalActive: activeEmployees.length,
            onLeave: onLeaveIds.length,
            checkedIn: checkedInIds.length,
            absent: absentEmployees.length
        };
    }
);

//  SIRF EK BAAR EXPORT KARO
export const functions = [autoCheckOut, leaveApplicationReminder, attendanceReminderCron];