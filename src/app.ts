// import express from "express";
// import {
//     errorHandler,
//     notFoundHandler,
// } from "./middlewares/globalErrorHandler";
// import userRouter from "./user/userRouter";
// import scriptsRouter from "./scripts/scriptRouter";

// const app = express();
// app.use(express.json());

// // routes
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to Ai Dashboard Backend" });
// });

// app.use('/api/users',userRouter);

// app.use('/api/scripts', scriptsRouter);

// // 1) catch-all for 404s
// app.use(notFoundHandler);

// // register it
// app.use(errorHandler);

// export default app;


// src/app.ts
import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import userRouter from './user/userRouter';
import scriptsRouter from './scripts/scriptRouter';
import { notFoundHandler, errorHandler } from './middlewares/globalErrorHandler';

const app = express();

// CORS – allow exactly your front-end origins
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Your routes
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Ai Dashboard Backend after new Cors' });
});
app.use('/api/users', userRouter);
app.use('/api/scripts', scriptsRouter);

// 404 + global error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
