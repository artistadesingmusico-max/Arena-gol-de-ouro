import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const blockedSlotsTable = pgTable("arena_blocked_slots", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull(),
  court: integer("court").notNull().default(1),
  date: date("date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlockedSlotSchema = createInsertSchema(blockedSlotsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBlockedSlot = z.infer<typeof insertBlockedSlotSchema>;
export type BlockedSlot = typeof blockedSlotsTable.$inferSelect;