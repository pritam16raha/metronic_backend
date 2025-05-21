import express from "express";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/globalErrorHandler";

const app = express();

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ai Dashboard Backend" });
});

// 1) catch-all for 404s
app.use(notFoundHandler);

// register it
app.use(errorHandler);

export default app;
