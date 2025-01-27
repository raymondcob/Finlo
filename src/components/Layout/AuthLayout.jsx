
import { Routes, Route } from 'react-router-dom';
import LoginForm from '../Auth/LoginForm';
import SignUpForm from '../Auth/SignUpForm';

const AuthLayout = () => (
  <div className="flex justify-center items-center bg-gray-400 h-screen w-full">
    <div className="flex w-full md:w-[85vw] h-full md:h-[85vh] bg-black rounded-lg shadow-lg">
      <div className="flex justify-center items-center w-full md:w-1/2 bg-gray-200 p-10 h-full rounded-tl-lg rounded-bl-lg">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
        </Routes>
      </div>
      <div className="hidden md:flex md:w-1/2 bg-custom-gradient p-10 h-full justify-center items-center rounded-tr-lg rounded-br-lg">
        <img src="../public/Finance-Img.png" alt="login" className="w-full object-cover" />
      </div>
    </div>
  </div>
);

export default AuthLayout;