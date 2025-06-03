const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
//const dns = require('dns').promises;
//const { isValidEmailFormat, checkEmailDomain } = require('../utils/emailValidator');
router.get('/avatar', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      let avatarBase64 = null;
      if (user.avatar?.data) {
        avatarBase64 = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
      }

      res.json({
        name: user.name,
        email:user.email,
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
      // Add if not already liked
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
    const user = await User.findOne({ email: req.user.email });
    res.json({
      likedMusic: user.likedMusic || [],
      pinnedMusic: user.pinnedMusic || [],
    });
  } catch (err) {
    console.error("Fetch user music error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.delete('/unlike/:trackId', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.likedMusic = user.likedMusic.filter(track => track.id !== req.params.trackId);
  await user.save();
  res.json({ success: true });
});
router.delete('/unpin/:trackId', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.pinnedMusic = user.pinnedMusic.filter(track => track.id !== req.params.trackId);
  await user.save();
  res.json({ success: true });
});
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  try {
      const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search`, {
          params: {
              q,
              type: 'track',
              limit: 20,
          },
      });
      res.json(response.data);
  } catch (error) {
      
      res.status(500).json({ error: 'Search failed', details: error.message });
  }
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: `${process.env.CLIENT_URL}/register?error=google_signup_required`
//   }),
//   (req, res) => {
//     const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     const name = encodeURIComponent(req.user.name);
//     const email = encodeURIComponent(req.user.email);
//     res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&name=${name}&email=${email}`);
//   }
// );
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false
    }, (err, user, info) => {
      if (info && info.message === 'email_already_exists') {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=email_exists`);
      }

      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_signup_required`);
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const name = encodeURIComponent(user.name);
      const email = encodeURIComponent(user.email);
      res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&name=${name}&email=${email}`);
    })(req, res, next);
  }
);


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

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
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

/*router.get("/check-mx", async (req, res) => {
  const email = req.query.email;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ valid: false, reason: "Invalid email format" });
  }

  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return res.json({ valid: false, reason: "No MX records found" });
    }
    return res.json({ valid: true });
  } catch {
    return res.json({ valid: false, reason: "Domain does not exist or has no MX records" });
  }
});

/*
const isValidEmailFormat = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Validate email format
    if (!isValidEmailFormat(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check email domain MX records
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ error: "Email domain cannot receive emails" });
      }
    } catch {
      return res.status(400).json({ error: "Email domain does not exist" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // Sign JWT and send response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});
*/
// ⬇️ Add this just below
router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

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
    const user = await User.findById(req.user.id).select("email avatar");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      data: {
        data: user.avatar.data,
        contentType: user.avatar.contentType
      }
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


/*
router.delete("/recently-played/clear", auth, async (req, res) => {
  try {
    const user = req.user;
    user.recentlyPlayed = [];
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
});*/

router.get('/playlist/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Playlist ID is required' });
  }

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
// GET /api/spotify/categories
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
/*
router.get("/categories", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.NOCODEAPI_SPOTIFY_URL}browse/categories`
    );

    // ✅ Only return the array of categories
    const categories = response.data.categories.items;
    res.json(categories); // This should be an array
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});*/

