import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, ilike, lte, ne, or } from 'drizzle-orm';
import { DRIZZLE_DB } from '@/core/database/database.constants';
import type { DrizzleDatabase } from '@/core/database/database.types';
import { events } from '../../../core/database/schema';
import { Event } from '../entities/event.entity';
import {
  CreateEventRepositoryInput,
  FindPublishedEventsFilters,
  IEventRepository,
  UpdateEventRepositoryInput,
} from './event.repository.interface';
import { EventMapper } from './event.mapper';

@Injectable()
export class DrizzleEventsRepository implements IEventRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  public async create(data: CreateEventRepositoryInput): Promise<Event> {
    const rows = await this.db.insert(events).values(data).returning();

    const createdEvent = rows[0];

    if (!createdEvent) {
      throw new Error('Event could not be created');
    }

    return EventMapper.toDomain(createdEvent);
  }

  public async findAllPublishedOrVisible(
    filters?: FindPublishedEventsFilters,
  ): Promise<Event[]> {
    const whereConditions = [eq(events.status, 'PUBLISHED')];

    if (filters?.search) {
      whereConditions.push(this.buildSearchCondition(filters.search));
    }

    if (filters?.location) {
      whereConditions.push(
        ilike(
          events.location,
          `%${this.escapeLikeValue(filters.location)}%`,
        ),
      );
    }

    if (filters?.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);

      whereConditions.push(lte(events.startDate, endOfDay));
      whereConditions.push(gte(events.endDate, startOfDay));
    }

    const rows = await this.db
      .select()
      .from(events)
      .where(and(...whereConditions))
      .orderBy(desc(events.startDate), desc(events.createdAt));

    return rows.map(EventMapper.toDomain);
  }

  public async findById(id: string): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    const event = rows[0];
    if (!event) return null;

    return EventMapper.toDomain(event);
  }

  public async findByIdForOrganizer(
    id: string,
    organizerId: string,
  ): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.organizerId, organizerId)))
      .limit(1);

    const event = rows[0];
    if (!event) return null;

    return EventMapper.toDomain(event);
  }

  public async update(
    id: string,
    data: UpdateEventRepositoryInput,
  ): Promise<Event> {
    const rows = await this.db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    const updatedEvent = rows[0];
    if (!updatedEvent) {
      throw new Error('Event could not be updated');
    }

    return EventMapper.toDomain(updatedEvent);
  }

  public async cancel(id: string): Promise<Event> {
    const rows = await this.db
      .update(events)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    const event = rows[0];
    if (!event) {
      throw new Error('Event could not be cancelled');
    }

    return EventMapper.toDomain(event);
  }

  public async countByOrganizerId(organizerId: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizerId, organizerId),
          ne(events.status, 'CANCELLED'),
        ),
      );

    return rows.length;
  }

  public async findUpcomingByOrganizerId(
    organizerId: string,
    limit: number,
  ): Promise<Event[]> {
    const rows = await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizerId, organizerId),
          gte(events.startDate, new Date()),
          ne(events.status, 'CANCELLED'),
        ),
      )
      .orderBy(events.startDate)
      .limit(limit);

    return rows.map(EventMapper.toDomain);
  }

  private buildSearchCondition(search: string) {
    const normalizedSearch = `%${this.escapeLikeValue(search)}%`;

    const condition = or(
      ilike(events.title, normalizedSearch),
      ilike(events.description, normalizedSearch),
    );

    return condition!;
  }

  private escapeLikeValue(value: string): string {
    return value.replace(/[%_]/g, '\\$&');
  }
}
