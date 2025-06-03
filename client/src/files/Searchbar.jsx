import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Searchbar = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setHistory(storedHistory);

    const checkScreen = () => setIsSmallScreen(window.innerWidth < 640); // Tailwind 'sm' breakpoint

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const saveToHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    let updatedHistory = [searchTerm, ...history.filter((item) => item !== searchTerm)];
    if (updatedHistory.length > 10) {
      updatedHistory = updatedHistory.slice(0, 10);
    }
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleChange = (e) => setQuery(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/search?q=${encodeURIComponent(query)}`);
      onSearchResults(res.data);
      saveToHistory(query);
    } catch (err) {
      console.error('Search error:', err);
      onSearchResults({ tracks: { items: [] } });
    } finally {
      setLoading(false);
      if (isSmallScreen) {
        setIsExpanded(false); // collapse on small screens
      }
    }
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    setIsExpanded(true);
  };

  const shouldShowBar = !isSmallScreen || isExpanded;

  return (
    <div className="w-full flex justify-center mt-5 transition-all duration-300 ease-in-out">
      <div
        className={`${
          shouldShowBar ? 'w-full sm:max-w-lg p-5 bg-black/70 rounded-lg' : 'w-auto'
        } relative text-white transition-all duration-300 ease-in-out`}
      >
        {!shouldShowBar ? (
          <button
            className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
            onClick={() => setIsExpanded(true)}
          >
            <FaSearch className="w-5 h-5" />

          </button>
          
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0 transition-all duration-300"
            >
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Search for music"
                  value={query}
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                  className="flex-grow px-4 py-2 text-black text-base rounded-l-md sm:rounded-r-none w-full outline-none"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-r-md sm:rounded-l-none flex items-center justify-center disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-gray-500  rounded-full animate-spin" />
                    
                  ) : (
                    <FaSearch className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>

            {isFocused && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white text-gray-700 rounded-md border border-gray-300 shadow max-h-40 overflow-y-auto p-3 text-sm mt-2 z-50">
                <p className="font-semibold text-base mb-1">Recent Searches:</p>
                <ul>
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="cursor-pointer py-1 border-b border-gray-200 last:border-b-0 hover:text-black"
                      onMouseDown={() => handleHistoryClick(item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
