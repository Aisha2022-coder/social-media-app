import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { NotificationsService } from '../posts/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Partial<User>): Promise<any> {
    return new this.userModel(data).save();
    return data;
  }

  async findByEmail(email: string): Promise<any> {
    return this.userModel.findOne({ email }).exec();
    return null;
  }

  async findById(id: string): Promise<any> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findAll(): Promise<any[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findByIds(ids: string[]): Promise<any[]> {
    return this.userModel.find({ _id: { $in: ids } }).select('-password').exec();
  }

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return { message: 'You cannot follow yourself.' };
    }
    // Add targetUserId to current user's following, and currentUserId to target user's followers
    await this.userModel.updateOne(
      { _id: currentUserId, following: { $ne: targetUserId } },
      { $push: { following: targetUserId } }
    );
    await this.userModel.updateOne(
      { _id: targetUserId, followers: { $ne: currentUserId } },
      { $push: { followers: currentUserId } }
    );
    // Notify the followed user
    await this.notificationsService.createNotification(
      targetUserId,
      'follow',
      { fromUser: currentUserId }
    );
    return { message: 'Followed user.' };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return { message: 'You cannot unfollow yourself.' };
    }
    // Remove targetUserId from current user's following, and currentUserId from target user's followers
    await this.userModel.updateOne(
      { _id: currentUserId },
      { $pull: { following: targetUserId } }
    );
    await this.userModel.updateOne(
      { _id: targetUserId },
      { $pull: { followers: currentUserId } }
    );
    return { message: 'Unfollowed user.' };
  }

  async updateProfilePicture(userId: string, profilePicture: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(userId, { profilePicture }, { new: true }).exec();
  }

  async getSuggestedUsers(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId);
    if (!user) return [];
    // Exclude users already followed and self
    return this.userModel.find({
      _id: { $nin: [...user.following, userId] }
    }).select('-password').exec();
  }
}


