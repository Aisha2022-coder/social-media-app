import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getNotifications(@Req() req) {
    return this.notificationsService.getNotifications(req.user.userId);
  }

  @Post('mark-read')
  @UseGuards(AuthGuard('jwt'))
  async markAllRead(@Req() req) {
    return this.notificationsService.markAllRead(req.user.userId);
  }
} 