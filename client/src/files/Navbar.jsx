import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { HiX } from "react-icons/hi";
import Lottie from "lottie-react";
import music from "../music.json";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Navbar = ({ currentTrack, isPlaying, togglePlayPause, handleLogout }) => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_BASE_URL}/api/auth/avatar`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.avatar) setAvatarUrl(res.data.avatar);
          if (res.data.name) setUserName(res.data.name);
          if (res.data.email) setUserEmail(res.data.email);
        })
        .catch((err) => console.error("Error loading user profile:", err));
    }
  }, []);

  useEffect(() => {
    const visited = localStorage.getItem("hasVisited");
    if (userName && visited !== "true") {
      Swal.fire({
        title: `🎉 Welcome, ${userName}!`,
        text: "Enjoy your music journey 🎵",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "center",
      });
      localStorage.setItem("hasVisited", "true");
    }
  }, [userName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const onLogoutClick = () => {
    Swal.fire({
      title: "Do you want to logout or delete your account?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Logout",
      denyButtonText: `Delete Account`,
      confirmButtonColor: "orange",
      background: "lightgrey",
    }).then(async (result) => {
      if (result.isConfirmed) {
        handleLogout();
        navigate("/login");
      } else if (result.isDenied) {
        const confirmDelete = await Swal.fire({
          title: "Are you sure?",
          text: "This will permanently delete your account.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
          background: "lightgrey",
        });

        if (confirmDelete.isConfirmed) {
          try {
            if (!userEmail) {
              return Swal.fire("Error", "User email not available", "error");
            }

            const res = await fetch("http://localhost:5000/api/auth/delete", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail }),
            });

            const data = await res.json();
            if (!res.ok) {
              return Swal.fire("Error", data.message || "Failed to delete account", "error");
            }

            Swal.fire("Deleted!", "Your account has been deleted.", "success");
            handleLogout();
            navigate("/register");
          } catch (err) {
            console.error("Delete error:", err.message);
            Swal.fire("Error", "Something went wrong", "error");
          }
        }
      }
    });
  };

  const avatar = avatarUrl ? (
    <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
  ) : userName ? (
    <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-lg">
      {userName.charAt(0).toUpperCase()}
    </div>
  ) : (
    <img
      src="/dp.jpg"
      alt="Default Avatar"
      onClick={() => navigate("/login")}
      className="w-9 h-9 pb-1 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
    />
  );

  return (
    <nav className="w-full bg-[#1e1e1e] text-white shadow-md sticky top-0 z-[1000]">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <img
            src="/fmlogo.png"
            alt="Logo"
            className="w-28 h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          {/* Desktop timestamp */}
          <span className="text-xs text-gray-300 hidden sm:inline">{formattedDateTime}</span>
        </div>

        {/* Right (Desktop) */}
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          <Link
            to="/"
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-800 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            Home
          </Link>
          {userName && (
            <>
              <Link
                to="/library"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-800 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                Library
              </Link>
              <Link
                to="/recent"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-800 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                Recent
              </Link>
              <button
                onClick={onLogoutClick}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400 shadow-md">
            {avatar}
          </div>
        </div>

        {/* Mobile Avatar Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400 shadow-md"
          >
            {avatar}
          </button>
        </div>
      </div>

      {/* Sidebar (Mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#2c2c2c] opacity-90 shadow-lg z-[999] transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden overflow-hidden`}
      >
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
          <Lottie animationData={music} loop autoPlay className="w-full h-full" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {avatar}
              <span className="text-sm font-semibold">{userName || "Guest"}</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-2xl text-white cursor-pointer hover:text-red-400 transition"
            >
              <HiX />
            </button>
          </div>

          {/* Mobile timestamp */}
          <div className="text-xs text-center text-gray-300 border-b border-gray-700 px-4 py-2">
            {formattedDateTime}
          </div>

          <div className="flex flex-col p-4 gap-3 text-sm font-medium">
            <Link
              to="/"
              onClick={() => {
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-teal-600 hover:bg-teal-800 text-white text-center px-3 py-2 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              Home
            </Link>
            {userName && (
              <>
                <Link
                  to="/library"
                  onClick={() => setMenuOpen(false)}
                  className="bg-teal-600 hover:bg-teal-800 text-white text-center px-3 py-2 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  Library
                </Link>
                <Link
                  to="/recent"
                  onClick={() => setMenuOpen(false)}
                  className="bg-teal-600 hover:bg-teal-800 text-white text-center px-3 py-2 rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  Recent
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogoutClick();
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  Logout / Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[998] md:hidden cursor-pointer"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
