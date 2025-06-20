// require('dotenv').config();
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');
// const axios = require('axios');

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "https://musica-server-rzrh.onrender.com/api/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const email = profile.emails[0].value;
//     const existingEmailUser = await User.findOne({ email });

//     if (existingEmailUser && existingEmailUser.googleId !== profile.id) {
//       // Same email but different auth method
//       return done(null, false, { message: 'email_already_exists' });
//     }

//     let user = await User.findOne({ googleId: profile.id });

//     if (!user) {
//       const imageUrl = profile.photos[0].value;
//       const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

//       user = await User.create({
//         googleId: profile.id,
//         name: profile.displayName,
//         email,
//         avatar: {
//           data: response.data,
//           contentType: 'image/jpeg',
//         }
//       });
//     }

//     return done(null, user);
//   } catch (err) {
//     return done(err, null);
//   }
// }));


require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');

const { ManualUser, GoogleUser } = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://musica-server-rzrh.onrender.com/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    
    const existingManualUser = await ManualUser.findOne({ email });

    if (existingManualUser) {
      
      return done(null, false, { message: 'email_already_exists' });
    }

    
    let user = await GoogleUser.findOne({ googleId: profile.id });

    if (!user) {
     
      const imageUrl = profile.photos[0].value;
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      
      user = await GoogleUser.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        avatar: {
          data: response.data,
          contentType: 'image/jpeg',
        }
      });
    }

    return done(null, user);
  } catch (err) {
    console.error('Google Auth Error:', err);
    return done(err, null);
  }
}));


