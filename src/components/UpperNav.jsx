
import { FaBars } from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';

const UpperNav = ({ onMenuClick }) => {
  return (
    <div className="flex items-center h-16 bg-white w-full box-border shadow-md">
      <div className="flex items-center w-52 pl-2">
        <button
          className="p-2"
          onClick={onMenuClick}
        >
          <FaBars className="w-4 h-4 " />
        </button>
        <BsGraphUp className="ml-2 w-5 h-5" />
        <h2 className="text-lg  font-semibold text-[#090d1f] ml-2">Stack Up.</h2>
      </div>

      <div className="flex justify-between items-center flex-grow px-6">
        <div className="text-2xl font-semibold text-[#090d1f]">
          Overview
        </div>

        {/* Right Icons Group */}
        <div className="flex items-center gap-5">
          <button
            className="bg-none border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <img src="https://dashboard.codeparrot.ai/api/image/Z5UR08AVJ0Xbb6EI/vector-3.png" alt="Settings" className="w-6 h-6" />
          </button>
          
          <button
            className="bg-none border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <img src="https://dashboard.codeparrot.ai/api/image/Z5UR08AVJ0Xbb6EI/vector-3-2.png" alt="Notifications" className="w-6 h-6" />
          </button>

          <button
            className="bg-none border-none cursor-pointer w-10 h-10 rounded-full overflow-hidden transition-transform duration-200 hover:scale-105"
          >
            <img src="https://dashboard.codeparrot.ai/api/image/Z5UR08AVJ0Xbb6EI/group-5.png" alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpperNav;