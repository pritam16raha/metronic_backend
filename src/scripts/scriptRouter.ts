import { Router } from "express";
import { createScript, getScripts } from "./scriptController";

const scriptsRouter = Router();

scriptsRouter.post("/generate", createScript);
scriptsRouter.get("/", getScripts);

export default scriptsRouter;
