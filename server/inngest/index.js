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
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #0f0f0f; margin-top: 48px; margin-bottom: 48px; box-shadow: 0 8px 48px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.03);">

    <!-- Top Accent -->
    <tr>
      <td style="height: 3px; background: linear-gradient(to right, #c9a84c, #b8922e, #c9a84c);"></td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="padding: 32px 44px 0 44px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">
                <span style="color: #c9a84c;">◆</span> Lemon Media
              </div>
              <div style="font-size: 8px; color: #444444; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Employee Management System</div>
            </td>
            <td align="right">
              <div style="font-size: 8px; color: #c9a84c; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">Check-in</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 44px;">
        <div style="width: 40px; height: 1px; background: rgba(255,255,255,0.06);"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 44px 36px 44px;">
        <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; letter-spacing: -0.3px;">
          Hi ${employee.firstName}, 👋
        </h2>
        <p style="font-size: 15px; color: #bbbbbb; line-height: 1.8; margin: 0 0 16px 0;">
          You have a check-in in <strong style="color: #c9a84c;">${employee.department}</strong> today:
        </p>

        <!-- Time Card -->
        <div style="background: rgba(201, 168, 76, 0.04); border: 1px solid rgba(201, 168, 76, 0.06); border-radius: 8px; padding: 24px 28px; margin: 16px 0 20px 0; text-align: center;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600; margin-bottom: 6px;">Check-in Time</div>
          <div style="font-size: 34px; font-weight: 600; color: #c9a84c; letter-spacing: -0.5px;">
            ${new Date(attendance.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
          <div style="font-size: 13px; color: #666666; margin-top: 6px;">
            ${new Date(attendance.checkIn).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <!-- Details -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 14px 20px; margin: 16px 0 20px 0;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 6px;">Details</div>
          <div style="font-size: 14px; color: #aaaaaa;">
            ${new Date(attendance.checkIn).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
        </div>

        <!-- Reminder -->
        <div style="background: rgba(201, 168, 76, 0.04); border-left: 3px solid #c9a84c; padding: 12px 18px; border-radius: 0 4px 4px 0; margin: 16px 0 20px 0;">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.6;">
            <span style="color: #c9a84c;">◆</span> Please make sure to <strong style="color: #ffffff;">check-out in one hour</strong>.
          </p>
        </div>

        <p style="font-size: 14px; color: #666666; line-height: 1.8; margin: 16px 0 8px 0;">
          If you have any questions, please contact your admin.
        </p>

        <!-- Closing -->
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.04);">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #c9a84c; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 18px 44px 24px 44px; background: rgba(10,10,10,0.95); border-top: 1px solid rgba(255,255,255,0.02);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 9px; color: #444444;"><span style="color: #c9a84c;">◆</span> Lemon Media Company</td>
            <td align="right" style="font-size: 9px; color: #444444;">${new Date().getFullYear()}</td>
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
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #0f0f0f; margin-top: 48px; margin-bottom: 48px; box-shadow: 0 8px 48px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.03);">

    <!-- Top Accent -->
    <tr>
      <td style="height: 3px; background: linear-gradient(to right, #c9a84c, #b8922e, #c9a84c);"></td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="padding: 32px 44px 0 44px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">
                <span style="color: #c9a84c;">◆</span> Lemon Media
              </div>
              <div style="font-size: 8px; color: #444444; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Employee Management System</div>
            </td>
            <td align="right">
              <div style="font-size: 8px; color: #c9a84c; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">Leave Application</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 44px;">
        <div style="width: 40px; height: 1px; background: rgba(255,255,255,0.06);"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 44px 36px 44px;">
        <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; letter-spacing: -0.3px;">
          Hi Admin, 👋
        </h2>
        <p style="font-size: 15px; color: #bbbbbb; line-height: 1.8; margin: 0 0 6px 0;">
          You have a leave application from
        </p>

        <!-- Employee Card -->
        <div style="background: rgba(201, 168, 76, 0.04); border: 1px solid rgba(201, 168, 76, 0.06); border-radius: 8px; padding: 18px 24px; margin: 12px 0 16px 0;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600; margin-bottom: 4px;">Employee</div>
          <div style="font-size: 20px; font-weight: 600; color: #ffffff;">
            ${employee?.firstName || ''} ${employee?.lastName || ''}
          </div>
          <div style="font-size: 13px; color: #888888; margin-top: 2px;">${employee?.department || 'N/A'} Department</div>
        </div>

        <!-- Leave Period -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 20px 24px; margin: 16px 0 20px 0; text-align: center;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600; margin-bottom: 6px;">Leave Period</div>
          <div style="font-size: 22px; font-weight: 600; color: #c9a84c; letter-spacing: -0.3px;">
            ${new Date(leaveApplication?.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span style="color: #666666; font-weight: 300; margin: 0 6px;">—</span>
            ${new Date(leaveApplication?.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style="font-size: 12px; color: #666666; margin-top: 4px;">
            ${Math.ceil((new Date(leaveApplication?.endDate) - new Date(leaveApplication?.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
          </div>
        </div>

        <!-- Leave Details -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 14px 20px; margin: 16px 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 50%;">
                <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 4px;">Leave Type</div>
                <div style="font-size: 14px; color: #ffffff;">${leaveApplication?.leaveType || 'N/A'}</div>
              </td>
              <td style="width: 50%;">
                <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 4px;">Status</div>
                <div style="font-size: 14px; color: #f5a623; font-weight: 500;">● Pending</div>
              </td>
            </tr>
          </table>
          <div style="border-top: 1px solid rgba(255,255,255,0.04); margin-top: 12px; padding-top: 12px;">
            <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 4px;">Reason</div>
            <div style="font-size: 14px; color: #aaaaaa; font-style: italic;">"${leaveApplication?.reason || 'No reason provided'}"</div>
          </div>
        </div>

        <!-- Action -->
        <div style="background: rgba(201, 168, 76, 0.04); border-left: 3px solid #c9a84c; padding: 12px 18px; border-radius: 0 4px 4px 0; margin: 16px 0 20px 0;">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.6;">
            <span style="color: #c9a84c;">◆</span> Please take action on this leave application.
          </p>
        </div>

        <!-- Closing -->
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.04);">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #c9a84c; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 18px 44px 24px 44px; background: rgba(10,10,10,0.95); border-top: 1px solid rgba(255,255,255,0.02);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 9px; color: #444444;"><span style="color: #c9a84c;">◆</span> Lemon Media Company</td>
            <td align="right" style="font-size: 9px; color: #444444;">${new Date().getFullYear()}</td>
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
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #0f0f0f; margin-top: 48px; margin-bottom: 48px; box-shadow: 0 8px 48px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.03);">

    <!-- Top Accent -->
    <tr>
      <td style="height: 3px; background: linear-gradient(to right, #c9a84c, #b8922e, #c9a84c);"></td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="padding: 32px 44px 0 44px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px;">
                <span style="color: #c9a84c;">◆</span> Lemon Media
              </div>
              <div style="font-size: 8px; color: #444444; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Employee Management System</div>
            </td>
            <td align="right">
              <div style="font-size: 8px; color: #f5a623; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">Reminder</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Divider -->
    <tr>
      <td align="center" style="padding: 0 44px;">
        <div style="width: 40px; height: 1px; background: rgba(255,255,255,0.06);"></div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height: 28px;"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 44px 36px 44px;">
        <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; letter-spacing: -0.3px;">
          Hi ${emp.firstName}, 👋
        </h2>
        <p style="font-size: 15px; color: #bbbbbb; line-height: 1.8; margin: 0 0 16px 0;">
          We noticed you haven't marked your attendance yet today.
        </p>

        <!-- Deadline Card -->
        <div style="background: rgba(201, 168, 76, 0.04); border: 1px solid rgba(201, 168, 76, 0.06); border-radius: 8px; padding: 20px 24px; margin: 16px 0 20px 0; text-align: center;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600; margin-bottom: 4px;">Deadline Passed</div>
          <div style="font-size: 26px; font-weight: 600; color: #f5a623; letter-spacing: -0.3px;">
            11:30 AM IST
          </div>
          <div style="font-size: 13px; color: #888888; margin-top: 4px;">
            Your attendance record is currently missing
          </div>
        </div>

        <!-- Action Required -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 16px 20px; margin: 16px 0 20px 0;">
          <div style="font-size: 8px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 6px;">Action Required</div>
          <p style="font-size: 14px; color: #aaaaaa; line-height: 1.7; margin: 0;">
            Please log in and check in as soon as possible, or contact your administrator if you are facing any issues.
          </p>
        </div>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 24px 0;">
          <tr>
            <td align="center">
              <a href="${process.env.VITE_BASE_URL || 'http://localhost:5173'}" style="display: inline-block; background: linear-gradient(135deg, #c9a84c, #b8922e); color: #0a0a0a; font-size: 11px; font-weight: 600; padding: 12px 44px; text-decoration: none; text-align: center; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px; box-shadow: 0 4px 20px rgba(201, 168, 76, 0.12);">
                Mark Attendance Now
              </a>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <div style="height: 1px; background: rgba(255,255,255,0.04); margin: 0 0 16px 0;"></div>

        <!-- Department & Date -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 12px; color: #666666;">
              <span style="color: #c9a84c;">◆</span> Department: <strong style="color: #ffffff;">${emp.department || 'N/A'}</strong>
            </td>
            <td align="right" style="font-size: 12px; color: #666666;">
              ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </td>
          </tr>
        </table>

        <!-- Closing -->
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.04);">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.6;">Best Regards,</p>
          <p style="font-size: 14px; color: #c9a84c; font-weight: 500; margin: 2px 0 0 0;">EMS Team</p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 18px 44px 24px 44px; background: rgba(10,10,10,0.95); border-top: 1px solid rgba(255,255,255,0.02);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 9px; color: #444444;"><span style="color: #c9a84c;">◆</span> Lemon Media Company</td>
            <td align="right" style="font-size: 9px; color: #444444;">${new Date().getFullYear()}</td>
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