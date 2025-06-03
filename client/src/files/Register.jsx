import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import emailjs from "emailjs-com";
import Swal from 'sweetalert2';
import music from '../music.json';
import Lottie from "lottie-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters and include a letter, number, and special character.',
      });
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { name, email },
        import.meta.env.VITE_EMAILJS_USER_ID
      ).then(
        (response) => {
          console.log("Welcome email sent!", response.status, response.text);
        },
        (error) => {
          console.error("Failed to send welcome email:", error);
        }
      );

      localStorage.setItem("token", data.token);
      Swal.fire({
        icon: 'success',
        title: 'Registered Successfully!',
        showConfirmButton: false,
        timer: 2000
      });
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Email already exists. Please use a different email.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Something went wrong. Please try again.',
        });
      }
    }
  };

 const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex  overflow-hidden relative justify-center items-center min-h-screen bg-black px-4">
    <div className="absolute inset-0 z-0 opacity-50 pointer-events-none mb-50">
        <Lottie animationData={music}  loop autoPlay />
      </div>
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none mb-50">
        <Lottie animationData={music}  loop autoPlay />
      </div>
      <div className=" bg-opacity-70 backdrop-blur-lg backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-white text-2xl font-semibold mb-6 flex justify-center items-center gap-2">
          Register to
          <Link to={"/"} >
          <img
            src="/fmlogo.png"
            alt="Logo"
            className="w-36 h-10 cursor-pointer transition-transform duration-200 hover:scale-105"
          /></Link>
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pr-10 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-md transition"
          >
            Register
          </button>

          <button
            type="button"
            className="w-full flex justify-center items-center gap-2 bg-white text-black font-medium py-3 rounded-md border border-gray-300 hover:bg-gray-100 transition"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="text-lg" /> Sign In with Google
          </button>

          <p className="text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:underline font-medium">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
