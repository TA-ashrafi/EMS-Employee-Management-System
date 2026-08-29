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
                subject: "Attendance Check-Out Remainder",
                body: `<div style="max-width: 600px; font-family: Arial, sans-serif;">
                <h2>Hi ${employee.firstName},</h2>
                <p style="font-size: 16px;">You have a check-in in ${employee.department} today:</p>
                <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${new Date(attendance.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <ol><li>${new Date(attendance.checkIn).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li></ol>
                <p style="font-size: 16px;">Please make sure to check-out in one hour.</p>
                <p style="font-size: 16px;">If you have any questions, please contact your admin.</p>
                <p style="font-size: 16px;">Best Regards,</p>
                <p style="font-size: 16px;">EMS</p>
                </div>`
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
                    to: process.env.ADMIN_EMAIL,
                    subject: "Leave Attendance Remainder",
                    body: `<div style="max-width: 600px; font-family: Arial, sans-serif;">
                    <h2>Hi Admin,</h2><p style="font-size: 16px;">You have a leave application from <strong>${employee?.firstName || ''} ${employee?.lastName || ''}</strong> in ${employee?.department || 'N/A'} department:</p><p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${new Date(leaveApplication?.startDate).toLocaleDateString('en-IN')} to ${new Date(leaveApplication?.endDate).toLocaleDateString('en-IN')}</p>
                    <p style="font-size: 16px;">Please take action on this leave application.</p>
                    <br />
                    <p style="font-size: 16px;">Best Regards,</p>
                    <p style="font-size: 16px;">EMS</p>
                    </div>`
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
                const emailPromises = absentEmployees.map((emp) => {
                    console.log(` Sending reminder email to ${emp.email}`);
                    // send email
                    sendEmail({
                        to: emp.email,
                        subject: "Attendance Reminder - Please Mark Your Attendance",
                        body: `<div style="max-width: 600px; font-family: Arial, sans-serif;">
                        <h2>Hi ${emp.firstName}, </h2>
                        <p style="font-size: 16px;">We noticed you haven't marked your attendance yet today.</p>
                        <p style="font-size: 16px;">The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
                        <p style="font-size: 16px;">Please check in as soon as possible or contact your admin if you're facing any issues.</p>
                        <p style="font-size: 14px; color: #666;">Department: ${emp.department}</p>
                        <p style="font-size: 16px;">Best Regards,</p>
                        <p style="font-size: 16px;">${emp.department}</p>
                        <p style="font-size: 16px;">${emp.department}</p>
                        </div>`
                    })

                    return Promise.resolve(true);
                });
                await Promise.all(emailPromises);
            });
        }

        await Promise.all(emailPromises)
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