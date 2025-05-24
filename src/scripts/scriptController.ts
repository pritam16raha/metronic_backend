// import { RequestHandler } from "express";
// import createHttpError from "http-errors";
// import { verify, JwtPayload } from "jsonwebtoken";
// import { config } from "../config/config";
// import { db } from "../db/client";
// import { users, scripts } from "../db/schema";
// import { eq, desc } from "drizzle-orm";
// import { generateScript } from "./ai.service";

// // Helper to extract userId from Bearer access_token
// const getUserIdFromToken = (authHeader?: string): number => {
//   if (!authHeader?.startsWith("Bearer ")) {
//     throw createHttpError.Unauthorized(
//       "Missing or malformed Authorization header"
//     );
//   }

//   const access_token = authHeader.slice(7);
//   const payload = verify(token, config.jwtSecret!) as JwtPayload;

//   if (!payload || typeof payload.sub !== "number") {
//     throw createHttpError.Unauthorized("Invalid access_token payload");
//   }

//   return payload.sub;
// };

// /**
//  * POST /api/scripts
//  * Body: { prompt: string, title?: string }
//  * Header: Authorization: Bearer <token>
//  */
// export const createScript: RequestHandler = async (req, res, next) => {
//   try {
//     const userId = getUserIdFromToken(req.headers.authorization);

//     const [user] = await db.select().from(users).where(eq(users.id, userId));
//     if (!user) {
//       throw createHttpError.Unauthorized("User not found");
//     }

//     const { prompt, title } = req.body as { prompt?: unknown; title?: unknown };

//     if (typeof prompt !== "string" || !prompt.trim()) {
//       throw createHttpError.BadRequest("Prompt must be a non-empty string");
//     }

//     const scriptTitle =
//       typeof title === "string" && title.trim().length > 0
//         ? title.trim()
//         : prompt.slice(0, 50);

//     const content = await generateScript(prompt);

//     const [newScript] = await db
//       .insert(scripts)
//       .values({ userId, title: scriptTitle, content })
//       .returning();

//     res.status(201).json(newScript);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * GET /api/scripts
//  * Header: Authorization: Bearer <token>
//  */
// export const getScripts: RequestHandler = async (req, res, next) => {
//   try {
//     const userId = getUserIdFromToken(req.headers.authorization);

//     const [user] = await db.select().from(users).where(eq(users.id, userId));
//     if (!user) {
//       throw createHttpError.Unauthorized("User not found");
//     }

//     const allScripts = await db
//       .select()
//       .from(scripts)
//       .where(eq(scripts.userId, userId))
//       .orderBy(desc(scripts.createdAt));

//     res.json(allScripts);
//   } catch (err) {
//     next(err);
//   }
// };

import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import { db } from "../db/client";
import { users, scripts } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateScript } from "./ai.service";

/**
 * Extracts userId (UUID) from Authorization header (Bearer access_token)
 */
const getUserIdFromToken = (authHeader?: string): string => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw createHttpError.Unauthorized(
      "Missing or malformed Authorization header"
    );
  }

  const access_token = authHeader.slice(7);
  const payload = verify(access_token, config.jwtSecret!) as JwtPayload;

  if (!payload || typeof payload.sub !== "string") {
    throw createHttpError.Unauthorized("Invalid access_token payload");
  }

  return payload.sub;
};

/**
 * POST /api/scripts
 * Body: { prompt: string, title?: string }
 * Header: Authorization: Bearer <token>
 */
export const createScript: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw createHttpError.Unauthorized("User not found");
    }

    const { prompt, title } = req.body as { prompt?: unknown; title?: unknown };

    if (typeof prompt !== "string" || !prompt.trim()) {
      throw createHttpError.BadRequest("Prompt must be a non-empty string");
    }

    const scriptTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : prompt.slice(0, 50);

    const content = await generateScript(prompt);

    const [newScript] = await db
      .insert(scripts)
      .values({ userId, title: scriptTitle, content })
      .returning();

    res.status(201).json(newScript);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/scripts
 * Header: Authorization: Bearer <token>
 */
export const getScripts: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw createHttpError.Unauthorized("User not found");
    }

    const allScripts = await db
      .select()
      .from(scripts)
      .where(eq(scripts.userId, userId))
      .orderBy(desc(scripts.createdAt));

    res.json(allScripts);
  } catch (err) {
    next(err);
  }
};

export const deleteScript: RequestHandler = async (req, res, next) => {
  try {
    // 1) Who is calling?
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw createHttpError.Unauthorized(
        "Missing or malformed Authorization header"
      );
    }
    const token = authHeader.slice(7);
    const payload = verify(token, config.jwtSecret!) as JwtPayload;
    if (!payload || typeof payload.sub !== "string") {
      throw createHttpError.Unauthorized("Invalid access_token payload");
    }
    const userId = payload.sub;

    // 2) Ensure that user actually exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw createHttpError.Unauthorized("User not found");
    }

    // 3) Validate & parse :id param as UUID string
    const scriptId = req.params.id;
    if (!scriptId || typeof scriptId !== "string") {
      throw createHttpError.BadRequest("Invalid script ID");
    }

    // 4) Attempt delete (only if script.userId === caller’s UUID)
    const deleted = await db
      .delete(scripts)
      .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))
      .returning(); // returns deleted rows

    if (deleted.length === 0) {
      // either not found or not owned by this user
      throw createHttpError.NotFound("Script not found or not yours to delete");
    }

    // 5) Success – no content
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};