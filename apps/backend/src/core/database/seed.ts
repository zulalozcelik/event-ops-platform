import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { inArray } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { UserRole, type UserRole as UserRoleType } from '@event-ops/shared';
import { env } from '../../config/env';
import type {
  ChangedFieldsMap,
  EventComparableSnapshot,
} from '../../modules/events/types/event-change.type';
import {
  authCredentials,
  eventChangeLogs,
  events,
  notifications,
  registrations,
  users,
  waitlists,
  type EventRow,
  type NewAuthCredentialRow,
  type NewEventChangeLog,
  type NewEventRow,
  type NewNotification,
  type NewRegistrationRow,
  type NewUserRow,
} from './schema';

const DEMO_PASSWORD = 'Demo12345!';

const DEMO_EMAILS = [
  'organizer.demo@eventops.local',
  'mert.organizer@eventops.local',
  'attendee.demo@eventops.local',
  'can.attendee@eventops.local',
  'ayse.attendee@eventops.local',
];

const DEMO_EVENT_TITLES = [
  'Frontend Workshop: Building Clean Interfaces',
  'Backend API Design Session',
  'Career Talk: Preparing for Junior Developer Roles',
  'Data Integrity in Event Platforms',
  'Design Review Meetup',
  'Graduation Project Demo Rehearsal',
  'Summer Frontend Practice Lab',
  'API Testing and Swagger Review',
  'Portfolio Feedback Afternoon',
  'Final Project Presentation Clinic',
];

type DemoEmail = (typeof DEMO_EMAILS)[number];
type DemoEventTitle = (typeof DEMO_EVENT_TITLES)[number];
type DemoUserRole = Extract<UserRoleType, 'ORGANIZER' | 'ATTENDEE'>;
type EventStatus = NonNullable<NewEventRow['status']>;

interface DemoUserDefinition {
  name: string;
  email: DemoEmail;
  role: DemoUserRole;
}

interface DemoEventDefinition {
  title: DemoEventTitle;
  description: string;
  location: string;
  status: EventStatus;
  capacity: number;
  organizerEmail: DemoEmail;
  startDate: Date;
  endDate: Date;
}

interface SnapshotSource {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  status: string;
}

