import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterPlayer from "./FooterPlayer";
import Display from "./Display";
import Lottie from "lottie-react";
import iloader from "../iloader.json"; // Ensure correct path to the Lottie file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CategoryWithSubPlaylists = ({currentTrack}) => {
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/categories`);
        const category = res.data.categories.items.find((c) => c.id === categoryId);
        if (category) {
          setCategoryName(category.name);
          setSubcategories([
            `${category.name} Hits`,
            `Top ${category.name}`,
            `${category.name} Vibes`,
          ]);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category data.");
      }
    };

    fetchCategory();
  }, [categoryId]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!selectedSubcategory) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/search-cat`, {
          params: {
            q: selectedSubcategory,
            type: "playlist",
            limit: 20,
          },
        });

        setPlaylists(res.data.playlists.items || []);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [selectedSubcategory]);

  // useEffect(() => {
  //   if (currentTrack) {
  //     localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
  //   }
  // }, [currentTrack]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-8 p-6 bg-red-50 text-red-700 border border-red-400 rounded-lg text-center font-semibold">
        {error}
      </div>
    );
  }

  // Split playlists into two rows
  const mid = Math.ceil(playlists.length / 2);
  const firstRow = playlists.slice(0, mid);
  const secondRow = playlists.slice(mid);

  return (
    <>
      <div className="p-6 font-sans text-white min-h-screen bg-[#111]">
        <h2 className="text-2xl font-bold mb-6 text-teal-500">Category: {categoryName}</h2>

        <h3 className="text-lg font-semibold mb-2">Subcategories</h3>
        <div className="flex flex-wrap gap-4 mb-8">
          {subcategories.map((sub, i) => (
            <button
              key={i}
              className="border-2 border-teal-600 bg-teal-100 text-teal-800 font-semibold px-4 py-2 rounded-xl shadow hover:bg-teal-600 hover:text-white transition min-w-[140px]"
              onClick={() => {
                setSelectedSubcategory(sub);
                setPlaylists([]);
                setError(null);
              }}
            >
              {sub}
            </button>
          ))}
        </div>

        {selectedSubcategory && (
         
          <>
            <h3 className="text-lg font-semibold mb-4">
              Playlists for Subcategory: {selectedSubcategory}
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Lottie animationData={iloader} loop={true} className="w-40 h-40" />
              </div>
            ) : (
              <>
                {[firstRow, secondRow].map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex gap-4 overflow-x-auto scrollbar-hide mb-6 pb-2"
                  >
                    {row.map((playlist) => (
                      <a
                        key={playlist.id}
                        href={`/tracks/${playlist.id}`}
                        className="w-[160px] sm:w-[180px] flex-shrink-0 bg-[#121212] text-gray-200 border border-gray-600 p-4 rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transform transition duration-200 flex flex-col items-center"
                      >
                        {playlist.images[0]?.url && (
                          <img
                            src={playlist.images[0].url}
                            alt={playlist.name}
                            className="w-full h-36 object-cover rounded-md mb-3"
                          />
                        )}
                        <h4 className="text-sm font-semibold text-center truncate w-full">
                          {playlist.name}
                        </h4>
                      </a>
                    ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* {token && currentTrack && (
        <FooterPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          addToRecentlyPlayed={addToRecentlyPlayed}
        />
      )} */}

      <div className="fixed bottom-0 left-0 w-full text-white bg-[#1e1e1e] border-gray-300">
        <Display />
      </div>
    </>
  );
};

export default CategoryWithSubPlaylists;
