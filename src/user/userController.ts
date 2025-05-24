import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { config } from "../config/config";

/**
 * Extracts the user ID (UUID) from the Authorization header.
 */
function getUserIdFromToken(authHeader?: string): string {
  if (!authHeader?.startsWith("Bearer ")) {
    throw createHttpError.Unauthorized("Missing or malformed Authorization header");
  }
  const token = authHeader.slice(7);
  let payload: JwtPayload;
  try {
    payload = verify(token, config.jwtSecret as string) as JwtPayload;
  } catch {
    throw createHttpError.Unauthorized("Invalid or expired token");
  }
  if (!payload.sub || typeof payload.sub !== "string") {
    throw createHttpError.Unauthorized("Invalid token payload");
  }
  return payload.sub;
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      const error = createHttpError(400, "All fields Are Required");
      return next(error);
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length > 0) {
      return next(createHttpError.Conflict("Email is already registered"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email,
        password: hashedPassword,
      })
      .returning();

    const access_token = sign({ sub: newUser.id }, config.jwtSecret as string, {
      expiresIn: "1h",
    });

    // res.status(201).json({
    //   message: "User registered successfully",
    //   user: {
    //     id: newUser.id,
    //     fullName: newUser.fullName,
    //     email: newUser.email,
    //     role: newUser.role,
    //     createdAt: newUser.createdAt,
    //   },
    // });

    res.status(201).json({ access_token });
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /api/users
 * Body may contain any of { fullName, email, password }
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (!existing) {
      throw createHttpError.NotFound("User not found");
    }

    const { fullName, email, password } = req.body as {
      fullName?: unknown;
      email?: unknown;
      password?: unknown;
    };

    // Collect only the fields that actually changed
    const updates: Partial<{
      fullName: string;
      email: string;
      password: string;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (typeof fullName === "string" && fullName.trim() && fullName !== existing.fullName) {
      updates.fullName = fullName.trim();
    }

    if (typeof email === "string" && email.trim() && email !== existing.email) {
      // Check uniqueness
      const [collision] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim()));
      if (collision) {
        throw createHttpError.Conflict("Email is already in use");
      }
      updates.email = email.trim();
    }

    if (typeof password === "string") {
      if (password.length < 6) {
        throw createHttpError.BadRequest("Password must be at least 6 characters");
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    // If nothing but updatedAt is present, bail
    if (Object.keys(updates).length === 1) {
      res.status(200).json({ message: "Nothing to update" });
      return;
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        profileImage: users.profileImage,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};


export { createUser, updateUser };
