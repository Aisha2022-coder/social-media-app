import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts/post.schema';
import { User, UserDocument } from '../users/user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getTimelinePosts(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return [];
    // Convert following IDs to ObjectIds for correct matching
    const followingObjectIds = user.following.map(id => new Types.ObjectId(id));
    return this.postModel
      .find({ author: { $in: followingObjectIds } })
      .sort({ createdAt: -1 })
      .exec();
  }
} 