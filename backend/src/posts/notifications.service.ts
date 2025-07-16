import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createNotification(userId: string, type: string, data: any) {
    let enhancedData = { ...data };
    if (data.fromUser) {
      const user = await this.userModel.findById(data.fromUser).select('username profilePicture');
      if (user) {
        enhancedData.fromUser = (user._id as Types.ObjectId).toString();
        enhancedData.fromUsername = user.username;
        enhancedData.fromProfilePicture = user.profilePicture || null;
      }
    }
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      type,
      data: enhancedData,
    });
    return notification.save();
  }

  async getNotifications(userId: string) {
    return this.notificationModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    );
    return { success: true };
  }
} 