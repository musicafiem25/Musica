import React, { useEffect, useState } from "react";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { albumsData, songsData } from "../assets/assets";
import Lottie from "lottie-react";
import iloader from "../iloader.json"; // make sure this file exists in your path

const DisplayHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds loading delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full rounded-lg py-12 text-white overflow-hidden sm:mb-5">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Lottie animationData={iloader} loop={true} className="w-60 h-60" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-center text-teal-200 my-5">
              Featured Charts
            </h1>
            <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 scrollbar-thin scrollbar-thumb-gray-700">
              {albumsData.map((item, index) => (
                <AlbumItem
                  key={index}
                  name={item.name}
                  desc={item.desc}
                  id={item.id}
                  image={item.image}
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-center text-teal-200 my-5">
              Others
            </h1>
            <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 scrollbar-thin scrollbar-thumb-gray-700">
              {songsData.map((item, index) => (
                <SongItem
                  key={index}
                  name={item.name}
                  desc={item.desc}
                  id={item.id}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayHome;
