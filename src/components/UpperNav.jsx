import { FaBars,FaUserAlt } from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';
import { useContext } from 'react';
import { PageTitleContext } from '../context/PageTitleContext';
import {UserContext} from '../context/UserContext';
import { MdOutlineDarkMode, MdOutlineNotificationsActive } from "react-icons/md";

const UpperNav = ({ onMenuClick }) => {

  const { pageTitle } = useContext(PageTitleContext);
  const { user } = useContext(UserContext);

  return (
    <div className="flex items-center h-16 bg-white w-full box-border shadow-md">
      <div className="flex items-center w-52 pl-2">
        <button
          className="p-2 md:hidden"
          onClick={onMenuClick}
        >
          <FaBars className="w-4 h-4 " />
        </button>
        <BsGraphUp className="ml-2 w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#090d1f] ml-2">Stack Up.</h2>
      </div>

      <div className="flex justify-between items-center flex-grow px-6">
        <div className="text-2xl font-semibold text-[#090d1f]">
          {pageTitle}
        </div>

        {/* Right Icons Group */}
        <div className="flex items-center gap-5">
          <button
            className="bg-none border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <MdOutlineDarkMode className="w-6 h-6 text-blaze-orange-500"/>
          </button>
          
          <button
            className="bg-none border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <MdOutlineNotificationsActive className="w-6 h-6 text-blaze-orange-500" />
          </button>

          
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <button
              className="bg-none border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200"
            >
              <FaUserAlt className="w-5 h-5 text-blaze-orange-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpperNav;