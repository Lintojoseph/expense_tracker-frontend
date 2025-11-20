import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  LogOut 
} from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    // { name: 'Add Expense', href: '/add-expense', icon: PlusCircle },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                isActive(item.href)
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <div className="w-64 bg-white h-screen border-r border-gray-200 fixed">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800">Budget Tracker</h1>
            <p className="text-sm text-gray-600 mt-2">Welcome, {user?.name}</p>
          </div>
          
          <nav className="mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-64">
          <main className="p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile main content */}
      <div className="md:hidden">
        <main className="p-4 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;