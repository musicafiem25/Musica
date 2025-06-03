import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { BsPinAngleFill } from "react-icons/bs";
import { AiFillHeart } from "react-icons/ai";
import TrackCard from "./TrackCard";
import Display from "./Display";
import Lottie from "lottie-react";
import libraryAnimation from "../library.json"; // Update path as needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Library = ({ currentTrack, isPlaying, togglePlayPause }) => {
  const [likedMusic, setLikedMusic] = useState([]);
  const [pinnedMusic, setPinnedMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const fetchUserMusic = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/user-music`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedMusic(res.data.likedMusic);
        setPinnedMusic(res.data.pinnedMusic);
      } catch (err) {
        console.error("Error fetching user music:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMusic();
  }, []);

  const handleUnlike = async (trackId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/unlike/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikedMusic((prev) => prev.filter((track) => track.id !== trackId));
    } catch (err) {
      console.error("Failed to unlike song:", err);
    }
  };

  const handleUnpin = async (trackId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/unpin/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPinnedMusic((prev) => prev.filter((track) => track.id !== trackId));
    } catch (err) {
      console.error("Failed to unpin song:", err);
    }
  };

  if (!animationDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Lottie
          animationData={libraryAnimation}
          loop={false}
          className="w-64 h-64"
          onComplete={() => setAnimationDone(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-teal-500 mb-8">Your Library</h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">❤️ Liked Music</h2>
          <div className="overflow-x-auto scrollbar-hide whitespace-nowrap flex gap-4 pb-4">
            {likedMusic.length > 0 ? (
              likedMusic.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isLiked={true}
                  isPinned={false}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={() => {}}
                  handleLike={() => handleUnlike(track.id)}
                  handleDownload={() => window.open(track.preview_url, '_blank')}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={() => {}}
                />
              ))
            ) : (
              <p className="text-gray-300">No liked songs yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-4">📌 Pinned Music</h2>
          <div className="overflow-x-auto scrollbar-hide whitespace-nowrap flex gap-4 pb-4">
            {pinnedMusic.length > 0 ? (
              pinnedMusic.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isLiked={false}
                  isPinned={true}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  handlePin={() => handleUnpin(track.id)}
                  handleLike={() => {}}
                  handleDownload={() => window.open(track.preview_url, '_blank')}
                  togglePlayPause={togglePlayPause}
                  addToRecentlyPlayed={() => {}}
                />
              ))
            ) : (
              <p className="text-gray-300">No pinned songs yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] text-white border-gray-300 ">
        <Display />
      </div>
    </div>
  );
};

export default Library;