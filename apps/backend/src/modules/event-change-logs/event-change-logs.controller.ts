import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { EventChangeLogsService } from './event-change-logs.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/types/authenticated-request.type';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventChangeLogsController {
  constructor(
    private readonly eventChangeLogsService: EventChangeLogsService,
  ) {}

  @Get(':eventId/change-logs')
  async getEventChangeLogs(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.eventChangeLogsService.getLogsForViewer(
      eventId,
      req.user.id,
      req.user.role,
    );
  }
}
