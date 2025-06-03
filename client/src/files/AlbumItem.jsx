import React from "react";

const AlbumItem = ({ image, name, desc, id }) => {
  return (
    <div className="min-w-[160px] sm:min-w-[180px] p-3 rounded-lg cursor-pointer transition duration-200 hover:bg-white/10">
      <img
        src={image}
        alt={name}
        className="rounded-lg w-full object-cover mb-3"
      />
      <p className="font-semibold text-white text-sm sm:text-base truncate">{name}</p>
      <p className="text-slate-300 text-xs sm:text-sm truncate">{desc}</p>
    </div>
  );
};

export default AlbumItem;
