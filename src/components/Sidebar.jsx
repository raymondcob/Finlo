import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { GiWallet } from "react-icons/gi";
import { IoMdSettings } from "react-icons/io";
import { PageTitleContext } from '../context/PageTitleContext';

const Sidebar = ({ isOpen, onMenuClick }) => {
  const navigate = useNavigate();
  const { setPageTitle } = useContext(PageTitleContext);
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { 
      id: 'dashboard',
      label: 'Dashboard',
      icon: AiFillHome,
      path: '/dashboard'
    },
    { 
      id: 'transactions',
      label: 'Transactions',
      icon: FaMoneyBillTransfer,
      path: '/transactions'
    },
    { 
      id: 'reports',
      label: 'Reports',
      icon: FaFileInvoiceDollar,
      path: '/reports'
    },
    { 
      id: 'income',
      label: 'Income Sources',
      icon: GiWallet,
      path: '/income'
    },
    { 
      id: 'settings',
      label: 'Settings',
      icon: IoMdSettings,
      path: '/settings'
    }
  ];

  const handleMenuClick = (path, id,label) => {
    navigate(path);
    setActiveItem(id);
    setPageTitle(label);
    onMenuClick();
  };

  return (
    <div>
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-52 min-h-[90vh] bg-white p-5`}>
        <div className="flex flex-col gap-10">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-1 rounded cursor-pointer transition-all duration-300 ${activeItem === item.id ? 'bg-orange-100' : 'hover:bg-orange-100'}`}
              onClick={() => handleMenuClick(item.path, item.id, item.label)}
            >
              <div className={`w-2 h-10 rounded-md bg-orange-500 transition-all duration-300 ${activeItem === item.id ? 'block' : 'hidden'}`} />
              {typeof item.icon === 'string' ? (
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <item.icon className={`w-6 h-6 ${activeItem === item.id ? 'text-orange-500' : 'text-gray-500'}`} />
              )}
              <p className={`text-md font-medium ${activeItem === item.id ? 'text-orange-500' : 'text-gray-500'}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
