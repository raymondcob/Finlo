import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

function DashBoard() {
  const { user } = useContext(UserContext);

  const greetingTime = () => {
    const date = new Date();
    const hour = date.getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    if (hour < 18) {
      return 'Good Afternoon';
    }
    return 'Good Evening';
  };

  const username = user.displayName;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-semibold mb-2">
        {greetingTime()}, {username}!
      </h1>
      <h5 className="text-sm text-gray-500 mb-4">
        Welcome to your dashboard
      </h5>
    </div>
  );
}

export default DashBoard;