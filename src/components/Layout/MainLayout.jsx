import { useState, useEffect, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UpperNav from "../UpperNav";
import Sidebar from "../Sidebar";
import { PageTitleContext } from "../../context/PageTitleContext";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setPageTitle } = useContext(PageTitleContext);
  const location = useLocation();

  useEffect(() => {
    const pathToTitle = {
      "/dashboard": "Dashboard",
      "/transactions": "Transactions",
      "/reports": "Reports",
      "/income": "Income Sources",
      "/settings": "Settings",
    };

    const currentPath = location.pathname;
    const title = pathToTitle[currentPath] || "Dashboard";
    setPageTitle(title);
  }, [location, setPageTitle]);

  return (
    <div className="flex flex-col h-screen">
      <UpperNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onMenuClick={() => setIsSidebarOpen(false)}
        />
        <div className="flex-grow overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
