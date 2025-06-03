import React, { useState } from "react";
import { BsPin, BsPinAngleFill } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiDownload } from "react-icons/fi";
import Lottie from "lottie-react";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

import love from "../love.json";
import pin from "../pin.json";
import music from "../music.json";

const TrackCard = ({
  track,
  isLiked,
  isPinned,
  isCurrent,
  isPlaying,
  handlePin,
  handleLike,
  handleDownload,
  togglePlayPause,
  addToRecentlyPlayed,
}) => {
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [showPinAnim, setShowPinAnim] = useState(false);

  if (!track.preview_url) return null;

  const handleLikeWithAnim = (track) => {
    if (!isLiked) {
      setShowLikeAnim(true);
      setTimeout(() => setShowLikeAnim(false), 1000);
    }
    handleLike(track);
  };

  const handlePinWithAnim = (track) => {
    if (!isPinned) {
      setShowPinAnim(true);
      setTimeout(() => setShowPinAnim(false), 1000);
    }
    handlePin(track);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col items-center bg-[#1e1e1e] bg-opacity-70 backdrop-blur-lg backdrop-blur-md text-white p-4 rounded-lg transition-all gap-4 min-h-[180px] w-80 flex-shrink-0 overflow-hidden ${
        isPlaying && isCurrent
          ? "shadow-[0_1px_0_0_#14b8a6]"
          : "shadow-md hover:shadow-lg"
      }`}
    >
      {/* Play Animation Overlay */}
      {isPlaying && isCurrent && (
        <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center bg-opacity-70">
          <Lottie animationData={music} loop autoPlay className="h-64 w-64 opacity-70" />
          <Lottie animationData={music} loop autoPlay className="h-64 w-64 opacity-70" />
        </div>
      )}

      {/* Album Image as Play/Pause Button with Hover Effect */}
      <button
        onClick={() => {
          togglePlayPause(track);
          addToRecentlyPlayed(track);
        }}
        className="z-20 rounded-md transform transition duration-300 hover:scale-105 focus:outline-none"
        title={isPlaying && isCurrent ? "Pause" : "Play"}
      >
        <img
          src={track.album.images[0]?.url}
          alt={track.name}
          className="w-32 h-32 object-cover rounded-md cursor-pointer"
        />
      </button>

      {/* Track Details */}
      <div className="flex flex-col justify-between w-full h-full z-20">
        {/* Title and Action Buttons */}
        <div className="flex justify-between items-start mb-1 relative">
          <h2 className="text-lg font-bold truncate">{track.name}</h2>
          <div className="flex gap-2 relative">
            {/* Pin Button */}
            <div className="relative">
              <button
                onClick={() => handlePinWithAnim(track)}
                className="p-1 hover:text-teal-400 transition"
                title="Pin track"
              >
                {isPinned ? <BsPinAngleFill size={18} /> : <BsPin size={18} />}
              </button>
              {showPinAnim && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-10 h-10 pointer-events-none">
                  <Lottie animationData={pin} loop={false} className="py-12" />
                </div>
              )}
            </div>

            {/* Like Button */}
            <div className="relative">
              <button
                onClick={() => handleLikeWithAnim(track)}
                className="p-1 hover:text-red-500 transition"
                title="Like track"
              >
                {isLiked ? (
                  <AiFillHeart size={18} color="red" />
                ) : (
                  <AiOutlineHeart size={18} />
                )}
              </button>
              {showLikeAnim && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-20 h-20 pointer-events-none">
                  <Lottie animationData={love} loop={false} className="py-7" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Artist Info */}
        <p className="text-sm text-gray-300 truncate">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
        <p className="text-sm text-gray-400">
          Release date: {track.album.release_date}
        </p>

        {/* Controls */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                togglePlayPause(track);
                addToRecentlyPlayed(track);
              }}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-md text-white text-sm transition"
            >
              {isPlaying && isCurrent ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => handleDownload(track)}
              className="text-white hover:text-green-400"
              title="Download"
            >
              <FiDownload size={18} />
            </button>
          </div>
          <img
            src="/fmlogo.png"
            alt="FM Logo"
            className="w-13 h-8 rounded-full cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TrackCard;