router.get('/search-cat', async (req, res) => {
  const { q, type = 'playlist', limit = 20 } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  try {
    const response = await axios.get(
      `${process.env.NOCODEAPI_SPOTIFY_URL}/search`,
      {
        params: { q, type, limit },
      }
    );
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
      params: { id }
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
    const deletedUser = await User.findOneAndDelete({ email });

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
    // Only allow admin users
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    // Fetch all users except their password field
    const users = await User.find({}, '-password');

    // Convert avatar Buffer to an object with url for frontend
    const usersWithAvatarUrl = users.map(user => {
      let avatarUrl = null;
      if (user.avatar?.data && user.avatar?.contentType) {
        avatarUrl = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
      }
      return {
        ...user.toObject(),
        avatar: { url: avatarUrl }
      };
    });

    res.json(usersWithAvatarUrl);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE user by ID (Admin only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    // Only allow admin users to delete
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
/*router.get('/artists', async (req, res) => {
  try {
    const { data } = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search?q=4kYSro6naA4h99UJvo89HB&type=artist&limit=10`);
    res.json(data.artists.items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});*/
// router.get('/artists', async (req, res) => {
//   const query = req.query.q;
//   console.log('Query:', query);

//   try {
//     if (query) {
//       console.log('Searching for artist:', query);
//       const { data } = await axios.get(
//         `${process.env.NOCODEAPI_SPOTIFY_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`
//       );
//       res.json(data.artists.items);
//     } else {
//       console.log('Fetching default artists...');
//       const defaultArtistIds = [
//         '4kYSro6naA4h99UJvo89HB',
//         '1uNFoZAHBGtllmzznpCI3s',
//         '6eUKZXaKkcviH0Ku9w2n3V',
//         '66CXWjxzNUsdJxJ2JdwvnR',
//         '6LuN9FCkKOj5PcnpouEgny',
//         '1Xyo4u8uXC1ZmMpatF05PJ',
//         '3TVXtAsR1Inumwj472S9r4',
//         '6M2wZ9GZgrQXHCFfjv46we',
//         '06HL4z0CvFAxyc27GXpf02',
//         '3fMbdgg4jU18AjLCKBhRSm'
//       ];

//       const idsParam = defaultArtistIds.join(',');
//       const url = `${process.env.NOCODEAPI_SPOTIFY_URL}/artists?ids=${idsParam}`;
//       console.log('Fetching from URL:', url);

//       const { data } = await axios.get(url);
//       res.json(data.artists);
//     }
//   } catch (error) {
//     console.error('Spotify API error:', error.message);
//     if (error.response) {
//       console.error('Status:', error.response.status);
//       console.error('Data:', error.response.data);
//     }
//     res.status(500).json({ error: 'Failed to fetch artists' });
//   }
// });

// Get albums by artist
// routes/spotify.js or wherever your routes are


// router.get('/artists', async (req, res) => {
//   const query = req.query.q;

//   try {
//     if (query) {
//       const { data } = await axios.get(
//         `${process.env.NOCODEAPI_SPOTIFY_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`
//       );
//       return res.json(data.artists.items);
//     } else {
//       const defaultArtistIds = [
//         '4kYSro6naA4h99UJvo89HB', // BLACKPINK
//         '1uNFoZAHBGtllmzznpCI3s', // Justin Bieber
//         '6eUKZXaKkcviH0Ku9w2n3V', // Ed Sheeran
//         '66CXWjxzNUsdJxJ2JdwvnR', // Ariana Grande
//         '6LuN9FCkKOj5PcnpouEgny', // Dua Lipa
//         '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
//         '3TVXtAsR1Inumwj472S9r4', // Drake
//         '6M2wZ9GZgrQXHCFfjv46we', // Doja Cat
//         '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
//         '3fMbdgg4jU18AjLCKBhRSm'  // Michael Jackson
//       ];

//       const idsParam = defaultArtistIds.join(',');
//       const { data } = await axios.get(
//         `${process.env.NOCODEAPI_SPOTIFY_URL}/artists?ids=${idsParam}`
//       );

//       return res.json(data.artists);
//     }
//   } catch (error) {
//     console.error('❌ Spotify API error:', error.message);
//     if (error.response) {
//       console.error('📄 Response data:', error.response.data);
//       console.error('📡 Status:', error.response.status);
//     }
//     res.status(500).json({ error: 'Failed to fetch artists' });
//   }
// });




// router.get('/artist/:id/albums', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { data } = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/artists/${id}/albums`);
//     res.json(data.items);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch albums' });
//   }
// });

// // Get tracks by album
// router.get('/album/:id/tracks', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { data } = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/albums/${id}/tracks`);
//     res.json(data.items);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch tracks' });
//   }
// });





/*router.get("/featured-artists/:query", async (req, res) => {
  const { query } = req.params;
  try {
    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/search`, {
      params: {
        q: query,
        type: "artist",
        limit: 12,
      },
    });
    res.json(response.data.artists.items);
  } catch (err) {
    console.error("Failed to fetch artists:", err.message);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});/*
const popularIndianArtistIds = [
  "4kYSro6naA4h99UJvo89HB", // Arijit Singh
  "1mYsTxnqsietFxj1OgoGbG", // Shreya Ghoshal
  "3IYJvVeV8wJtycOxK0JOUH", // Sonu Nigam
  "3Ck1j8aEtnSe02Tx0lkMxM", // Neha Kakkar
  "3AER1TQHp7ZRdX7QI6dXzZ", // Badshah
  "3Gm5myvXu5bb5r6q2fE7oE", // Armaan Malik
  "5IHyTklLgNrf3bEZz6f7N4", // Atif Aslam
  "2up3OPMp9Tb4dAKM2erWXQ", // Sunidhi Chauhan
];

router.get("/featured-artists", async (req, res) => {
  try {
    // NoCodeAPI batch get artists by IDs:
    // IDs separated by commas
    const ids = popularIndianArtistIds.join(",");

    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/artists`, {
      params: { ids },
    });

    res.json(response.data.artists);
  } catch (err) {
    console.error("Failed to fetch popular artists:", err.message);
    res.status(500).json({ error: "Failed to fetch popular artists" });
  }
});*/
/*router.get("/featured-artists", async (req, res) => {
  const popularIndianArtistIds = [
    "4kYSro6naA4h99UJvo89HB",
    "1mYsTxnqsietFxj1OgoGbG",
    "3IYJvVeV8wJtycOxK0JOUH",
    "3Ck1j8aEtnSe02Tx0lkMxM",
    "3AER1TQHp7ZRdX7QI6dXzZ",
    "3Gm5myvXu5bb5r6q2fE7oE",
    "5IHyTklLgNrf3bEZz6f7N4",
    "2up3OPMp9Tb4dAKM2erWXQ",
  ];

  try {
    const ids = popularIndianArtistIds.join(",");
    console.log("Requesting artist IDs:", ids);

    const response = await axios.get(`${process.env.NOCODEAPI_SPOTIFY_URL}/artists`, {
      params: { ids },
    });
    res.json(response.data.artists);
  } catch (err) {
    console.error("Failed to fetch popular artists:", err.message);
    res.status(500).json({ error: "Failed to fetch popular artists" });
  }
});*/


/*
const endpoint = process.env.NOCODEAPI_SPOTIFY_URL;
const artistQueries = [
  "Arijit Singh",
  "Shreya Ghoshal",
  "Neha Kakkar",
  "A R Rahman",
  "Sonu Nigam",
  "Badshah",
  "Sidhu Moose Wala"
];

router.get("/indian-artists-tracks", async (req, res) => {
  try {
    const allTracks = [];

    for (const query of artistQueries) {
      // 1. Search artist
      const searchRes = await fetch(`${endpoint}/search?q=${encodeURIComponent(query)}&type=artist`);
      const searchData = await searchRes.json();
      const artist = searchData.artists.items[0];
      if (!artist) continue;

      // 2. Get top tracks
      const tracksRes = await fetch(`${endpoint}/artists?id=${artist.id}&queryType=top-tracks&market=IN`);
      const tracksData = await tracksRes.json();
      allTracks.push(...tracksData.tracks.slice(0, 3));
    }

    res.json({ tracks: allTracks });
  } catch (error) {
    console.error("Backend error fetching tracks:", error);
    res.status(500).json({ error: "Failed to fetch artist tracks" });
  }
});*/

/*
const endpoint = process.env.NOCODEAPI_SPOTIFY_URL;

// Get genre tracks with pagination
router.get("/genre/:genre", async (req, res) => {
  const genre = req.params.genre;
  const limit = req.query.limit || 12;
  const offset = req.query.offset || 0;

  try {
    const response = await fetch(
      `${endpoint}/search?q=${encodeURIComponent(genre)}&type=track&limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    res.json({
      tracks: data.tracks.items,
      total: data.tracks.total || 50,
    });
  } catch (error) {
    console.error("Error fetching genre tracks:", error);
    res.status(500).json({ error: "Failed to fetch genre tracks" });
  }
});*/

// Search featured artists by query
/*
router.get("/featured-artists/:query", async (req, res) => {
  const query = req.params.query;
  try {
    const response = await fetch(
      `${endpoint}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`
    );
    const data = await response.json();
    res.json(data.artists.items);
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});*/

// const NOCODEAPI_URL =
//   'https://v1.nocodeapi.com/riders/spotify/DtdFyxfFkCLKDcMV/artists?id=4kYSro6naA4h99UJvo89HB&queryType=albums&perPage=5&page=10';

// router.get('/indian-artists', async (req, res) => {
//   try {
//     const response = await fetch(NOCODEAPI_URL);
//     const data = await response.json();
//     res.json(data.artists.items);
//   } catch (error) {
//     console.error('Error fetching artists:', error);
//     res.status(500).json({ error: 'Failed to fetch artists' });
//   }
// });


/*const BASE = process.env.NOCODEAPI_SPOTIFY_URL;

// Search artists by query
router.get('/search-artists', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query param q is required' });

  const url = `${BASE}/search?q=${encodeURIComponent(query)}&type=artist`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.artists || !data.artists.items) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }
    res.json(data.artists.items);
  } catch (error) {
    console.error('Error searching artists:', error);
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

// Get albums for artist ID
/*router.get('/albums/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 5;

  const url = `${BASE}/artists?id=${artistId}&queryType=albums&perPage=${perPage}&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.albums) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }

    res.json(data.albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});*/
/*router.get('/albums/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 5;

  const url = `${BASE}/artists?id=${artistId}&queryType=albums&perPage=${perPage}&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Albums API raw response:', data);

    // Adjust depending on actual API response:
    if (!data || (!data.albums && !data.items)) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }

    // Return the right data
    if (data.albums) {
      res.json(data.albums);
    } else {
      res.json(data.items);
    }
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});


// Fetch tracks of an album
/*router.get('/tracks/:albumId', async (req, res) => {
  const { albumId } = req.params;

  const url = `${BASE}/albums?id=${albumId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Tracks API raw response:', data);

    if (!data || !data.tracks) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }

    res.json(data.tracks.items); // usually tracks are in tracks.items
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});*/
/*
router.get('/tracks/:albumId', async (req, res) => {
  const { albumId } = req.params;

  try {
    const response = await fetch(`${process.env.NOCODEAPI_SPOTIFY_URL}/albums/${albumId}`);
    const data = await response.json();

    if (!data || !data.tracks || !data.tracks.items) {
      return res.status(500).json({ error: 'Invalid response from NoCodeAPI Spotify' });
    }

    // Send full album data to frontend
    res.json(data);
  } catch (error) {
    console.error('Error fetching album from NoCodeAPI:', error);
    res.status(500).json({ error: 'Failed to fetch album data' });
  }
});*/



module.exports = router;
