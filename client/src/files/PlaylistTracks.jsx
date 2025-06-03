import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import TrackCard from "./TrackCard";
import Swal from "sweetalert2";
import Display from "./Display";
import Lottie from "lottie-react";
import iloader from "../iloader.json"; // ✅ Import your Lottie JSON
import music from "../music.json"; // ✅ Import your Lottie JSON for background animation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PlaylistTracks = ({ currentTrack, isPlaying, togglePlayPause, addToRecentlyPlayed }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likedMusic, setLikedMusic] = useState(() => JSON.parse(localStorage.getItem("likedMusic")) || []);
  const [pinnedMusic, setPinnedMusic] = useState(() => JSON.parse(localStorage.getItem("pinnedMusic")) || []);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error("No playlist ID provided");
        const res = await axios.get(`${API_BASE_URL}/api/auth/playlist/${id}`);
        setPlaylist(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

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
    if (!token) return notifyLoginRequired();

    const isLiked = likedMusic.some((item) => item.id === track.id);
    const updated = isLiked ? likedMusic.filter((t) => t.id !== track.id) : [...likedMusic, track];
    setLikedMusic(updated);
    localStorage.setItem("likedMusic", JSON.stringify(updated));

    try {
      await axios.post(`${API_BASE_URL}/api/auth/like`, { track, like: !isLiked }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Like sync failed:", err);
    }
  };

  const handlePin = async (track) => {
    if (!token) return notifyLoginRequired();

    const isPinned = pinnedMusic.some((item) => item.id === track.id);
    const updated = isPinned ? pinnedMusic.filter((t) => t.id !== track.id) : [...pinnedMusic, track];
    setPinnedMusic(updated);
    localStorage.setItem("pinnedMusic", JSON.stringify(updated));

    try {
      await axios.post(`${API_BASE_URL}/api/auth/pin`, { track, pin: !isPinned }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Pin sync failed:", err);
    }
  };

  const handleDownload = (track) => {
    if (!token) return notifyLoginRequired();

    const link = document.createElement('a');
    link.href = track.preview_url;
    link.download = `${track.name}-preview.mp3`;
    link.click();
  };

  if (error) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-[#111] text-white px-4 py-6 pb-40"> 
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-64 h-64">
            <Lottie animationData={iloader} className="w-200 h-200 py-40" />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-2">🎵 {playlist.name}</h1>
          <p className="text-center text-gray-400 mb-6">{playlist.description}</p>

          <div className="space-y-6">
          
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {playlist.tracks.items
                  .slice(
                    row === 0 ? 0 : Math.ceil(playlist.tracks.items.length / 2),
                    row === 0 ? Math.ceil(playlist.tracks.items.length / 2) : playlist.tracks.items.length
                  )
                  .map((item) => {
                    const track = item.track;
                    return (
                      <TrackCard
                        key={track.id}
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
                      />
                    );
                  })}
                  
              </div>
            ))}
            
          </div>
        </>
      )}


      <div className="fixed bottom-0 left-0 w-full bg-black border-gray-300">
        <Display />
      </div>
    </div>
  );
};

export default PlaylistTracks;
