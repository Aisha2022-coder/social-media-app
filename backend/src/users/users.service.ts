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
    try {
      return await new this.userModel(data).save();
    } catch (err) {
      throw err;
    }
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
    const currentUser = await this.userModel.findById(currentUserId);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      throw new Error('User not found');
    }

    const followingSet = new Set((currentUser.following || []).map(String));
    if (followingSet.has(targetUserId)) {
      throw new Error('Already following this user');
    }

    currentUser.following.push(targetUserId);
    currentUser.following = Array.from(new Set((currentUser.following || []).map(String)));

    targetUser.followers.push(currentUserId);
    targetUser.followers = Array.from(new Set((targetUser.followers || []).map(String)));

    await currentUser.save();
    await targetUser.save();

    await this.notificationsService.createNotification(
      targetUserId,
      'follow',
      { fromUser: currentUserId, fromUsername: currentUser.username, fromProfilePicture: currentUser.profilePicture }
    );

    return { message: 'Successfully followed user' };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    const currentUser = await this.userModel.findById(currentUserId);
    const targetUser = await this.userModel.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      throw new Error('User not found');
    }
    
    if (!currentUser.following.includes(targetUserId)) {
      throw new Error('Not following this user');
    }
    
    currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
    
    await currentUser.save();
    await targetUser.save();
    
    return { message: 'Successfully unfollowed user' };
  }

  async updateProfilePicture(userId: string, profilePicture: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(userId, { profilePicture }, { new: true }).exec();
  }

  async updateMe(userId: string, body: { username?: string }) {
    const update: any = {};
    if (body.username) update.username = body.username;
    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).select('-password').exec();
  }

  async getSuggestedUsers(currentUserId: string) {
    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    return this.userModel.find({
      _id: { $nin: [...currentUser.following, currentUserId] }
    }).limit(10);
  }
}


