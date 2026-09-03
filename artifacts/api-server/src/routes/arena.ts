import { Router, type IRouter } from "express";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import {
  CreateBlockedSlotBody,
  CreateBlockedSlotResponse,
  CreateLeadBody,
  CreateLeadResponse,
  CreateReservationBody,
  CreateReservationResponse,
  DeleteBlockedSlotParams,
  GetAdminSummaryResponse,
  ListAvailabilityQueryParams,
  ListAvailabilityResponse,
  ListFacilitiesResponse,
  ListReservationsQueryParams,
  ListReservationsResponse,
  ListBlockedSlotsResponse,
  UpdateReservationBody,
  UpdateReservationParams,
  UpdateReservationResponse,
} from "@workspace/api-zod";
import {
  blockedSlotsTable,
  db,
  leadsTable,
  reservationsTable,
} from "@workspace/db";

const router: IRouter = Router();

const facilities = [
  {
    id: 1,
    name: "Campo Society 01",
    shortName: "Society 01",
    description: "Grama sintética profissional para jogar com a sua turma.",
    priceCents: 15000,
    accent: "lime",
    capacity: 14,
  },
  {
    id: 2,
    name: "Campo Society 02",
    shortName: "Society 02",
    description: "Mais espaço para campeonatos, treinos e peladas.",
    priceCents: 15000,
    accent: "gold",
    capacity: 14,
  },
  {
    id: 3,
    name: "Quadra de Areia",
    shortName: "Areia",
    description: "Vôlei e futevôlei com clima de praia no coração da cidade.",
    priceCents: 8000,
    accent: "sand",
    capacity: 12,
  },
];

const slots = Array.from({ length: 16 }, (_, index) => {
  const hour = index + 7;
  return {
    startTime: `${String(hour).padStart(2, "0")}:00`,
    endTime: `${String(hour + 1).padStart(2, "0")}:00`,
  };
});

function facilityById(id: number) {
  return facilities.find((facility) => facility.id === id);
}

function reservationResponse(
  reservation: typeof reservationsTable.$inferSelect,
) {
  const facility = facilityById(reservation.facilityId);
  return {
    ...reservation,
    facilityName: facility?.name ?? "Espaço esportivo",
  };
}

function calendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

router.get("/facilities", (_req, res): void => {
  res.json(ListFacilitiesResponse.parse(facilities));
});

router.get("/availability", async (req, res): Promise<void> => {
  const parsed = ListAvailabilityQueryParams.safeParse({
    ...req.query,
    date: new Date(String(req.query.date)),
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { facilityId } = parsed.data;
  const date = calendarDate(parsed.data.date);
  const selectedFacilities = facilityId
    ? facilities.filter((facility) => facility.id === facilityId)
    : facilities;

  if (!selectedFacilities.length) {
    res.status(400).json({ error: "Espaço esportivo não encontrado." });
    return;
  }

  const [reservations, blockedSlots] = await Promise.all([
    db
      .select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.date, date),
          facilityId ? eq(reservationsTable.facilityId, facilityId) : undefined,
        ),
      ),
    db
      .select()
      .from(blockedSlotsTable)
      .where(
        and(
          eq(blockedSlotsTable.date, date),
          facilityId ? eq(blockedSlotsTable.facilityId, facilityId) : undefined,
        ),
      ),
  ]);

  const availability = selectedFacilities.flatMap((facility) =>
    slots.map((slot) => {
      const reservation = reservations.find(
        (item) =>
          item.facilityId === facility.id &&
          item.startTime === slot.startTime &&
          item.status !== "cancelled",
      );
      const blocked = blockedSlots.find(
        (item) =>
          item.facilityId === facility.id && item.startTime === slot.startTime,
      );

      return {
        facilityId: facility.id,
        date,
        ...slot,
        status: reservation ? "reserved" : blocked ? "blocked" : "available",
        reservationId: reservation?.id ?? null,
      };
    }),
  );

  res.json(ListAvailabilityResponse.parse(availability));
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db.insert(leadsTable).values(parsed.data).returning();
  res.status(201).json(CreateLeadResponse.parse(lead));
});

