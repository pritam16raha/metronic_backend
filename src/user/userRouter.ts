import express from 'express';
import { createUser } from './userController';
import { loginUser } from './loginController';


const userRouter = express.Router();

userRouter.post('/register', createUser);
userRouter.post("/login", loginUser);

export default userRouter;