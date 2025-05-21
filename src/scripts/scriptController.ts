// import { RequestHandler } from "express";
// import createHttpError from "http-errors";
// import { verify, JwtPayload } from "jsonwebtoken";
// import { config } from "../config/config";
// import { db } from "../db/client";
// import { users, scripts } from "../db/schema";
// import { eq, desc } from "drizzle-orm";
// import { generateScript } from "./ai.service";

// // Helper to extract userId from Bearer token
// const getUserIdFromToken = (authHeader?: string): number => {
//   if (!authHeader?.startsWith("Bearer ")) {
//     throw createHttpError.Unauthorized(
//       "Missing or malformed Authorization header"
//     );
//   }

//   const token = authHeader.slice(7);
//   const payload = verify(token, config.jwtSecret!) as JwtPayload;

//   if (!payload || typeof payload.sub !== "number") {
//     throw createHttpError.Unauthorized("Invalid token payload");
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
import { eq, desc } from "drizzle-orm";
import { generateScript } from "./ai.service";

/**
 * Extracts userId (UUID) from Authorization header (Bearer token)
 */
const getUserIdFromToken = (authHeader?: string): string => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw createHttpError.Unauthorized(
      "Missing or malformed Authorization header"
    );
  }

  const token = authHeader.slice(7);
  const payload = verify(token, config.jwtSecret!) as JwtPayload;

  if (!payload || typeof payload.sub !== "string") {
    throw createHttpError.Unauthorized("Invalid token payload");
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
