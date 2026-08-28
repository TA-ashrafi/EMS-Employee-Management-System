import dns from "dns";
import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import bcrypt from "bcryptjs";

dns.setServers(['1.1.1.1', '8.8.8.8']);

const TEMPORARY_PASSWORD = "admin123";

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        if (!ADMIN_EMAIL) {
            console.log("❌ Missing ADMIN_EMAIL env Variable");
            process.exit(1);
        }

        await connectDB();

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log("User already exists as role", existingAdmin.role);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(TEMPORARY_PASSWORD, 10);

        const admin = await User.create({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
            isVerified: true,
        });

        const employee = await Employee.create({
            userId: admin._id,
            email: ADMIN_EMAIL,
        });

        console.log("✅ Admin user created successfully!");
        console.log("\n📧 Email:", admin.email);
        console.log("🔑 Password:", TEMPORARY_PASSWORD);
        console.log("\n⚠️  Please change the password after login.");
        
        process.exit(0);

    } catch (error) {
        console.error("❌ Seed Failed:", error);
        process.exit(1);
    }
}

registerAdmin();