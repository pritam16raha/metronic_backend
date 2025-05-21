import express from "express";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ai Dashboard Backend" });
});

app.use('/api/users',userRouter);

// 1) catch-all for 404s
app.use(notFoundHandler);

// register it
app.use(errorHandler);

export default app;
