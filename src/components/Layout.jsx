import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UpperNav from './UpperNav';
import Sidebar from './SideBar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <UpperNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-row flex-grow">
        <Sidebar isOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-col flex-grow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;