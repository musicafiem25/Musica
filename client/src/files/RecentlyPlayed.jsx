import React, { useEffect, useState } from "react";
import axios from "axios";
import Display from "./Display";
import TrackCard from "./TrackCard";
import Lottie from "lottie-react";
import play from "../play.json"; // Update the path as needed
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

  const handleLike = (track) => {
    const alreadyLiked = likedTracks.some((t) => t.id === track.id);
    if (alreadyLiked) {
      setLikedTracks((prev) => prev.filter((t) => t.id !== track.id));
    } else {
      setLikedTracks((prev) => [...prev, track]);
    }
  };

  const handlePin = (track) => {
    const alreadyPinned = pinnedTracks.some((t) => t.id === track.id);
    if (alreadyPinned) {
      setPinnedTracks((prev) => prev.filter((t) => t.id !== track.id));
    } else {
      setPinnedTracks((prev) => [...prev, track]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Lottie animationData={play} loop={true} className="w-64 h-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray text-white p-6 pb-36">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-teal-500 mb-8">🎧 Recently Played</h1>

        {/* First Row */}
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap mb-8">
          <div className="flex gap-32">
            {firstHalf.map((track) => (
              <div key={track.id} className="inline-block min-w-[200px]">
                <TrackCard
                  track={track}
                  isLiked={likedTracks.some((t) => t.id === track.id)}
                  isPinned={pinnedTracks.some((t) => t.id === track.id)}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={handlePin}
                  handleLike={handleLike}
                  handleDownload={() => window.open(track.preview_url, "_blank")}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={addToRecentlyPlayed}
                  userName={userName}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap">
          <div className="flex gap-32">
            {secondHalf.map((track) => (
              <div key={track.id} className="inline-block min-w-[200px]">
                <TrackCard
                  track={track}
                  isLiked={likedTracks.some((t) => t.id === track.id)}
                  isPinned={pinnedTracks.some((t) => t.id === track.id)}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={handlePin}
                  handleLike={handleLike}
                  handleDownload={() => window.open(track.preview_url, "_blank")}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={addToRecentlyPlayed}
                  userName={userName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Display */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] border-gray-700">
        <Display />
      </div>
    </div>
  );
};

export default RecentlyPlayed;
