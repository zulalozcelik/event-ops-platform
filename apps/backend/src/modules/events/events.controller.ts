import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import {
  getEventsQuerySchema,
  type GetEventsQueryDto,
} from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/common/guards/optional-jwt-auth.guard';
import type {
  RequestWithOptionalUser,
  RequestWithUser,
} from '@/common/types/authenticated-request.type';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Create event',
    description: 'Creates a new event for the authenticated organizer or admin.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'description',
        'location',
        'startDate',
        'endDate',
        'capacity',
      ],
      properties: {
        title: { type: 'string', example: 'Product Launch Meetup' },
        description: { type: 'string', example: 'A live event for product updates.' },
        location: { type: 'string', example: 'Istanbul' },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-10T18:00:00.000Z',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-10T20:00:00.000Z',
        },
        capacity: { type: 'integer', example: 100 },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
          example: 'PUBLISHED',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Event created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(@Body() body: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventsService.createEvent(body, req.user.id, req.user.role);
  }

  @ApiOperation({
    summary: 'List events',
    description:
      'Returns published events. You can optionally filter by search text, location, and date.',
  })
  @ApiOkResponse({ description: 'Event list returned successfully.' })
  @Get()
  async getEvents(@Query() query: Record<string, string | undefined>) {
    const filters: GetEventsQueryDto = getEventsQuerySchema.parse(query);

    return this.eventsService.getPublishedEvents(filters);
  }

  @ApiOperation({
    summary: 'Get event detail',
    description:
      'Returns event detail together with registration summary. If the request is authenticated, currentUserRegistrationState is also personalized.',
  })
  @ApiOkResponse({ description: 'Event detail returned successfully.' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getEvent(@Param('id') id: string, @Req() req: RequestWithOptionalUser) {
    return this.eventsService.getEventDetailResponse(id, req.user?.id);
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update event',
    description: 'Updates an existing event owned by the organizer or admin.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Event Title' },
        description: { type: 'string', example: 'Updated event description.' },
        location: { type: 'string', example: 'Ankara' },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-10T19:00:00.000Z',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-10T21:00:00.000Z',
        },
        capacity: { type: 'integer', example: 120 },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
          example: 'PUBLISHED',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Event updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
    @Req() req: RequestWithUser,
  ) {
    return this.eventsService.updateEvent(id, body, req.user.id, req.user.role);
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Cancel event',
    description: 'Cancels an event owned by the organizer or admin.',
  })
  @ApiOkResponse({ description: 'Event cancelled successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancelEvent(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventsService.cancelEvent(id, req.user.id, req.user.role);
  }
}
