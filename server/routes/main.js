// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const router = express.Router();
// const axios = require('axios');
// const auth = require('../middleware/auth');
// const passport = require('passport');
// const bcrypt = require('bcryptjs');
// const authMiddleware = require('../middleware/auth');

// router.get('/avatar', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (user) {
//       let avatarBase64 = null;
//       if (user.avatar?.data) {
//         avatarBase64 = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
//       }

//       res.json({
//         name: user.name,
//         email:user.email,
//         avatar: avatarBase64,
//       });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// });
// router.post("/like", auth, async (req, res) => {
//   const { track, like } = req.body;

//   try {
//     const user = req.user;

//     if (like) {
//       // Add if not already liked
//       if (!user.likedMusic.some((item) => item.id === track.id)) {
//         user.likedMusic.push(track);
//       }
//     } else {
//       user.likedMusic = user.likedMusic.filter((item) => item.id !== track.id);
//     }

//     await user.save();
//     res.json({ likedMusic: user.likedMusic });
//   } catch (err) {
//     console.error("Like error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// router.post("/pin", auth, async (req, res) => {
//   const { track, pin } = req.body;

//   try {
//     const user = req.user;

//     if (pin) {
//       if (!user.pinnedMusic.some((item) => item.id === track.id)) {
//         user.pinnedMusic.push(track);
//       }
//     } else {
//       user.pinnedMusic = user.pinnedMusic.filter((item) => item.id !== track.id);
//     }

//     await user.save();
//     res.json({ pinnedMusic: user.pinnedMusic });
//   } catch (err) {
//     console.error("Pin error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// router.get("/user-music", auth, async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.user.email });
//     res.json({
//       likedMusic: user.likedMusic || [],
//       pinnedMusic: user.pinnedMusic || [],
//     });
//   } catch (err) {
//     console.error("Fetch user music error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.delete('/unlike/:trackId', auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   user.likedMusic = user.likedMusic.filter(track => track.id !== req.params.trackId);
//   await user.save();
//   res.json({ success: true });
// });
// router.delete('/unpin/:trackId', auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   user.pinnedMusic = user.pinnedMusic.filter(track => track.id !== req.params.trackId);
//   await user.save();
//   res.json({ success: true });
// });
// router.get('/search', async (req, res) => {
//   const { q } = req.query;
//   if (!q) {
//       return res.status(400).json({ error: 'Query parameter "q" is required' });
//   }
//   try {
//       const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search`, {
//           params: {
//               q,
//               type: 'track',
//               limit: 20,
//           },
//       });
//       res.json(response.data);
//   } catch (error) {
      
//       res.status(500).json({ error: 'Search failed', details: error.message });
//   }
// });
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get('/google/callback',
//   (req, res, next) => {
//     passport.authenticate('google', {
//       session: false
//     }, (err, user, info) => {
//       if (info && info.message === 'email_already_exists') {
//         return res.redirect(`${process.env.CLIENT_URL}/login?error=email_exists`);
//       }

//       if (err || !user) {
//         return res.redirect(`${process.env.CLIENT_URL}/login?error=google_signup_required`);
//       }

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '168h' });
//       const name = encodeURIComponent(user.name);
//       const email = encodeURIComponent(user.email);
//       res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&name=${name}&email=${email}`);
//     })(req, res, next);
//   }
// );


// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ error: "Email already registered" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashed });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Register failed" });
//   }
// });
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ error: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });



// router.post("/admin-login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user || !user.isAdmin) {
//       return res.status(401).json({ error: "Not authorized as admin" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ token, isAdmin: true });
//   } catch (err) {
//     console.error("Admin login error:", err);
//     res.status(500).json({ error: "Admin login failed" });
//   }
// });

// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("email avatar");

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json({
//       data: {
//         data: user.avatar.data,
//         contentType: user.avatar.contentType
//       }
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });
// router.get('/logout', (req, res) => {
//   req.logout(() => {
//     res.redirect(process.env.CLIENT_URL);
//   });
// });
// router.post("/play", auth, async (req, res) => {
//   const { track } = req.body;
//   try {
//     const user = req.user;
//     user.recentlyPlayed = user.recentlyPlayed.filter(item => item.id !== track.id);
// user.recentlyPlayed.unshift(track);
// if (user.recentlyPlayed.length > 50) user.recentlyPlayed.pop();
// await user.save();
//     res.json({ recentlyPlayed: user.recentlyPlayed });
//   } catch (err) {
//     res.status(500).json({ error: "Could not save recently played track" });
//   }
// });
// router.get("/recently-played", auth, async (req, res) => {
//   try {
//     res.json({ recentlyPlayed: req.user.recentlyPlayed || [] });
//   } catch (err) {
//     console.error("Fetch recently played error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// router.get("/featured", async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${process.env.NOCODEAPI_SPOTIFY_URL}/browse/featured`
//     );
//     res.json(response.data.playlists.items);
//   } catch (err) {
//     console.error("Failed to fetch featured playlists:", err.message);
//     res.status(500).json({ error: "Failed to fetch playlists" });
//   }
// });




// router.get('/playlist/:id', async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return res.status(400).json({ error: 'Playlist ID is required' });
//   }

//   try {
//     const response = await axios.get(
//       `${process.env.NOCODEAPI_SPOTIFY_URL}/playlists?id=${id}`
//     );
//     res.json(response.data);
//   } catch (err) {
//     console.error("Error fetching playlist from Spotify:", err.message);
//     res.status(500).json({ error: "Failed to fetch playlist" });
//   }
// });
// // GET /api/spotify/categories
// router.get('/categories', async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${process.env.NOCODEAPI_SPOTIFY_URL}/browse/categories`
//     );
//     res.json(response.data);
//   } catch (err) {
//     console.error("Error fetching categories:", err.message);
//     res.status(500).json({ error: "Failed to fetch categories" });
//   }
// });


// router.get('/search-cat', async (req, res) => {
//   const { q, type = 'playlist', limit = 20 } = req.query;
//   if (!q) {
//     return res.status(400).json({ error: 'Query parameter "q" is required' });
//   }
//   try {
//     const response = await axios.get(
//       `${process.env.NOCODEAPI_SPOTIFY_URL}/search`,
//       {
//         params: { q, type, limit },
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Search failed', details: error.message });
//   }
// });

// router.get('/playlist-tracks', async (req, res) => {
//   const { id } = req.query;
//   if (!id) return res.status(400).json({ error: 'Playlist ID is required' });

//   try {
//     const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/playlists`, {
//       params: { id }
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch playlist tracks', details: error.message });
//   }
// });


// router.delete("/delete", async (req, res) => {
//   const { email } = req.body;

//   if (!email) return res.status(400).json({ message: "Email is required" });

//   try {
//     const deletedUser = await User.findOneAndDelete({ email });

//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting user:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get('/users', auth, async (req, res) => {
//   try {
//     // Only allow admin users
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ error: 'Forbidden: Admins only' });
//     }

//     // Fetch all users except their password field
//     const users = await User.find({}, '-password');

//     // Convert avatar Buffer to an object with url for frontend
//     const usersWithAvatarUrl = users.map(user => {
//       let avatarUrl = null;
//       if (user.avatar?.data && user.avatar?.contentType) {
//         avatarUrl = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
//       }
//       return {
//         ...user.toObject(),
//         avatar: { url: avatarUrl }
//       };
//     });

//     res.json(usersWithAvatarUrl);
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // DELETE user by ID (Admin only)
// router.delete('/users/:id', auth, async (req, res) => {
//   try {
//     // Only allow admin users to delete
//     if (!req.user.isAdmin) {
//       return res.status(403).json({ error: 'Forbidden: Admins only' });
//     }

//     const userId = req.params.id;
//     const deletedUser = await User.findByIdAndDelete(userId);

//     if (!deletedUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error("Failed to delete user:", error);
//     res.status(500).json({ error: 'Failed to delete user' });
//   }
// });
// module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const { ManualUser, GoogleUser } = require('../models/User');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

const findUserById = async (id) => {
  return (await ManualUser.findById(id)) || (await GoogleUser.findById(id));
};

const findUserByEmail = async (email) => {
  return (await ManualUser.findOne({ email })) || (await GoogleUser.findOne({ email }));
};

