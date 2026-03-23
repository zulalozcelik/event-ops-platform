import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '@/core/database/database.constants';
import type {
  DrizzleDatabase,
  DrizzleTransaction,
} from '@/core/database/database.types';
import { events, registrations, waitlists } from '@/core/database/schema';
import {
  IRegistrationRepository,
  RegisterOrWaitlistInput,
} from './registration.repository.interface';
import type { UserRegistrationSummary } from '../types/registration-attendee.type';
import type {
  CancelRegistrationResult,
  CurrentUserRegistrationState,
  EventRegistrationSummary,
  RegistrationResult,
} from '../types/registration-flow.type';
import { RegistrationConflictError } from '../types/registration-flow.type';

@Injectable()
export class DrizzleRegistrationsRepository implements IRegistrationRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  public async registerOrWaitlist(
    data: RegisterOrWaitlistInput,
  ): Promise<RegistrationResult> {
    return this.db.transaction(async (tx) => {
      await this.lockEventRow(tx, data.eventId);

      const existingRegistration = await this.findRegistrationId(
        tx,
        data.eventId,
        data.userId,
      );

      if (existingRegistration) {
        throw new RegistrationConflictError('REGISTERED');
      }

      const existingWaitlist = await this.findWaitlistId(
        tx,
        data.eventId,
        data.userId,
      );

      if (existingWaitlist) {
        throw new RegistrationConflictError('WAITLISTED');
      }

      const registeredCount = await this.countRegistrationsByEventId(
        tx,
        data.eventId,
      );

      if (registeredCount < data.capacity) {
        const [createdRegistration] = await tx
          .insert(registrations)
          .values({
            eventId: data.eventId,
            userId: data.userId,
          })
          .returning({ id: registrations.id });

        if (!createdRegistration) {
          throw new Error('Registration could not be created');
        }

        return {
          action: 'REGISTERED',
          eventId: data.eventId,
          userId: data.userId,
          registrationId: createdRegistration.id,
        };
      }

      const [createdWaitlistEntry] = await tx
        .insert(waitlists)
        .values({
          eventId: data.eventId,
          userId: data.userId,
        })
        .returning({ id: waitlists.id });

      if (!createdWaitlistEntry) {
        throw new Error('Waitlist entry could not be created');
      }

      return {
        action: 'WAITLISTED',
        eventId: data.eventId,
        userId: data.userId,
        waitlistId: createdWaitlistEntry.id,
      };
    });
  }

  public async cancelForEvent(
    eventId: string,
    userId: string,
  ): Promise<CancelRegistrationResult | null> {
    return this.db.transaction(async (tx) => {
      await this.lockEventRow(tx, eventId);

      const [deletedRegistration] = await tx
        .delete(registrations)
        .where(
          and(eq(registrations.eventId, eventId), eq(registrations.userId, userId)),
        )
        .returning({ id: registrations.id });

      if (deletedRegistration) {
        const [nextWaitlistEntry] = await tx
          .select({
            id: waitlists.id,
            userId: waitlists.userId,
          })
          .from(waitlists)
          .where(eq(waitlists.eventId, eventId))
          .orderBy(asc(waitlists.createdAt), asc(waitlists.id))
          .limit(1);

        if (!nextWaitlistEntry) {
          return {
            action: 'REGISTRATION_CANCELLED',
            eventId,
            userId,
            registrationId: deletedRegistration.id,
            promotedRegistration: null,
          };
        }

        const [removedWaitlistEntry] = await tx
          .delete(waitlists)
          .where(eq(waitlists.id, nextWaitlistEntry.id))
          .returning({
            id: waitlists.id,
            userId: waitlists.userId,
          });

        if (!removedWaitlistEntry) {
          throw new Error('Waitlist entry could not be removed');
        }

        const [promotedRegistration] = await tx
          .insert(registrations)
          .values({
            eventId,
            userId: removedWaitlistEntry.userId,
          })
          .returning({ id: registrations.id });

        if (!promotedRegistration) {
          throw new Error('Waitlist user could not be promoted');
        }

        return {
          action: 'REGISTRATION_CANCELLED',
          eventId,
          userId,
          registrationId: deletedRegistration.id,
          promotedRegistration: {
            registrationId: promotedRegistration.id,
            waitlistId: removedWaitlistEntry.id,
            userId: removedWaitlistEntry.userId,
          },
        };
      }

      const [deletedWaitlistEntry] = await tx
        .delete(waitlists)
        .where(and(eq(waitlists.eventId, eventId), eq(waitlists.userId, userId)))
        .returning({ id: waitlists.id });

      if (!deletedWaitlistEntry) {
        return null;
      }

      return {
        action: 'WAITLIST_LEFT',
        eventId,
        userId,
        waitlistId: deletedWaitlistEntry.id,
        promotedRegistration: null,
      };
    });
  }

  public async existsByEventIdAndUserId(
    eventId: string,
    userId: string,
  ): Promise<boolean> {
    const rows = await this.db
      .select({ id: registrations.id })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.userId, userId),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  public async existsInWaitlistByEventIdAndUserId(
    eventId: string,
    userId: string,
  ): Promise<boolean> {
    const rows = await this.db
      .select({ id: waitlists.id })
      .from(waitlists)
      .where(and(eq(waitlists.eventId, eventId), eq(waitlists.userId, userId)))
      .limit(1);

    return rows.length > 0;
  }

  public async countByEventId(eventId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(registrations)
      .where(eq(registrations.eventId, eventId));

    return result[0]?.count || 0;
  }

  public async countWaitlistByEventId(eventId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(waitlists)
      .where(eq(waitlists.eventId, eventId));

    return result[0]?.count || 0;
  }

  public async getEventRegistrationSummary(
    eventId: string,
    userId?: string,
  ): Promise<EventRegistrationSummary> {
    const [eventRow, registeredCount, waitlistCount, currentUserState] =
      await Promise.all([
        this.db
          .select({ capacity: events.capacity })
          .from(events)
          .where(eq(events.id, eventId))
          .limit(1),
        this.countByEventId(eventId),
        this.countWaitlistByEventId(eventId),
        this.getCurrentUserRegistrationState(eventId, userId),
      ]);

    const event = eventRow[0];

    if (!event) {
      throw new Error('Event not found while building registration summary');
    }

    return {
      eventId,
      registeredCount,
      waitlistCount,
      remainingCapacity: Math.max(event.capacity - registeredCount, 0),
      currentUserRegistrationState: currentUserState,
    };
  }

  public async findMine(userId: string): Promise<UserRegistrationSummary[]> {
    const registrationRows = await this.db
      .select({
        id: registrations.id,
        state: sql<'REGISTERED'>`'REGISTERED'`,
        createdAt: registrations.createdAt,
        event: {
          id: events.id,
          title: events.title,
          location: events.location,
          startDate: events.startDate,
          status: events.status,
        },
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.userId, userId))
      .orderBy(desc(registrations.createdAt));

    const waitlistRows = await this.db
      .select({
        id: waitlists.id,
        state: sql<'WAITLISTED'>`'WAITLISTED'`,
        createdAt: waitlists.createdAt,
        event: {
          id: events.id,
          title: events.title,
          location: events.location,
          startDate: events.startDate,
          status: events.status,
        },
      })
      .from(waitlists)
      .innerJoin(events, eq(waitlists.eventId, events.id))
      .where(eq(waitlists.userId, userId))
      .orderBy(desc(waitlists.createdAt));

    return [...registrationRows, ...waitlistRows].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  public async countTotalForOrganizerEvents(
    organizerId: string,
  ): Promise<number> {
    const result = await this.db
      .select({ count: count(registrations.id) })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(events.organizerId, organizerId));

    return result[0]?.count || 0;
  }

  public async findAttendeeUserIdsByEventId(
    eventId: string,
  ): Promise<{ userId: string }[]> {
    const rows = await this.db
      .select({
        userId: registrations.userId,
      })
      .from(registrations)
      .where(eq(registrations.eventId, eventId));

    return rows.map((row) => ({ userId: row.userId }));
  }

  private async lockEventRow(
    tx: DrizzleTransaction,
    eventId: string,
  ): Promise<void> {
    await tx.execute(sql`select id from events where id = ${eventId} for update`);
  }

  private async findRegistrationId(
    tx: DrizzleTransaction,
    eventId: string,
    userId: string,
  ): Promise<string | null> {
    const rows = await tx
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(eq(registrations.eventId, eventId), eq(registrations.userId, userId)))
      .limit(1);

    return rows[0]?.id ?? null;
  }

  private async findWaitlistId(
    tx: DrizzleTransaction,
    eventId: string,
    userId: string,
  ): Promise<string | null> {
    const rows = await tx
      .select({ id: waitlists.id })
      .from(waitlists)
      .where(and(eq(waitlists.eventId, eventId), eq(waitlists.userId, userId)))
      .limit(1);

    return rows[0]?.id ?? null;
  }

  private async countRegistrationsByEventId(
    tx: DrizzleTransaction,
    eventId: string,
  ): Promise<number> {
    const result = await tx
      .select({ count: count() })
      .from(registrations)
      .where(eq(registrations.eventId, eventId));

    return result[0]?.count || 0;
  }

  private async getCurrentUserRegistrationState(
    eventId: string,
    userId?: string,
  ): Promise<CurrentUserRegistrationState> {
    if (!userId) {
      return 'NONE';
    }

    const isRegistered = await this.existsByEventIdAndUserId(eventId, userId);

    if (isRegistered) {
      return 'REGISTERED';
    }

    const isWaitlisted = await this.existsInWaitlistByEventIdAndUserId(
      eventId,
      userId,
    );

    if (isWaitlisted) {
      return 'WAITLISTED';
    }

    return 'NONE';
  }
}
