import express from "express";
import { createUser, updateUser } from "./userController";
import { loginUser } from "./loginController";
import { getCurrentUser } from "./getUserController";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

// Protected:
userRouter.get("/getuser", getCurrentUser);
userRouter.patch("/update", updateUser);

export default userRouter;
