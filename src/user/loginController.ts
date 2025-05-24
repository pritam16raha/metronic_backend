import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        createHttpError.BadRequest("Email and password are required")
      );
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return next(createHttpError.Unauthorized("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError.Unauthorized("Invalid email or password"));
    }

    const access_token = sign({ sub: user.id }, config.jwtSecret as string, {
      expiresIn: "1h",
    });

    res.json({ access_token });
  } catch (err) {
    next(err);
  }
};
