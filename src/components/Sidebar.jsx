import { useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AiFillHome } from "react-icons/ai";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { GiWallet } from "react-icons/gi";
import { IoMdSettings } from "react-icons/io";
import { PageTitleContext } from "../context/PageTitleContext";

const Sidebar = ({ isOpen, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPageTitle } = useContext(PageTitleContext);
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: AiFillHome,
      path: "/dashboard",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: FaMoneyBillTransfer,
      path: "/transactions",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FaFileInvoiceDollar,
      path: "/reports",
    },
    {
      id: "income",
      label: "Income Sources",
      icon: GiWallet,
      path: "/income",
    },
    {
      id: "settings",
      label: "Settings",
      icon: IoMdSettings,
      path: "/settings",
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find((item) => item.path === currentPath);
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.id);
      setPageTitle(activeMenuItem.label);
    }
  }, [location, menuItems, setPageTitle]);

  const handleMenuClick = (path, id, label) => {
    navigate(path);
    setActiveItem(id);
    setPageTitle(label);
    onMenuClick();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-52 min-h-[90vh] p-5 overflow-y-auto`}
    >
      <div className="flex flex-col gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 p-2 rounded cursor-pointer transition-all duration-300 ${
              activeItem === item.id ? "bg-orange-100" : "hover:bg-orange-100"
            }`}
            onClick={() => handleMenuClick(item.path, item.id, item.label)}
          >
            <div
              className={`w-1 h-8 rounded-md bg-orange-500 transition-all duration-300 ${
                activeItem === item.id ? "opacity-100" : "opacity-0"
              }`}
            />
            {typeof item.icon === "string" ? (
              <img
                src={item.icon || "/placeholder.svg"}
                alt={item.label}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <item.icon
                className={`w-5 h-5 ${
                  activeItem === item.id ? "text-orange-500" : "text-gray-500"
                }`}
              />
            )}
            <p
              className={`text-sm font-medium ${
                activeItem === item.id ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
