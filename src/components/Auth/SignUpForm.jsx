import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { auth } from "../../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { UserContext } from "../../context/UserContext";

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSignUp = (e) => {
    e.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)

      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, {
          displayName: name
        })
          .then(() => {
            setUser(user);
            navigate("/dashboard");
          })
          .catch((error) => {
            setError(error.message);
          });
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="p-5 w-full sm:max-w-md md:max-w-md  bg-white rounded-lg shadow-lg"
    >
      <h1 className="text-3xl font-semibold mb-4 text-center">
        Create an Account
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Join us by filling in your details below.
      </p>

      {/* Name Input */}
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-lg font-bold mb-2 text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-lg font-bold mb-2 text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-lg font-bold mb-2 text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Create a password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>
      )}

      {/* Sign Up Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600"
      >
        Sign Up
      </button>

      {/* Login Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/auth" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}

export default SignUpForm;
