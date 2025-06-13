import React, { useEffect, useState } from "react";
import axios from "axios";
import Display from "./Display";
import TrackCard from "./TrackCard";
import Lottie from "lottie-react";
import play from "../play.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RecentlyPlayed = ({
  currentTrack,
  isPlaying,
  togglePlayPause,
  addToRecentlyPlayed,
  token,
  userName,
}) => {
  const [songs, setSongs] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [pinnedTracks, setPinnedTracks] = useState([]);
  const [likedMusic, setLikedMusic] = useState([]);
  const [pinnedMusic, setPinnedMusic] = useState([]);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/recently-played`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allTracks = res.data.recentlyPlayed || [];
        setSongs(allTracks.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch recently played:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecentlyPlayed();
    }
  }, [addToRecentlyPlayed, token]);

  const midIndex = Math.ceil(songs.length / 2);
  const firstHalf = songs.slice(0, midIndex);
  const secondHalf = songs.slice(midIndex);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Lottie animationData={play} loop={true} className="w-64 h-64" />
      </div>
    );
  }

  if (!loading && songs.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray text-white p-6 pb-36">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-teal-500 mb-8">
              🎧 Recently Played
            </h1>
            <p className="text-center text-gray-300">No recently played songs found yet.</p>
          </div>
        </div>
      </>

    );
  }

  return (
    <div className="min-h-screen bg-gray text-white p-6 pb-36">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-teal-500 mb-8">
          🎧 Recently Played
        </h1>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap mb-8">
          <div className="flex gap-32">
            {firstHalf.map((track) => (
              <div key={track.id} className="inline-block min-w-[200px]">
                <TrackCard
                  track={track}
                  isLiked={likedMusic.some((t) => t.id === track.id)}
                  isPinned={pinnedMusic.some((t) => t.id === track.id)}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={handlePin}
                  handleLike={handleLike}
                  handleDownload={handleDownload}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={addToRecentlyPlayed}
                  userName={userName}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap">
          <div className="flex gap-32">
            {secondHalf.map((track) => (
              <div key={track.id} className="inline-block min-w-[200px]">
                <TrackCard
                  track={track}
                  isLiked={likedMusic.some((t) => t.id === track.id)}
                  isPinned={pinnedMusic.some((t) => t.id === track.id)}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={handlePin}
                  handleLike={handleLike}
                  handleDownload={handleDownload}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={addToRecentlyPlayed}
                  userName={userName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] border-gray-700">
        <Display />
      </div>
    </div>
  );
};

export default RecentlyPlayed;
