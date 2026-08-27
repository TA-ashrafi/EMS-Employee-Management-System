import Employee from "../models/Employee.js";

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


// Create employee
// POST /api/employees
export const createEmployee = async (req, res)=>{
    
}

// Update employee
// PUT /api/employees/:id
export const updateEmployee = async (req, res)=>{
    
}

// Delete employee
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res)=>{
    
}