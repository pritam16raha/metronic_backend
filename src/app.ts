import express from "express";

const app = express();

//routes 
app.get('/', (req, res, next) => {
    res.json({ message: "Welcome to Ai Dashboard Backend" });
});

export default app;