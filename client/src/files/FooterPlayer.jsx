import React, { useState } from "react";
import { FiVolume2 } from "react-icons/fi";
import {
  AiOutlinePause,
  AiOutlinePlayCircle,
  AiOutlineClose,
  AiOutlineUp,
  AiOutlineDown,
} from "react-icons/ai";
import Lottie from "lottie-react";
import music from "../music.json";

const FooterPlayer = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}) => {
  const [volume, setVolume] = useState(0.5);
  const [showCard, setShowCard] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange(e, track.id);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        className="fixed bottom-[110px] right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg md:bottom-[120px] 
             hover:bg-gray-700 hover:scale-110 transition-all duration-200"
        onClick={() => setShowPlayer(!showPlayer)}
      >
        {showPlayer ? <AiOutlineDown size={20} /> : <AiOutlineUp size={20} />}
      </button>

      {/* FOOTER PLAYER */}
      {showPlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 py-2 md:py-4 border-t border-gray-700 space-y-4 md:space-y-0 h-27 md:h-auto z-40">
          {/* Track Info */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-12 h-12 object-cover rounded cursor-pointer"
              onClick={() => setShowCard(!showCard)}
            />
            <div className="truncate">
              <p className="font-semibold truncate">{track.name}</p>
              <p className="text-sm text-gray-400 truncate">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4 h-6 w-full md:w-1/3 justify-center relative">
            <button className="text-white" onClick={() => onTogglePlay(track)}>
              {isPlaying ? (
                <AiOutlinePause size={28} />
              ) : (
                <AiOutlinePlayCircle size={28} />
              )}
            </button>
            <span className="text-xs">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(e, track.id)}
              className="w-24 sm:w-40 md:w-48 h-1 bg-gray-600 rounded"
            />
            <span className="text-xs">{formatTime(duration)}</span>

            {isPlaying && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-24 pointer-events-none">
                <Lottie animationData={music} loop autoPlay />
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2 w-full md:w-1/3 justify-end">
            <FiVolume2 size={18} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 sm:w-32 md:w-40 h-1 bg-gray-600 rounded"
            />
            <span className="text-xs pr-10 w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* TRACK CARD MODAL */}
      {showCard && (
        <div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 z-50"
          onClick={() => setShowCard(false)}
        >
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="w-full h-48 object-cover rounded"
          />
          <div className="mt-3">
            <p className="text-lg font-semibold">{track.name}</p>
            <p className="text-sm text-gray-400">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Album: {track.album.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterPlayer;
