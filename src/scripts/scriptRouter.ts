import { Router } from "express";
import { createScript, deleteScript, getScripts } from "./scriptController";

const scriptsRouter = Router();

scriptsRouter.post("/generate", createScript);
scriptsRouter.get("/", getScripts);
scriptsRouter.delete("/delete/:id", deleteScript);

export default scriptsRouter;
