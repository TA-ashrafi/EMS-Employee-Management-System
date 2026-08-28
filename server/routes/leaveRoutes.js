import { Router } from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import { createLeaves, getLeaves, updateLeaveStatus } from "../controllers/leaveController.js";

const leaveRouter = Router();

leaveRouter.post("/", protect, createLeaves)
leaveRouter.get("/", protect, getLeaves)
leaveRouter.patch("/:id", protect, protectAdmin, updateLeaveStatus)

export default leaveRouter;

