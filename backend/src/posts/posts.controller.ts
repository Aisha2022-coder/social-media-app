import { Controller, Post, Body, Req, UseGuards, Get, UseInterceptors, UploadedFile, UploadedFiles, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('media', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/') && !file.mimetype.includes('gif')) {
        return cb(new Error('Only image, video, or gif files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let media: { url: string; type: string }[] = [];
    if (files && files.length > 0) {
      media = files.map(file => ({
        url: `/uploads/${file.filename}`,
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