const demoUsers: DemoUserDefinition[] = [
  {
    name: 'Zeynep Demir',
    email: 'organizer.demo@eventops.local',
    role: UserRole.ORGANIZER,
  },
  {
    name: 'Mert Kaya',
    email: 'mert.organizer@eventops.local',
    role: UserRole.ORGANIZER,
  },
  {
    name: 'Elif Arslan',
    email: 'attendee.demo@eventops.local',
    role: UserRole.ATTENDEE,
  },
  {
    name: 'Can Yilmaz',
    email: 'can.attendee@eventops.local',
    role: UserRole.ATTENDEE,
  },
  {
    name: 'Ayse Celik',
    email: 'ayse.attendee@eventops.local',
    role: UserRole.ATTENDEE,
  },
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

function futureDate(daysFromNow: number, hour: number, minute = 0): Date {
  const result = addDays(new Date(), daysFromNow);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function buildEventDefinitions(): DemoEventDefinition[] {
  const frontendStart = futureDate(7, 14);
  const backendStart = futureDate(10, 13);
  const careerStart = futureDate(14, 11);
  const dataIntegrityStart = futureDate(18, 19);
  const designReviewStart = futureDate(21, 15);
  const rehearsalStart = futureDate(25, 10);
  const summerFrontendLabStart = futureDate(35, 14);
  const apiTestingStart = futureDate(48, 11);
  const portfolioFeedbackStart = futureDate(62, 15);
  const presentationClinicStart = futureDate(76, 10);

  return [
    {
      title: 'Frontend Workshop: Building Clean Interfaces',
      description:
        'A practical workshop about building readable and maintainable frontend pages with reusable components.',
      location: 'Istanbul Campus, Lab 204',
      status: 'PUBLISHED',
      capacity: 20,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: frontendStart,
      endDate: addMinutes(frontendStart, 120),
    },
    {
      title: 'Backend API Design Session',
      description:
        'A technical session about designing REST APIs, validation, authentication, and database access in a structured backend project.',
      location: 'Engineering Building, Room B12',
      status: 'PUBLISHED',
      capacity: 15,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: backendStart,
      endDate: addMinutes(backendStart, 120),
    },
    {
      title: 'Career Talk: Preparing for Junior Developer Roles',
      description:
        'A student friendly talk about portfolios, internships, CV preparation, and interview expectations for junior developer positions.',
      location: 'Conference Hall A',
      status: 'PUBLISHED',
      capacity: 30,
      organizerEmail: 'mert.organizer@eventops.local',
      startDate: careerStart,
      endDate: addMinutes(careerStart, 90),
    },
    {
      title: 'Data Integrity in Event Platforms',
      description:
        'A focused discussion on why event changes should be logged and how attendees should be notified when important details change.',
      location: 'Online',
      status: 'PUBLISHED',
      capacity: 12,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: dataIntegrityStart,
      endDate: addMinutes(dataIntegrityStart, 60),
    },
    {
      title: 'Design Review Meetup',
      description:
        'A small meetup for reviewing project interfaces, improving usability, and giving feedback on student projects.',
      location: 'Design Studio, Room 3',
      status: 'PUBLISHED',
      capacity: 8,
      organizerEmail: 'mert.organizer@eventops.local',
      startDate: designReviewStart,
      endDate: addMinutes(designReviewStart, 120),
    },
    {
      title: 'Graduation Project Demo Rehearsal',
      description:
        'A rehearsal event for students preparing to present their final software projects.',
      location: 'Istanbul Campus, Seminar Room',
      status: 'DRAFT',
      capacity: 10,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: rehearsalStart,
      endDate: addMinutes(rehearsalStart, 90),
    },
    {
      title: 'Summer Frontend Practice Lab',
      description:
        'A hands-on practice session for improving component structure, form validation, and page consistency in frontend projects.',
      location: 'Istanbul Campus, Lab 102',
      status: 'PUBLISHED',
      capacity: 18,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: summerFrontendLabStart,
      endDate: addMinutes(summerFrontendLabStart, 120),
    },
    {
      title: 'API Testing and Swagger Review',
      description:
        'A practical session about testing backend endpoints, reading Swagger documentation, and verifying protected routes before project presentation.',
      location: 'Engineering Building, Room B08',
      status: 'PUBLISHED',
      capacity: 16,
      organizerEmail: 'organizer.demo@eventops.local',
      startDate: apiTestingStart,
      endDate: addMinutes(apiTestingStart, 90),
    },
    {
      title: 'Portfolio Feedback Afternoon',
      description:
        'A small group event where students review portfolio pages, project descriptions, and junior developer application materials.',
      location: 'Career Center, Meeting Room 2',
      status: 'PUBLISHED',
      capacity: 12,
      organizerEmail: 'mert.organizer@eventops.local',
      startDate: portfolioFeedbackStart,
      endDate: addMinutes(portfolioFeedbackStart, 120),
    },
    {
      title: 'Final Project Presentation Clinic',
      description:
        'A rehearsal session for students preparing their final project explanation, demo flow, and technical Q&A answers.',
      location: 'Conference Hall B',
      status: 'PUBLISHED',
      capacity: 20,
      organizerEmail: 'mert.organizer@eventops.local',
      startDate: presentationClinicStart,
      endDate: addMinutes(presentationClinicStart, 120),
    },
  ];
}

function buildSnapshot(source: SnapshotSource): EventComparableSnapshot {
  return {
    title: source.title,
    description: source.description,
    location: source.location,
    startAt: source.startDate.toISOString(),
    endAt: source.endDate.toISOString(),
    capacity: source.capacity,
    status: source.status,
  };
}

function requireMapValue<K, V>(
  map: ReadonlyMap<K, V>,
  key: K,
  label: string,
): V {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Missing seeded ${label}: ${String(key)}`);
  }

  return value;
}

async function main(): Promise<void> {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    console.log('Seeding Event Ops demo data...');

    const existingDemoUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.email, DEMO_EMAILS));
    const existingDemoEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(inArray(events.title, DEMO_EVENT_TITLES));

    const existingUserIds = existingDemoUsers.map((user) => user.id);
    const existingEventIds = existingDemoEvents.map((event) => event.id);

    if (existingUserIds.length > 0) {
      await db
        .delete(notifications)
        .where(inArray(notifications.userId, existingUserIds));
      await db
        .delete(eventChangeLogs)
        .where(inArray(eventChangeLogs.changedByUserId, existingUserIds));
      await db
        .delete(registrations)
        .where(inArray(registrations.userId, existingUserIds));
      await db.delete(waitlists).where(inArray(waitlists.userId, existingUserIds));
      await db
        .delete(authCredentials)
        .where(inArray(authCredentials.userId, existingUserIds));
    }

    if (existingEventIds.length > 0) {
      await db
        .delete(notifications)
        .where(inArray(notifications.eventId, existingEventIds));
      await db
        .delete(eventChangeLogs)
        .where(inArray(eventChangeLogs.eventId, existingEventIds));
      await db
        .delete(registrations)
        .where(inArray(registrations.eventId, existingEventIds));
      await db
        .delete(waitlists)
        .where(inArray(waitlists.eventId, existingEventIds));
      await db.delete(events).where(inArray(events.id, existingEventIds));
    }

    await db.delete(users).where(inArray(users.email, DEMO_EMAILS));

    console.log('Old demo records removed.');

    const insertedUsers = await db
      .insert(users)
      .values(
        demoUsers.map(
          (user): NewUserRow => ({
            name: user.name,
            email: user.email,
            role: user.role,
          }),
        ),
      )
      .returning();

    const credentialRows: NewAuthCredentialRow[] = await Promise.all(
      insertedUsers.map(async (user) => ({
        userId: user.id,
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      })),
    );

    await db.insert(authCredentials).values(credentialRows);

    console.log(`Inserted ${insertedUsers.length} demo users.`);

    const userByEmail = new Map(
      insertedUsers.map((user) => [user.email, user]),
    );
    const demoEventDefinitions = buildEventDefinitions();

    const insertedEvents = await db
      .insert(events)
      .values(
        demoEventDefinitions.map(
          (event): NewEventRow => ({
            title: event.title,
            description: event.description,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            capacity: event.capacity,
            status: event.status,
            organizerId: requireMapValue(
              userByEmail,
              event.organizerEmail,
              'organizer',
            ).id,
          }),
        ),
      )
      .returning();

    console.log(`Inserted ${insertedEvents.length} demo events.`);

    const eventByTitle = new Map(
      insertedEvents.map((event) => [event.title, event]),
    );

    const registrationPairs: Array<{
      eventTitle: DemoEventTitle;
      attendeeEmail: DemoEmail;
    }> = [
      {
        eventTitle: 'Frontend Workshop: Building Clean Interfaces',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Frontend Workshop: Building Clean Interfaces',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Frontend Workshop: Building Clean Interfaces',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'Backend API Design Session',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Backend API Design Session',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Career Talk: Preparing for Junior Developer Roles',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Career Talk: Preparing for Junior Developer Roles',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Career Talk: Preparing for Junior Developer Roles',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'Data Integrity in Event Platforms',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Data Integrity in Event Platforms',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'Design Review Meetup',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Design Review Meetup',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'Summer Frontend Practice Lab',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Summer Frontend Practice Lab',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'API Testing and Swagger Review',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'API Testing and Swagger Review',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Portfolio Feedback Afternoon',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Portfolio Feedback Afternoon',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
      {
        eventTitle: 'Final Project Presentation Clinic',
        attendeeEmail: 'attendee.demo@eventops.local',
      },
      {
        eventTitle: 'Final Project Presentation Clinic',
        attendeeEmail: 'can.attendee@eventops.local',
      },
      {
        eventTitle: 'Final Project Presentation Clinic',
        attendeeEmail: 'ayse.attendee@eventops.local',
      },
    ];

    const registrationRows = registrationPairs.map(
      (pair): NewRegistrationRow => ({
        eventId: requireMapValue(eventByTitle, pair.eventTitle, 'event').id,
        userId: requireMapValue(userByEmail, pair.attendeeEmail, 'attendee').id,
      }),
    );

    await db.insert(registrations).values(registrationRows);

    console.log(`Inserted ${registrationRows.length} demo registrations.`);

    const frontendWorkshop = requireMapValue(
      eventByTitle,
      'Frontend Workshop: Building Clean Interfaces',
      'event',
    );
    const careerTalk = requireMapValue(
      eventByTitle,
      'Career Talk: Preparing for Junior Developer Roles',
      'event',
    );
    const dataIntegrity = requireMapValue(
      eventByTitle,
      'Data Integrity in Event Platforms',
      'event',
    );

    const zeynep = requireMapValue(
      userByEmail,
      'organizer.demo@eventops.local',
      'user',
    );
    const mert = requireMapValue(
      userByEmail,
      'mert.organizer@eventops.local',
      'user',
    );

    const careerBeforeStart = addMinutes(careerTalk.startDate, -30);
    const careerBeforeEnd = addMinutes(careerTalk.endDate, -30);

    const changeLogs: NewEventChangeLog[] = [
      {
        eventId: dataIntegrity.id,
        changedByUserId: zeynep.id,
        beforeData: buildSnapshot({
          ...dataIntegrity,
          location: 'Room C10',
        }),
        afterData: buildSnapshot(dataIntegrity),
        changedFields: {
          location: {
            before: 'Room C10',
            after: dataIntegrity.location,
          },
        } satisfies ChangedFieldsMap,
        notificationCreated: true,
      },
      {
        eventId: frontendWorkshop.id,
        changedByUserId: zeynep.id,
        beforeData: buildSnapshot({
          ...frontendWorkshop,
          capacity: 15,
        }),
        afterData: buildSnapshot(frontendWorkshop),
        changedFields: {
          capacity: {
            before: 15,
            after: frontendWorkshop.capacity,
          },
        } satisfies ChangedFieldsMap,
        notificationCreated: true,
      },
      {
        eventId: careerTalk.id,
        changedByUserId: mert.id,
        beforeData: buildSnapshot({
          ...careerTalk,
          startDate: careerBeforeStart,
          endDate: careerBeforeEnd,
        }),
        afterData: buildSnapshot(careerTalk),
        changedFields: {
          startAt: {
            before: careerBeforeStart.toISOString(),
            after: careerTalk.startDate.toISOString(),
          },
        } satisfies ChangedFieldsMap,
        notificationCreated: true,
      },
    ];

    await db.insert(eventChangeLogs).values(changeLogs);

    console.log(`Inserted ${changeLogs.length} demo change logs.`);

    const notificationRows: NewNotification[] = [
      ...buildNotificationsForEvent({
        event: dataIntegrity,
        userByEmail,
        attendeeEmails: [
          'attendee.demo@eventops.local',
          'ayse.attendee@eventops.local',
        ],
        message:
          'The location for Data Integrity in Event Platforms was changed to Online.',
      }),
      ...buildNotificationsForEvent({
        event: frontendWorkshop,
        userByEmail,
        attendeeEmails: [
          'attendee.demo@eventops.local',
          'can.attendee@eventops.local',
          'ayse.attendee@eventops.local',
        ],
        message:
          'The capacity for Frontend Workshop: Building Clean Interfaces was updated.',
        firstNotificationRead: true,
      }),
      ...buildNotificationsForEvent({
        event: careerTalk,
        userByEmail,
        attendeeEmails: [
          'attendee.demo@eventops.local',
          'can.attendee@eventops.local',
          'ayse.attendee@eventops.local',
        ],
        message:
          'The start time for Career Talk: Preparing for Junior Developer Roles was updated.',
      }),
    ];

    await db.insert(notifications).values(notificationRows);

    console.log(`Inserted ${notificationRows.length} demo notifications.`);
    console.log('Seed completed successfully.');
  } finally {
    await client.end();
  }
}

function buildNotificationsForEvent(input: {
  event: EventRow;
  userByEmail: ReadonlyMap<string, { id: string }>;
  attendeeEmails: DemoEmail[];
  message: string;
  firstNotificationRead?: boolean;
}): NewNotification[] {
  return input.attendeeEmails.map((email, index) => ({
    userId: requireMapValue(input.userByEmail, email, 'attendee').id,
    eventId: input.event.id,
    type: 'EVENT_UPDATED',
    title: 'Event details updated',
    message: input.message,
    isRead: Boolean(input.firstNotificationRead && index === 0),
  }));
}

void main().catch((error: unknown) => {
  console.error('Seed failed.');
  console.error(error);
  process.exitCode = 1;
});
