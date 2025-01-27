import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onMenuClick }) => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'https://dashboard.codeparrot.ai/api/image/Z5UTT9gGlUAkMdF9/home-2.png',
      path: '/dashboard',
      isActive: true 
    },
    { 
      id: 'transactions',
      label: 'Transactions',
      icon: 'https://dashboard.codeparrot.ai/api/image/Z5UTT9gGlUAkMdF9/transact.png',
      path: '/transactions',
      isActive: false
    },
    { 
      id: 'reports',
      label: 'Reports',
      icon: 'https://dashboard.codeparrot.ai/api/image/Z5UTT9gGlUAkMdF9/economic.png',
      path: '/reports',
      isActive: false
    },
    { 
      id: 'income',
      label: 'Income Sources',
      icon: 'https://dashboard.codeparrot.ai/api/image/Z5UTT9gGlUAkMdF9/credit-c.png',
      path: '/income',
      isActive: false
    },
    { 
      id: 'settings',
      label: 'Settings',
      icon: 'https://dashboard.codeparrot.ai/api/image/Z5UTT9gGlUAkMdF9/vector.png',
      path: '/settings',
      isActive: false
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    onMenuClick();
  };

  return (
    <div>
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-52 min-h-[90vh] bg-white p-5`}>
        <div className="flex flex-col gap-10">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-1 rounded cursor-pointer transition-all duration-300 ${item.isActive ? 'bg-orange-100' : 'hover:bg-orange-100'}`}
              onClick={() => handleMenuClick(item.path)}
            >
              {item.isActive && <div className="w-2 h-10 rounded-md bg-orange-500" />}
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-6 h-6 object-contain"
              />
              <p className={`text-md font-medium ${item.isActive ? 'text-orange-500' : 'text-gray-500'}`}>
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
