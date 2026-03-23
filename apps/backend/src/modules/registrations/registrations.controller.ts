import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { EventsService } from '../events/events.service';
import type { RequestWithUser } from '@/common/types/authenticated-request.type';

@ApiTags('Registrations')
@Controller()
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly eventsService: EventsService,
  ) {}

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Register for an event',
    description:
      'Registers the current user if capacity is available. If the event is full, the same endpoint adds the user to the waitlist instead.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['eventId'],
      properties: {
        eventId: {
          type: 'string',
          format: 'uuid',
          example: '11111111-1111-1111-1111-111111111111',
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Returns whether the user was registered directly or added to the waitlist.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Post('registrations')
  async createRegistration(
    @Body() body: CreateRegistrationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.registrationsService.createRegistration(body, req.user.id);
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Cancel registration or leave waitlist',
    description:
      'Cancels the current user registration for the event. If the user is in the waitlist instead, this endpoint removes the waitlist entry.',
  })
  @ApiOkResponse({
    description:
      'Returns whether the user left a registration or a waitlist entry, and whether a waitlisted user was promoted.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Delete('registrations/:eventId')
  async cancelRegistration(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.registrationsService.cancelRegistration(eventId, req.user.id);
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List my registrations and waitlist entries',
    description:
      'Returns the current user event entries with state information for frontend button rendering.',
  })
  @ApiOkResponse({ description: 'User event entries returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Get('registrations/me')
  async getMyRegistrations(@Req() req: RequestWithUser) {
    return this.registrationsService.getMyRegistrations(req.user.id);
  }

  @ApiOperation({
    summary: 'Get event registration summary',
    description:
      'Returns the current event capacity summary including registered count, waitlist count, and remaining capacity.',
  })
  @ApiOkResponse({ description: 'Event registration summary returned successfully.' })
  @Get('events/:id/registrations/count')
  async getEventRegistrationCount(@Param('id') id: string) {
    return this.registrationsService.getEventRegistrationSummary(id);
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get organizer dashboard summary',
    description:
      'Returns dashboard summary data for organizers and admins.',
  })
  @ApiOkResponse({ description: 'Dashboard summary returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/summary')
  async getDashboardSummary(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const userRole = req.user.role;

    const summary = await this.registrationsService.getDashboardSummary(
      userId,
      userRole,
    );

    summary.totalEvents = await this.eventsService.getEventsCount(userId);
    summary.upcomingEvents = await this.eventsService.getUpcomingEvents(userId);

    return summary;
  }
}
