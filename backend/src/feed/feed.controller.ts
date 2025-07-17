import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getTimeline(@Req() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.feedService.getTimelinePosts(req.user.userId, Number(page), Number(limit));
  }
} 