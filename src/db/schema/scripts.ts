import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key relation to users
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