router.get('/avatar', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (user) {
      let avatarBase64 = null;
      if (user.avatar?.data) {
        avatarBase64 = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
      }

      res.json({
        name: user.name,
        email: user.email,
        avatar: avatarBase64,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

router.post("/like", auth, async (req, res) => {
  const { track, like } = req.body;

  try {
    const user = req.user;

    if (like) {
      if (!user.likedMusic.some((item) => item.id === track.id)) {
        user.likedMusic.push(track);
      }
    } else {
      user.likedMusic = user.likedMusic.filter((item) => item.id !== track.id);
    }

    await user.save();
    res.json({ likedMusic: user.likedMusic });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/pin", auth, async (req, res) => {
  const { track, pin } = req.body;

  try {
    const user = req.user;

    if (pin) {
      if (!user.pinnedMusic.some((item) => item.id === track.id)) {
        user.pinnedMusic.push(track);
      }
    } else {
      user.pinnedMusic = user.pinnedMusic.filter((item) => item.id !== track.id);
    }

    await user.save();
    res.json({ pinnedMusic: user.pinnedMusic });
  } catch (err) {
    console.error("Pin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user-music", auth, async (req, res) => {
  try {
    res.json({
      likedMusic: req.user.likedMusic || [],
      pinnedMusic: req.user.pinnedMusic || [],
    });
  } catch (err) {
    console.error("Fetch user music error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete('/unlike/:trackId', auth, async (req, res) => {
  const user = req.user;
  user.likedMusic = user.likedMusic.filter(track => track.id !== req.params.trackId);
  await user.save();
  res.json({ success: true });
});

router.delete('/unpin/:trackId', auth, async (req, res) => {
  const user = req.user;
  user.pinnedMusic = user.pinnedMusic.filter(track => track.id !== req.params.trackId);
  await user.save();
  res.json({ success: true });
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search`, {
      params: { q, type: 'track', limit: 20 },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (info && info.message === 'email_already_exists') {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=email_exists`);
    }

    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_signup_required`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '168h' });
    const name = encodeURIComponent(user.name);
    const email = encodeURIComponent(user.email);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&name=${name}&email=${email}`);
  })(req, res, next);
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await findUserByEmail(email);
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await ManualUser.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await ManualUser.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await ManualUser.findOne({ email });

    if (!user || !user.isAdmin) {
      return res.status(401).json({ error: "Not authorized as admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, isAdmin: true });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Admin login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      data: {
        data: user.avatar?.data,
        contentType: user.avatar?.contentType,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});

router.post("/play", auth, async (req, res) => {
  const { track } = req.body;
  try {
    const user = req.user;
    user.recentlyPlayed = user.recentlyPlayed.filter(item => item.id !== track.id);
    user.recentlyPlayed.unshift(track);
    if (user.recentlyPlayed.length > 50) user.recentlyPlayed.pop();
    await user.save();
    res.json({ recentlyPlayed: user.recentlyPlayed });
  } catch (err) {
    res.status(500).json({ error: "Could not save recently played track" });
  }
});

router.get("/recently-played", auth, async (req, res) => {
  try {
    res.json({ recentlyPlayed: req.user.recentlyPlayed || [] });
  } catch (err) {
    console.error("Fetch recently played error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.NOCODEAPI_SPOTIFY_URL}/browse/featured`
    );
    res.json(response.data.playlists.items);
  } catch (err) {
    console.error("Failed to fetch featured playlists:", err.message);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

router.get('/playlist/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'Playlist ID is required' });

  try {
    const response = await axios.get(
      `${process.env.NOCODEAPI_SPOTIFY_URL}/playlists?id=${id}`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching playlist from Spotify:", err.message);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.NOCODEAPI_SPOTIFY_URL}/browse/categories`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get('/search-cat', async (req, res) => {
  const { q, type = 'playlist', limit = 20 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search`, {
      params: { q, type, limit },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

router.get('/playlist-tracks', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Playlist ID is required' });

  try {
    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/playlists`, {
      params: { id },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlist tracks', details: error.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const deletedUser = await ManualUser.findOneAndDelete({ email }) ||
                        await GoogleUser.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const manualUsers = await ManualUser.find({}, '-password');
    const googleUsers = await GoogleUser.find({});

    const formatUser = (user) => {
      let avatarUrl = null;
      if (user.avatar?.data && user.avatar?.contentType) {
        avatarUrl = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
      }
      return {
        ...user.toObject(),
        avatar: { url: avatarUrl }
      };
    };

    const usersWithAvatars = [...manualUsers, ...googleUsers].map(formatUser);

    res.json(usersWithAvatars);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const deleted = await ManualUser.findByIdAndDelete(req.params.id) ||
                    await GoogleUser.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

