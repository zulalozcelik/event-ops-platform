import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/types/authenticated-request.type';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Authentication is required.' })
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'List my notifications',
    description: 'Returns notifications for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Notifications returned successfully.' })
  @Get('my')
  async getMyNotifications(@Req() req: RequestWithUser) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks the selected notification as read for the current user.',
  })
  @ApiOkResponse({ description: 'Notification marked as read successfully.' })
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.notificationsService.markNotificationAsRead(id, req.user.id);
    return { message: 'Notification marked as read' };
  }
}
