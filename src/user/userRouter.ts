import express from 'express';
import { createUser } from './userController';
import { loginUser } from './loginController';
import { getCurrentUser } from './getUserController';


const userRouter = express.Router();

userRouter.post('/register', createUser);
userRouter.post("/login", loginUser);

// Protected:
userRouter.get("/getuser",      getCurrentUser);

export default userRouter;