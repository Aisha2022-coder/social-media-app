import { Controller, Get, Req, UseGuards, Post, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { PostsService } from '../posts/posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Express } from 'express';
import { storage } from '../config/cloudinary';
import multer from 'multer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('suggested')
  @UseGuards(AuthGuard('jwt'))
  async getSuggestedUsers(@Req() req) {
    return this.usersService.getSuggestedUsers(req.user.userId);
  }

  @Get('by-ids')
  async getUsersByIds(@Query('ids') ids: string) {
    if (!ids) return [];
    const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
    const validIds = idArray.filter(id => /^[a-fA-F0-9]{24}$/.test(id));
    if (!validIds.length) return [];
    return this.usersService.findByIds(validIds);
  }

  @Get(':id/posts')
  async getUserPosts(@Param('id') id: string) {
    return this.postsService.getPostsByUser(id);
  }

  @Get(":id")
  async getUserById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  async followUser(@Param('id') id: string, @Req() req) {
    return this.usersService.followUser(req.user.userId, id);
  }

  @Post(':id/unfollow')
  @UseGuards(AuthGuard('jwt'))
  async unfollowUser(@Param('id') id: string, @Req() req) {
    return this.usersService.unfollowUser(req.user.userId, id);
  }

  @Post('me/profile-picture')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage,
  }))
  async updateProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const user = await this.usersService.updateProfilePicture(req.user.userId, file.path);
    return { profilePicture: user.profilePicture };
  }
}
