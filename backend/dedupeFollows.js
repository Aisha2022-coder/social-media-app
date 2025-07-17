const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  process.exit(1);
}

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function dedupeFollows() {
  await mongoose.connect(uri);

  const users = await User.find({});
  let updatedCount = 0;

  for (const user of users) {
    let changed = false;
    if (Array.isArray(user.following)) {
      const deduped = Array.from(new Set(user.following.map(String)));
      if (deduped.length !== user.following.length) {
        user.following = deduped;
        changed = true;
      }
    }
    if (Array.isArray(user.followers)) {
      const deduped = Array.from(new Set(user.followers.map(String)));
      if (deduped.length !== user.followers.length) {
        user.followers = deduped;
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

dedupeFollows().catch(err => {
  process.exit(1);
}); 