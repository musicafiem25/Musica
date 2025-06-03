import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Lottie from "lottie-react";
import mix from "../mix.json"; // Ensure this path is correct
import TrackCard from "./TrackCard";
import Display from "./Display";
import mwave from "../mwave.json"; // Ensure this path is correct
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = "api/spotify";

export default function ArtistAlbumsWithDetails({
  currentTrack,
  isPlaying,
  togglePlayPause,
  addToRecentlyPlayed,
}) {
  const { artistName } = useParams();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [likedMusic, setLikedMusic] = useState(() => JSON.parse(localStorage.getItem("likedMusic")) || []);
  const [pinnedMusic, setPinnedMusic] = useState(() => JSON.parse(localStorage.getItem("pinnedMusic")) || []);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchAlbums() {
      try {
        setLoadingAlbums(true);
        const res = await fetch(`${API_BASE_URL}/${API_BASE}/albums/${encodeURIComponent(artistName)}`);
        if (!res.ok) throw new Error("Failed to fetch albums");
        const data = await res.json();
        setAlbums(data.albums?.items || []);
        setLoadingAlbums(false);
      } catch (err) {
        setError(err.message);
        setLoadingAlbums(false);
      }
    }
    fetchAlbums();
  }, [artistName]);

  async function fetchAlbumTracksBySearch(albumName) {
    try {
      setLoadingTracks(true);
      const res = await fetch(`${API_BASE_URL}/${API_BASE}/tracks/${encodeURIComponent(albumName)}`);
      if (!res.ok) throw new Error("Failed to fetch album tracks");
      const data = await res.json();
      setAlbumTracks(data.tracks?.items || []);
      setLoadingTracks(false);
    } catch (err) {
      setError(err.message);
      setLoadingTracks(false);
    }
  }

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    fetchAlbumTracksBySearch(album.name);
  };

  const handleBack = () => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      setAlbumTracks([]);
      setError(null);
    } else {
      navigate("/");
    }
  };

  const notifyLoginRequired = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please log in to like, pin, or download songs.",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Login",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  const handleLike = async (track) => {
    if (!token) return notifyLoginRequired();
    const isLiked = likedMusic.some((item) => item.id === track.id);
    const updated = isLiked ? likedMusic.filter((item) => item.id !== track.id) : [...likedMusic, track];
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
    const updated = isPinned ? pinnedMusic.filter((item) => item.id !== track.id) : [...pinnedMusic, track];
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

  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  if (loadingAlbums) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-60 h-60">
          <Lottie animationData={mix} loop={true} />
        </div>
      </div>
    );
  }

  return !selectedAlbum ? (
    <div className="p-5 text-white md:py-16">
      {/* Lottie Mix Animation Header (Optional, you can remove this if needed) */}
      
      <h2 className="text-2xl font-bold mb-6 text-teal-400">Albums for "{artistName}"</h2>

      {[0, 1].map((rowIndex) => {
        const start = rowIndex * Math.ceil(albums.length / 2);
        const end = start + Math.ceil(albums.length / 2);
        const rowAlbums = albums.slice(start, end);

        return (
          <div
            key={rowIndex}
            className="mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            <div className="flex gap-4">
              {rowAlbums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className="min-w-[192px] bg-zinc-900 rounded-xl p-4 cursor-pointer hover:scale-105 hover:shadow-lg transition-transform text-center"
                >
                  <img
                    src={album.images?.[0]?.url}
                    alt={album.name}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <h4 className="font-semibold truncate">{album.name}</h4>
                  <p className="text-sm text-teal-400">{album.release_date}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="fixed bottom-0 left-0 w-full bg-black border-gray-300">
        <Display />
      </div>
    </div>
  ) : (
    <div className="py-16 text-white p-5">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{selectedAlbum.name}</h1>
        <img
          src={selectedAlbum.images?.[0]?.url}
          alt={selectedAlbum.name}
          className="mx-auto h-40 w-40 rounded-lg mb-2"
        />
        <p className="text-sm text-teal-400">Release date: {selectedAlbum.release_date}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-teal-200">Tracks</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-7">
        {loadingTracks ? (
  <div className="ml-50 w-48 h-48">
          <Lottie animationData={mwave} loop={true} />
        </div>        ) : albumTracks.length ? (
          albumTracks.map((track) => (
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
          ))
        ) : (
          <p className="text-red-400">No tracks found for this album.</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full h-12 bg-[#1e1e1e] border-gray-300">
        <Display />
      </div>
    </div>
  );
}
