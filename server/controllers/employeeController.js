import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import user from "../models/User.js";

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
      bio
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Note: You still need the user creation / password hashing logic here
    // (it was missing in the screenshots). Example:
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const user = await User.create({ email, password: hashedPassword, role: role || "employee" });

    const employee = await Employee.create({
      userId: user._id,          // ← make sure `user` is defined above
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
export const updateEmployee = async (req, res)=>{
    try{

    }catch(error){
        
    }    
}

// Delete employee
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res)=>{
    try{

    }catch(error){
        
    }    
}