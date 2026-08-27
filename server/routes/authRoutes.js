import { Router } from "express";
import { login } from "../controllers/authControllers.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/session", session);
authRouter.post("/change-password", changePassword);

export default authRouter;