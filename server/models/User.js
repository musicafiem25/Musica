// const mongoose = require('mongoose');

// // Subdocument schema for music tracks
// const TrackSchema = new mongoose.Schema({
//   id: String,
//   name: String,
//   artists: [Object],
//   album: Object,
//   preview_url: String,
//   release_date: String,
// }, { _id: false });

// // User schema
// const UserSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true, required: true },
//   password: { type: String }, // for email/password auth
//   googleId: { type: String, unique: true, sparse: true }, // for Google OAuth
//   avatar: {
//     data: Buffer,
//     contentType: String
//   },
//   likedMusic: [TrackSchema],
//   pinnedMusic: [TrackSchema],
//   recentlyPlayed: [TrackSchema],
//   isAdmin: { type: Boolean, default: false } // 👈 Added this line
// }, { timestamps: true });

// // Prevent OverwriteModelError
// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);



const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  id: String,
  name: String,
  artists: [Object],
  album: Object,
  preview_url: String,
  release_date: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  avatar: {
    data: Buffer,
    contentType: String
  },
  likedMusic: [TrackSchema],
  pinnedMusic: [TrackSchema],
  recentlyPlayed: [TrackSchema],
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });


const ManualUser = mongoose.models.ManualUser || mongoose.model('ManualUser', UserSchema, 'manual_user');
const GoogleUser = mongoose.models.GoogleUser || mongoose.model('GoogleUser', UserSchema, 'google_user');

module.exports = { ManualUser, GoogleUser };

