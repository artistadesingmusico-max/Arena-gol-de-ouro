import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { date, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const reservationsTable = pgTable(
  "arena_reservations",
  {
    id: serial("id").primaryKey(),
    facilityId: integer("facility_id").notNull(),
    court: integer("court").notNull().default(1),
    date: date("date", { mode: "string" }).notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email").notNull(),
    paymentMethod: text("payment_method").notNull(),
    priceCents: integer("price_cents").notNull(),
    status: text("status").notNull().default("pending"),
    bookingCode: text("booking_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uniq_active_reservation_slot")
      .on(table.facilityId, table.court, table.date, table.startTime)
      .where(sql`${table.status} <> 'cancelled'`),
  ],
);

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
