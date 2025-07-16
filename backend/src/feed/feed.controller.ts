import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getTimeline(@Req() req) {
    return this.feedService.getTimelinePosts(req.user.userId);
  }
} 