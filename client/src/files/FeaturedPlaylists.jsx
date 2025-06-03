import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import rloader from "../rloader.json"; // 🧩 Make sure to add this Lottie JSON
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FeaturedPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/featured`);
        setPlaylists(res.data);
      } catch (error) {
        console.error("Error fetching featured playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlaylists();
  }, []);

  return (
    <div className="w-full px-4 py-6 overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-teal-200">Genre Specific</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-40 h-40">
            <Lottie animationData={rloader}  />
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {playlists.map((p) => (
            <div
              key={p.id}
              className="min-w-[180px] bg-white/5 rounded-lg p-3 hover:bg-white/10 transition duration-200"
            >
              {p.images[0] && (
                <Link to={`/playlist/${p.id}`} className="block">
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="rounded-md w-full mb-2"
                  />
                </Link>
              )}
              <div className="font-semibold text-white text-sm mb-1 truncate">{p.name}</div>
              <p className="text-slate-200 text-sm truncate">{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedPlaylists;
