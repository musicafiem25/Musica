import React, { useRef, useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./files/Home";
import Login from "./files/Login";
import Register from "./files/Register";
import Library from "./files/Library";
import Navbar from "./files/Navbar";
import RecentlyPlayed from "./files/RecentlyPlayed";
import PlaylistTracks from "./files/PlaylistTracks";
import FooterPlayer from "./files/FooterPlayer";
import axios from "axios";
import CategoryWithSubPlaylists from "./files/CategoryWithSubPlaylists";
import SubPlaylistTracks from "./files/SubPlaylistTracks";
import AdminLogin from "./files/AdminLogin";
import AdminDashboard from "./files/AdminDashboard";
// import GenrePage from "./files/GenrePage";
// import ArtistAlbumsAndTracks from "./files/ArtistAlbumsAndTracks";
// import ArtistAlbums from "./files/ArtistAlbums";
import ArtistAlbumsWithDetails from "./files/ArtistAlbumsWithDetails";

//import './App.css';

const App = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  const audioRef = useRef(new Audio());

  // Check token on route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Load & play selected track
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack?.preview_url) return;

    audio.src = currentTrack.preview_url;
    audio.load();
    audio.play();
    setIsPlaying(true);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentTrack]);

  // Play or pause the selected track
  const togglePlayPause = (track) => {
    const audio = audioRef.current;
    if (currentTrack?.id === track.id) {
      isPlaying ? audio.pause() : audio.play();
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setCurrentTime(0);
    }
  };

  // Seek through the current track
  const handleSeek = (e, id) => {
    const time = parseFloat(e.target.value);
    if (currentTrack?.id === id) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Change audio volume
  const handleVolumeChange = (e, id) => {
    const volume = parseFloat(e.target.value);
    if (currentTrack?.id === id) audioRef.current.volume = volume;
  };

  // Add track to Recently Played & notify RecentlyPlayed.jsx to refetch
  const addToRecentlyPlayed = async (track) => {
    try {
      await axios.post("http://localhost:5000/api/auth/play", { track }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRecentlyUpdated(prev => !prev); // Toggle to trigger useEffect
    } catch (err) {
      console.error("Failed to add to recently played:", err);
    }
  };

  // Logout and reset all playback & auth state
  const handleGlobalLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("hasVisited", "false");
    setIsLoggedIn(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    audioRef.current.pause();
  };

  return (
    <>
      {shouldShowNavbar && (
        <Navbar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          handleLogout={handleGlobalLogout}
        />
      )}


      <Routes>
        <Route path="/" element={
          <Home
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}
          />
        } />
        <Route path="/library" element={
          <Library
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}
          />
        } />
        <Route path="/recent" element={
          <RecentlyPlayed
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}
            token={localStorage.getItem("token")}
          />
        } />
        <Route path="/playlist/:id" element={
          <PlaylistTracks
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}
          />
        } />

        <Route path="/category/:categoryId" element={
          <CategoryWithSubPlaylists
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}               
          />}
        />
        <Route path="/tracks/:playlistId" element={
          <SubPlaylistTracks
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed} />}
        />
        <Route path="/albums/:artistName" element={
          <ArtistAlbumsWithDetails
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            addToRecentlyPlayed={addToRecentlyPlayed}
          />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>

      {isLoggedIn && currentTrack && (
        <FooterPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={togglePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      )}


    </>
  );
};

export default App;