router.get("/reservations", async (req, res): Promise<void> => {
  const parsed = ListReservationsQueryParams.safeParse({
    ...req.query,
    ...(req.query.from ? { from: new Date(String(req.query.from)) } : {}),
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions = [
    parsed.data.from
      ? gte(reservationsTable.date, calendarDate(parsed.data.from))
      : undefined,
    parsed.data.status
      ? eq(reservationsTable.status, parsed.data.status)
      : undefined,
  ].filter(Boolean);

  const reservations = await db
    .select()
    .from(reservationsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(reservationsTable.date, reservationsTable.startTime);

  res.json(ListReservationsResponse.parse(reservations.map(reservationResponse)));
});

router.post("/reservations", async (req, res): Promise<void> => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const facility = facilityById(parsed.data.facilityId);
  if (!facility) {
    res.status(400).json({ error: "Espaço esportivo não encontrado." });
    return;
  }

  const [reservation, existingBlock] = await Promise.all([
    db
      .select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.facilityId, parsed.data.facilityId),
          eq(reservationsTable.date, calendarDate(parsed.data.date)),
          eq(reservationsTable.startTime, parsed.data.startTime),
        ),
      ),
    db
      .select()
      .from(blockedSlotsTable)
      .where(
        and(
          eq(blockedSlotsTable.facilityId, parsed.data.facilityId),
          eq(blockedSlotsTable.date, calendarDate(parsed.data.date)),
          eq(blockedSlotsTable.startTime, parsed.data.startTime),
        ),
      ),
  ]);

  if (
    reservation.some((item) => item.status !== "cancelled") ||
    existingBlock.length
  ) {
    res.status(409).json({ error: "Este horário não está mais disponível." });
    return;
  }

  const [lead] = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.email, parsed.data.customerEmail))
    .limit(1);

  if (!lead) {
    await db.insert(leadsTable).values({
      name: parsed.data.customerName,
      phone: parsed.data.customerPhone,
      email: parsed.data.customerEmail,
    });
  }

  const [created] = await db
    .insert(reservationsTable)
    .values({
      ...parsed.data,
      date: calendarDate(parsed.data.date),
      priceCents: facility.priceCents,
      status: "confirmed",
    })
    .returning();

  res.status(201).json(
    CreateReservationResponse.parse(reservationResponse(created)),
  );
});

router.patch("/reservations/:id", async (req, res): Promise<void> => {
  const params = UpdateReservationParams.safeParse(req.params);
  const body = UpdateReservationBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ error: "Dados da reserva inválidos." });
    return;
  }

  const [reservation] = await db
    .update(reservationsTable)
    .set({ status: body.data.status })
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reserva não encontrada." });
    return;
  }

  res.json(UpdateReservationResponse.parse(reservationResponse(reservation)));
});

router.get("/admin/summary", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [todayResult, monthResult, customersResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.date, today),
          eq(reservationsTable.status, "confirmed"),
        ),
      ),
    db
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`coalesce(sum(${reservationsTable.priceCents}), 0)`,
      })
      .from(reservationsTable)
      .where(
        and(
          gte(reservationsTable.date, monthStart),
          eq(reservationsTable.status, "confirmed"),
        ),
      ),
    db
      .select({ count: sql<number>`count(distinct ${leadsTable.email})` })
      .from(leadsTable),
  ]);

  res.json(
    GetAdminSummaryResponse.parse({
      reservationsToday: Number(todayResult[0]?.count ?? 0),
      confirmedThisMonth: Number(monthResult[0]?.count ?? 0),
      expectedRevenueCents: Number(monthResult[0]?.revenue ?? 0),
      activeCustomers: Number(customersResult[0]?.count ?? 0),
    }),
  );
});

router.get("/blocked-slots", async (_req, res): Promise<void> => {
  const blockedSlots = await db
    .select()
    .from(blockedSlotsTable)
    .orderBy(blockedSlotsTable.date, blockedSlotsTable.startTime);
  res.json(ListBlockedSlotsResponse.parse(blockedSlots));
});

router.post("/blocked-slots", async (req, res): Promise<void> => {
  const parsed = CreateBlockedSlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existingReservation, existingBlock] = await Promise.all([
    db
      .select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.facilityId, parsed.data.facilityId),
          eq(reservationsTable.date, calendarDate(parsed.data.date)),
          eq(reservationsTable.startTime, parsed.data.startTime),
          eq(reservationsTable.status, "confirmed"),
        ),
      ),
    db
      .select()
      .from(blockedSlotsTable)
      .where(
        and(
          eq(blockedSlotsTable.facilityId, parsed.data.facilityId),
          eq(blockedSlotsTable.date, calendarDate(parsed.data.date)),
          eq(blockedSlotsTable.startTime, parsed.data.startTime),
        ),
      ),
  ]);

  if (existingReservation.length || existingBlock.length) {
    res.status(409).json({ error: "Este horário já está ocupado." });
    return;
  }

  const [blockedSlot] = await db
    .insert(blockedSlotsTable)
    .values({
      ...parsed.data,
      date: calendarDate(parsed.data.date),
    })
    .returning();
  res.status(201).json(CreateBlockedSlotResponse.parse(blockedSlot));
});

router.delete("/blocked-slots/:id", async (req, res): Promise<void> => {
  const parsed = DeleteBlockedSlotParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(blockedSlotsTable)
    .where(eq(blockedSlotsTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Bloqueio não encontrado." });
    return;
  }

  res.sendStatus(204);
});

export default router;