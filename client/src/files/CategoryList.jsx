import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import mix from "../mix.json"; // Ensure the path is correct and file exists
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/auth/categories`)
      .then((res) => {
        setCategories(res.data.categories.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full px-4 py-6 overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-teal-200">
        Mixed Categories
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Lottie animationData={mix} loop={true} className="w-32 h-32" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="min-w-[150px] flex-shrink-0 bg-[#2a2a2a] rounded-md p-2 hover:bg-[#3a3a3a] transition-colors"
            >
              <Link to={`/category/${cat.id}`}>
                {cat.icons[0] && (
                  <img
                    src={cat.icons[0].url}
                    alt={cat.name}
                    className="w-full h-24 object-cover rounded-md shadow-sm"
                  />
                )}
              </Link>
              <div className="mt-1 text-white font-medium text-xs truncate text-center">
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
