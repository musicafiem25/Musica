import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterPlayer from "./FooterPlayer";
import TrackCard from "./TrackCard";
import Swal from "sweetalert2";
import Display from "./Display";
import Lottie from "lottie-react";
import rloader from "../rloader.json"; // Adjust path if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SubPlaylistTracks = ({
  currentTrack,
  isPlaying,
  togglePlayPause,
  addToRecentlyPlayed,
}) => {
  const { playlistId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [likedMusic, setLikedMusic] = useState(
    () => JSON.parse(localStorage.getItem("likedMusic")) || []
  );
  const [pinnedMusic, setPinnedMusic] = useState(
    () => JSON.parse(localStorage.getItem("pinnedMusic")) || []
  );
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/playlist-tracks`,
          { params: { id: playlistId } }
        );
        setPlaylistName(res.data.name);
        const filteredTracks = res.data.tracks.items
          .map((item) => item.track)
          .filter((track) => track && track.preview_url);
        setTracks(filteredTracks);
      } catch (err) {
        console.error("Error fetching playlist tracks:", err);
        setError("Failed to load playlist or playlist not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [playlistId]);

  const notifyLoginRequired = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please log in to like, pin, or download songs.",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Login",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    });
  };

  const handleLike = async (track) => {
    if (!token) return notifyLoginRequired();
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
    if (!token) return notifyLoginRequired();
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
    if (!token) return notifyLoginRequired();
    const link = document.createElement("a");
    link.href = track.preview_url;
    link.download = `${track.name}-preview.mp3`;
    link.click();
  };

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-semibold">{error}</div>
    );

  return (
    <>
      <div className="p-6 text-white min-h-screen bg-[#111]">
        <h1 className="text-3xl font-bold text-center mb-8">
          Playlist: {playlistName}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <Lottie animationData={rloader} loop={true} className="w-30 h-30" />
          </div>
        ) : (
          <>
            {[0, 1].map((row) => (
              <div
                key={row}
                className="flex overflow-x-auto scrollbar-hide mb-12 gap-32 pb-6 scrollbar-thin scrollbar-thumb-gray-700"
              >
                {tracks
                  .slice(
                    row * Math.ceil(tracks.length / 2),
                    (row + 1) * Math.ceil(tracks.length / 2)
                  )
                  .map((track) => (
                    <div className="flex-shrink-0 w-64" key={track.id}>
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
                      />
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* {token && currentTrack && <FooterPlayer track={currentTrack} />} */}
      <div className="fixed bottom-0 left-0 w-full text-white bg-[#1e1e1e] border-gray-300 ">
        <Display />
      </div>
    </>
  );
};

export default SubPlaylistTracks;
