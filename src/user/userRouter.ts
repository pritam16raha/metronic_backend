import express from "express";
import { createUser, updateUser } from "./userController";
import { loginUser } from "./loginController";
import { getCurrentUser } from "./getUserController";
import { requireAuth } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

// Protected:
// userRouter.get("/getuser", getCurrentUser);
// userRouter.patch("/update", updateUser);

// Protected routes (must supply valid Bearer token):
userRouter.get("/getuser", requireAuth, getCurrentUser);

// with an optional `profileImage` field
userRouter.patch(
  "/update",
  requireAuth,
  upload.single("profileImage"),
  updateUser
);

export default userRouter;
