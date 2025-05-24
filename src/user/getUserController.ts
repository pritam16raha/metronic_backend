// src/user/getUserController.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { verify, JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import { config } from "../config/config";

export const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    // 1) Extract & verify bearer access_token
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      throw createHttpError.Unauthorized(
        "Missing or malformed Authorization header"
      );
    }
    const access_token = auth.slice(7);

    let payload: JwtPayload;
    try {
      payload = verify(access_token, config.jwtSecret!) as JwtPayload;
    } catch {
      throw createHttpError.Unauthorized("Invalid or expired access_token");
    }

    // 2) Coerce `sub` → string UUID
    const rawSub = payload.sub;
    if (typeof rawSub !== "string" || !rawSub.trim()) {
      throw createHttpError.Unauthorized("Invalid access_token payload");
    }
    const userId = rawSub;

    // 3) Fetch only the fields you need
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        isEmailVerified: users.isEmailVerified,
        profileImage: users.profileImage,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    // 4) Send back the “public” user object
    res.json(user);
  } catch (err) {
    next(err);
  }
};
