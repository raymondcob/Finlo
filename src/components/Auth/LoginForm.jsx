import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../config/firebase";
import { UserContext } from '../../context/UserContext';
import { FaGoogle } from "react-icons/fa";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User signed in:", userCredential.user);
        setUser(userCredential.user);
        navigate('/dashboard');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account", // Force account selection
    });

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User signed in with Google:", user);
        setUser(user);
        navigate('/dashboard');
      })
      .catch((error) => {
        if (error.code !== 'auth/popup-closed-by-user') {
          setError(error.message);
        }
      });
  };

  return (
    <form
      className="p-5 w-full sm:max-w-md bg-white rounded-lg shadow-lg"
      onSubmit={handleLogin}
    >
      <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
        Welcome Back!
      </h1>
      <h5 className="text-sm text-gray-500 mb-4 text-center">
        Please enter your details
      </h5>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-lg font-bold mb-2">
          Email
        </label>
        <input
          id="email"
          type="text"
          placeholder="Email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 text-lg font-bold mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-500 rounded-md h-10 text-white mt-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login
      </button>

      <div className="flex items-center justify-center space-x-4 mt-6">
        <div className="bg-gray-400 h-0.5 rounded-lg w-1/4"></div>
        <p className="text-gray-500 text-sm">or</p>
        <div className="bg-gray-400 h-0.5 rounded-lg w-1/4"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full border-2 border-slate-400 bg-white rounded-md h-10 text-black mt-3 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FaGoogle className="inline-block mr-2" /> Login with Google
      </button>

      <p className="text-center text-gray-500 text-sm mt-2">
        Don’t have an account?{" "}
        <Link to="/auth/sign-up" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;