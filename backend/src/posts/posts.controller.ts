import { Controller, Post, Body, Req, UseGuards, Get, UseInterceptors, UploadedFile, UploadedFiles, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { storage } from '../config/cloudinary';
import multer from 'multer';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('media', 5, {
    storage, // use Cloudinary storage
  }))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let media: { url: string; type: string }[] = [];
    if (files && files.length > 0) {
      media = files.map(file => ({
        url: file.path, // Cloudinary URL
        type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : file.mimetype.includes('gif') ? 'gif' : 'other',
      }));
    }
    return this.postsService.createPost(
      createPostDto.title,
      createPostDto.description,
      req.user.userId,
      media
    );
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id') postId: string, @Req() req) {
    return this.postsService.toggleLike(postId, req.user.userId);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async addComment(@Param('id') postId: string, @Req() req, @Body('text') text: string) {
    return this.postsService.addComment(postId, req.user.userId, text);
  }

  @Get(':id/comments')
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('trending')
  async getTrendingPosts() {
    return this.postsService.getTrendingPosts();
  }
} 