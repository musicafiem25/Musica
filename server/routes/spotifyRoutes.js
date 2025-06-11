// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch'); // or use axios

// const API_BASE = process.env.NOCODEAPI_SPOTIFY_URL;

// // const searchTerms = [
// //   "Arijit Singh", "Shreya Ghoshal", "Armaan Malik", "Neha Kakkar", "Sonu Nigam",
// //   "Jubin Nautiyal", "KK", "Shankar Mahadevan", "Sunidhi Chauhan", "Atif Aslam",
// //   "Palak Muchhal", "Mohit Chauhan", "Rahat Fateh Ali Khan", "Badshah", "Honey Singh",
// //   "Diljit Dosanjh", "Asees Kaur", "Darshan Raval", "Kanika Kapoor", "Shaan",
// //   "Adele", "Ed Sheeran", "Taylor Swift", "Drake", "Billie Eilish",
// //   "The Weeknd", "Justin Bieber", "Selena Gomez", "Shawn Mendes", "Dua Lipa"
// // ];

// // router.get("/artists", async (req, res) => {
// //   try {
// //     const results = await Promise.all(
// //       searchTerms.map(async (name) => {
// //         const response = await fetch(
// //           `${API_BASE}/search?q=${encodeURIComponent(name)}&type=artist&limit=1`
// //         );
// //         const data = await response.json();
// //         return data.artists?.items?.[0] || null;
// //       })
// //     );

// //     const filtered = results.filter(Boolean); // remove nulls
// //     res.json({ artists: filtered });
// //   } catch (error) {
// //     console.error("Failed to fetch artists:", error);
// //     res.status(500).json({ error: "Failed to fetch artists" });
// //   }
// // });

// router.get('/albums/:artistName', async (req, res) => {
//   const { artistName } = req.params;
//   try {
//     const response = await fetch(
//       `${API_BASE}/search?q=${encodeURIComponent(artistName)}&type=album&limit=10`
//     );
//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch albums' });
//   }
// });

// // Get album tracks
// router.get('/tracks/:albumName', async (req, res) => {
//   const { albumName } = req.params;
//   try {
//     const response = await fetch(
//       `${API_BASE}/search?q=${encodeURIComponent(albumName)}&type=track&limit=20`
//     );
//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch tracks' });
//   }
// });
// module.exports = router;



const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_BASE = process.env.NOCODEAPI_SPOTIFY_URL;

router.get('/albums/:artistName', async (req, res) => {
  const { artistName } = req.params;

  if (!artistName) {
    return res.status(400).json({ error: 'Artist name is required' });
  }

  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(artistName)}&type=album&limit=10`
    );
    const result = await response.json();

    res.json(result);
  } catch (error) {
    console.error('Error fetching albums:', error.message);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});


router.get('/tracks/:albumName', async (req, res) => {
  const { albumName } = req.params;

  if (!albumName) {
    return res.status(400).json({ error: 'Album name is required' });
  }

  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(albumName)}&type=track&limit=20`
    );
    const result = await response.json();

    res.json(result);
  } catch (error) {
    console.error('Error fetching tracks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

module.exports = router;

