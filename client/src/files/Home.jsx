import React, { useState, useEffect } from "react";
import Searchbar from "./Searchbar";
import axios from "axios";
import Display from './Display';
import DisplayHome from './DisplayHome';
import FeaturedPlaylists from "./FeaturedPlaylists";
import CategoryList from "./CategoryList";
import FooterPlayer from "./FooterPlayer";
import TrackCard from "./TrackCard";
import Swal from "sweetalert2";
import ArtistsListPage from "./ArtistsListPage";
import mloader from '../mloader.json';
import Lottie from "lottie-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Home = ({ currentTrack, isPlaying, togglePlayPause, addToRecentlyPlayed }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [likedMusic, setLikedMusic] = useState([]);
  const [pinnedMusic, setPinnedMusic] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ loading state
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Simulate loading animation duration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // ⏱️ show loader for 2 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);

  const notifyLoginRequired = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please log in to like, pin, or download songs.",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Login"
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    });
  };

  const handleSearchResults = (data) => setSearchResults(data);

  const handleLike = async (track) => {
    if (!token) {
      notifyLoginRequired();
      return;
    }
    const isLiked = likedMusic.some((item) => item.id === track.id);
    const updated = isLiked
      ? likedMusic.filter((item) => item.id !== track.id)
      : [...likedMusic, track];
    setLikedMusic(updated);
    localStorage.setItem("likedMusic", JSON.stringify(updated));

    try {
      await axios.post(
       `${API_BASE_URL}/api/auth/like`,
        { track, like: !isLiked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Sync like failed:", err);
    }
  };

  const handlePin = async (track) => {
    if (!token) {
      notifyLoginRequired();
      return;
    }
    const isPinned = pinnedMusic.some((item) => item.id === track.id);
    const updated = isPinned
      ? pinnedMusic.filter((item) => item.id !== track.id)
      : [...pinnedMusic, track];
    setPinnedMusic(updated);
    localStorage.setItem("pinnedMusic", JSON.stringify(updated));

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/pin`,
        { track, pin: !isPinned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Sync pin failed:", err);
    }
  };

  const handleDownload = (track) => {
    if (!token) {
      notifyLoginRequired();
      return;
    }
    const link = document.createElement('a');
    link.href = track.preview_url;
    link.download = `${track.name}-preview.mp3`;
    link.click();
  };

  // ✅ Show loader if still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-64 h-64">
          <Lottie animationData={mloader} loop={false} />
        </div>
      </div>
    );
  }

  // ✅ Normal home content after loader disappears
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-grow p-5">
        <section className="text-center py-20 px-6 bg-cover bg-center rounded-lg mb-5" style={{ backgroundImage: "url('home-image.jpg')" }}>
          <h1 className="text-4xl font-bold mb-4 text-teal-200 drop-shadow-lg">Welcome to Musica</h1>
          <Searchbar onSearchResults={handleSearchResults} />
        </section>

        <section>
          <h2 className="text-xl text-center text-teal-600 mb-4 font-semibold">
            Discover 130,000+ Free Tracks from Talented Creators Worldwide
          </h2>
        </section>

        {searchResults?.tracks?.items?.length === 0 && (
          <p className="text-center text-red">No results found.</p>
        )}
      </main>

      {searchResults?.tracks?.items?.length > 0 && (
        <section className="px-5 pb-8">
          <h2 className="text-2xl font-semibold text-center mb-4">Search Results</h2>
          <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="flex gap-4 w-max">
              {searchResults.tracks.items.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isLiked={likedMusic.some((item) => item.id === track.id)}
                  isPinned={pinnedMusic.some((item) => item.id === track.id)}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={handlePin}
                  handleLike={handleLike}
                  handleDownload={handleDownload}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={addToRecentlyPlayed}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturedPlaylists />
      <CategoryList />
      <ArtistsListPage />
      <DisplayHome />
      <Display />

      {/* {token && currentTrack && <FooterPlayer track={currentTrack} />} */}
    </div>
  );
};

export default Home;
