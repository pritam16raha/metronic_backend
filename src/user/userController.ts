import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

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

    const token = sign({ sub: newUser.id }, config.jwtSecret as string, {
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

    res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
};

export { createUser };
