import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import mwave from "../mwave.json";
import lock from "../lock.json";
import error from "../error.json"; // Add error animation file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState("idle"); // 'idle' | 'success' | 'error'
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin-login`, {
        email,
        password,
      });

      if (res.data.isAdmin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("email", email);
        localStorage.setItem("avatarUrl", res.data.avatarUrl || "");

        setLoginStatus("success");

        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 2000);
      } else {
        setLoginStatus("error");
        setTimeout(() => setLoginStatus("idle"), 2000); // Reset form after animation
      }
    } catch (err) {
      setLoginStatus("error");
      setTimeout(() => setLoginStatus("idle"), 2000); // Reset form after animation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none ml-50">
        <Lottie animationData={mwave} loop autoPlay />
      </div>
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <Lottie animationData={mwave} loop autoPlay />
      </div>

      {/* Login Card */}
      <div className="bg-[#111] bg-opacity-70 backdrop-blur-lg backdrop-blur-md text-white w-full max-w-md p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-md z-10">
        {loginStatus === "success" ? (
          <div className="flex flex-col items-center">
            <Lottie animationData={lock} loop={false} className="h-40 w-40" />
            <p className="text-green-400 font-semibold mt-2">Login Successful!</p>
          </div>
        ) : loginStatus === "error" ? (
          <div className="flex flex-col items-center">
            <Lottie animationData={error} loop={false} className="h-40 w-40" />
            <p className="text-red-400 font-semibold mt-2">Invalid credentials. Try again.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full px-4 py-3 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-10 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 cursor-pointer text-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-800 rounded-md text-white font-semibold transition duration-200"
              >
                Login as Admin
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
