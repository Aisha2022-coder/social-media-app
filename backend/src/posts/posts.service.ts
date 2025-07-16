import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './post.schema';
import { Comment, CommentDocument } from './comment.schema';
import { Model, Types } from 'mongoose';
import { NotificationsService } from './notifications.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async createPost(title: string, description: string, authorId: string, media: { url: string; type: string }[] = []) {
    const post = new this.postModel({
      title,
      description,
      author: new Types.ObjectId(authorId),
      media,
    });
    return post.save();
  }

  async getAllPosts() {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async getPostsByUser(userId: string) {
    return this.postModel.find({ author: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new Error('Post not found');
    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = post.likes.some((id: Types.ObjectId) => id.equals(userObjectId));
    if (hasLiked) {
      post.likes = post.likes.filter((id: Types.ObjectId) => !id.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
      if (post.author && !post.author.equals(userObjectId)) {
        await this.notificationsService.createNotification(
          post.author.toString(),
          'like',
          { postId: (post._id as Types.ObjectId).toString(), fromUser: userId }
        );
      }
    }
    await post.save();
    return { liked: !hasLiked, likesCount: post.likes.length };
  }

  async addComment(postId: string, userId: string, text: string) {
    const comment = new this.commentModel({
      postId: new Types.ObjectId(postId),
      author: new Types.ObjectId(userId),
      text,
    });
    await comment.save();
    const post = await this.postModel.findById(postId);
    if (post && post.author && !post.author.equals(userId)) {
      await this.notificationsService.createNotification(
        post.author.toString(),
        'comment',
        { postId: (post._id as Types.ObjectId).toString(), fromUser: userId, commentId: (comment._id as Types.ObjectId).toString() }
      );
    }
    return comment;
  }

  async getComments(postId: string) {
    return this.commentModel.find({ postId: new Types.ObjectId(postId) })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getTrendingPosts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.postModel.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ likes: -1, createdAt: -1 })
      .exec();
  }
} 