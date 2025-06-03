import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import emailjs from "emailjs-com";
import Swal from "sweetalert2";
import Lottie from "lottie-react";

import music from "../music.json";
import success from "../success.json";
import errorAnim from "../error.json";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultAnim, setResultAnim] = useState(null); // success or error animation

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultAnim(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      setResultAnim("success");

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        showConfirmButton: false,
        timer: 1000,
      });

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setResultAnim("error");
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const name = urlParams.get("name");
    const email = urlParams.get("email");

    if (token) {
      localStorage.setItem("token", token);

      // if (name && email) {
      //   emailjs.send(
      //   import.meta.env.VITE_EMAILJS_SERVICE_ID,
      //   import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      //   { name, email },
      //   import.meta.env.VITE_EMAILJS_USER_ID
      // )
      // .then(
      //   (response) => {
      //     console.log("Welcome email sent via Google!", response.status, response.text);
      //   },
      //   (error) => {
      //     console.error("Failed to send welcome email via Google:", error);
      //   }
      // );

      // }

      navigate("/");
    } else if (error === "google_signup_required") {
      Swal.fire({
        icon: "info",
        title: "Google Account Required",
        text: "You must sign up with Google before logging in. Please go to the Register page.",
        confirmButtonText: "Go to Register",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/register");
        }
      });
    } else if (error === "email_exists") {
      Swal.fire({
        icon: "error",
        title: "Email Already Exists",
        text: "This email is already registered using a different method. Please use another login method.",
      });
    }
  }, [navigate]);
  const showCopyPasteAlert = () => {
    Swal.fire({
      icon: "warning",
      title: "Action Blocked",
      text: "Copy and paste are disabled for security reasons.",
      timer: 2000,
      showConfirmButton: false,
    });
  };
  return (
    <div className="flex overflow-hidden relative items-center justify-center min-h-screen bg-black">
      {/* Background Animations */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none ml-50">
        <Lottie animationData={music} loop autoPlay />
      </div>
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <Lottie animationData={music} loop autoPlay />
      </div>

      {/* Result animation */}
      {resultAnim === "success" && (
        <div className="absolute top-10 z-20 w-24 h-24">
          <Lottie animationData={success} loop={false} />
        </div>
      )}
      {resultAnim === "error" && (
        <div className="absolute top-10 z-20 w-24 h-24">
          <Lottie animationData={errorAnim} loop={false} />
        </div>
      )}

      {/* Login Form */}
      <div className="bg-opacity-70 backdrop-blur-lg border border-white/10 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md text-center z-10">
        <h2 className="text-white text-xl sm:text-2xl font-semibold mb-6 flex justify-center items-center gap-2">
          Log in to
          <Link to="/">
            <img
              src="/fmlogo.png"
              alt="Logo"
              className="w-32 sm:w-36 h-10 sm:h-12 transform transition-transform duration-200 hover:scale-105"
            />
          </Link>
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col items-center" onContextMenu={(e) => {
          e.preventDefault();
          showCopyPasteAlert();
        }}>
          <input
            type="email"
            aria-label="Email address"
            placeholder="Email"
            className="w-11/12 p-3 mb-4 rounded-md bg-gray-800 text-white placeholder-white/70 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onCopy={(e) => { e.preventDefault(); showCopyPasteAlert(); }}
            onPaste={(e) => { e.preventDefault(); showCopyPasteAlert(); }}
            required
          />

          <div className="relative w-11/12">
            <input
              type={showPassword ? "text" : "password"}
              aria-label="Password"
              placeholder="Password"
              className="w-full p-3 pr-10 mb-4 rounded-md bg-gray-800 text-white placeholder-white/70 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onCopy={(e) => { e.preventDefault(); showCopyPasteAlert(); }}
              onPaste={(e) => { e.preventDefault(); showCopyPasteAlert(); }}
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 text-lg"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-11/12 bg-teal-500 text-white font-semibold py-3 rounded-md hover:bg-teal-600 transition mb-3 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Lottie animationData={music} className="w-8 h-8" />
            ) : (
              "Login"
            )}
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 w-11/12 border border-gray-300 bg-white text-black font-medium py-2 rounded-md hover:bg-gray-100 transition"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="text-xl" /> Sign In with Google
          </button>

          <p className="mt-5 text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-teal-400 hover:underline font-medium">
              Sign up here
            </Link>
          </p>

          <p className="mt-2 text-sm text-orange-400 font-bold">
            <Link to="/admin-login">Admin Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
