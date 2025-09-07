// src/components/Layout.jsx
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Menu, 
  X,
  LogOut,
  Search,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const Layout = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Customers', href: '/customers', icon: Briefcase },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-64 bg-gray-900 h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">CRM</span>
              </div>
              <span className="ml-2 text-white font-semibold">Mini CRM</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-gray-300">{user?.role || 'Agent'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-900 pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">CRM</span>
            </div>
            <span className="ml-2 text-white font-semibold">Mini CRM</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-gray-300 capitalize">{user?.role || 'Agent'}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-lg md:max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>

              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{user?.role || 'Agent'}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;