// fixFollowing.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  process.exit(1);
}

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function fixFollowing() {
  await mongoose.connect(uri);

  const users = await User.find({});
  let updatedCount = 0;

  for (const user of users) {
    let changed = false;
    if (Array.isArray(user.following)) {
      const newFollowing = user.following.map(id =>
        typeof id === 'string' ? id : (id && id.toString ? id.toString() : id)
      );
      if (JSON.stringify(newFollowing) !== JSON.stringify(user.following)) {
        user.following = newFollowing;
        changed = true;
      }
    }
    if (changed) {
      await user.save();
      updatedCount++;
    }
  }

  await mongoose.disconnect();
}

fixFollowing().catch(err => {
  process.exit(1);
}); 