import { Event } from '../entities/event.entity';

export interface CreateEventRepositoryInput {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  organizerId: string;
}

export interface UpdateEventRepositoryInput {
  title?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

export interface IEventRepository {
  create(data: CreateEventRepositoryInput): Promise<Event>;
  findAllPublishedOrVisible(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  findByIdForOrganizer(id: string, organizerId: string): Promise<Event | null>;
  update(id: string, data: UpdateEventRepositoryInput): Promise<Event>;
  cancel(id: string): Promise<Event>;
  countByOrganizerId(organizerId: string): Promise<number>;
  findUpcomingByOrganizerId(
    organizerId: string,
    limit: number,
  ): Promise<Event[]>;
}
