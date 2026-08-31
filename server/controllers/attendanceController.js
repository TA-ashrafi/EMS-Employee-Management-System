import { inngest } from "../inngest/index.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Clock in/out for employee
// POST /api/attendance
export const clockInOut = async (req, res) => {
    try {
        const session = req.session;
        let employee = await Employee.findOne({ userId: session.userId });
        
        // Auto create employee profile for Admin if missing
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
            });
        }

        if (!employee) {
            return res.status(404).json({ error: "Employee profile not found" });
        }
        
        if (employee.isDeleted) {
            return res.status(403).json({ error: "Your account is Deactivated. You Cannot Punch IN / OUT" });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await Attendance.findOne({
            employeeId: employee._id,
            date: today,
        });

        const now = new Date();
        
        if (!existing) {
            const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIN: now,
                status: isLate ? "LATE" : "PRESENT"
            });

            try {
                await inngest.send({
                    name: "employee/check-out",
                    data : {
                        employeeId : employee._id,
                        attendanceId : attendance._id,
                    }
                });
            } catch (err) {
                console.error("Inngest send error:", err);
            }
            
            return res.json({
                success: true,
                type: "CHECK_IN",
<<<<<<< HEAD
                message: "Clocked in successfully",
=======
>>>>>>> 7d32d919e32ffaf29edb398b4e6645306678c009
                data: {
                    ...attendance.toObject(),
                    checkIn: attendance.checkIN,
                    checkOut: attendance.checkOUT
                }
            });
        } 
        else if (!existing.checkOUT) {
            const checkInTime = existing.checkIN ? new Date(existing.checkIN).getTime() : now.getTime();
            const diffMs = Math.max(0, now.getTime() - checkInTime);
            const diffHours = diffMs / (1000 * 60 * 60);

            existing.checkOUT = now;

            // Compute working hours and day type matching enum ["FULL_DAY", "HALF_DAY"]
            const workingHours = parseFloat(diffHours.toFixed(2)) || 0;
            let dayType = "HALF_DAY";
            if (workingHours >= 6) {
                dayType = "FULL_DAY";
            }

            existing.workingHours = workingHours;
            existing.dayType = dayType;

            await existing.save();
            return res.json({
                success: true,
                type: "CHECK_OUT",
<<<<<<< HEAD
                message: "Clocked out successfully",
=======
>>>>>>> 7d32d919e32ffaf29edb398b4e6645306678c009
                data: {
                    ...existing.toObject(),
                    checkIn: existing.checkIN,
                    checkOut: existing.checkOUT
                }
            });
        } 
        else {
<<<<<<< HEAD
            // Already checked in and checked out for today!
            return res.status(400).json({
                error: "You have already completed your punch in and punch out for today.",
                alreadyCompleted: true,
                data: {
                    ...existing.toObject(),
                    checkIn: existing.checkIN,
                    checkOut: existing.checkOUT
=======
            // Already checked out - start new check-in
            const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIN: now,
                status: isLate ? "LATE" : "PRESENT"
            });
            
            return res.json({
                success: true,
                type: "CHECK_IN",
                data: {
                    ...attendance.toObject(),
                    checkIn: attendance.checkIN,
                    checkOut: attendance.checkOUT
>>>>>>> 7d32d919e32ffaf29edb398b4e6645306678c009
                }
            });
        }

    } catch (error) {
        console.error("Attendance Error:", error);
        return res.status(500).json({ error: "Operation failed: " + (error.message || "") });
    }
};

// Get attendance for employee
// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === "ADMIN";

        const limit = parseInt(req.query.limit || 50);

        if (isAdmin) {
            const history = await Attendance.find()
                .populate("employeeId")
                .sort({ date: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            const data = history.map((log) => ({
                ...log,
                id: log._id.toString(),
                checkIn: log.checkIN || log.checkIn,
                checkOut: log.checkOUT || log.checkOut,
                employee: log.employeeId
            }));

            return res.json({
                data,
                employee: { isDeleted: false }
            });
        } else {
            const employee = await Employee.findOne({ userId: session.userId });
<<<<<<< HEAD
            
=======

>>>>>>> 7d32d919e32ffaf29edb398b4e6645306678c009
            if (!employee) {
                return res.status(404).json({ error: "Employee profile not found" });
            }

            const history = await Attendance.find({ employeeId: employee._id })
                .sort({ date: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            const data = history.map((log) => ({
                ...log,
                id: log._id.toString(),
                checkIn: log.checkIN || log.checkIn,
                checkOut: log.checkOUT || log.checkOut,
            }));

            return res.json({
                data,
                employee: { isDeleted: employee.isDeleted }
            });
        }
        
    } catch (error) {
        console.error("Get Attendance Error:", error);
        return res.status(500).json({ error: "Failed to fetch attendance" });
    }
};
