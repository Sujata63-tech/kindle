import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  PenTool, 
  MessageCircle, 
  ShoppingBag, 
  Book,
  ShoppingCart,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    {
      title: 'Todo Lists',
      icon: CheckSquare,
      path: '/todos',
      description: 'Manage your tasks'
    },
    {
      title: 'Poetry Section',
      icon: PenTool,
      path: '/poetry',
      description: 'Read & Write poetry'
    },
    {
      title: 'Chat Hub',
      icon: MessageCircle,
      path: '/chat',
      description: 'Connect with others'
    },
    {
      title: 'Book Store',
      icon: Book,
      path: '/books',
      description: 'Browse books'
    },
    {
      title: 'Shopping Cart',
      icon: ShoppingCart,
      path: '/cart',
      description: 'Your selected items'
    },
    {
      title: 'My Orders',
      icon: ShoppingBag,
      path: '/orders',
      description: 'Purchase history'
    }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) => `
        group flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/20
        ${isActive 
          ? 'bg-gradient-to-r from-rosegold-500/20 to-rosegold-600/20 border-l-4 border-rosegold-500 text-rosegold-700' 
          : 'text-beige-700 hover:text-rosegold-600'
        }
      `}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.title}</p>
        <p className="text-xs opacity-70 truncate">{item.description}</p>
      </div>
    </NavLink>
  );

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-md border-r border-white/30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-rosegold-500 to-beige-500 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-gradient">
                Online Kindle
              </h1>
              <p className="text-xs text-beige-600">Digital Library</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-beige-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-rosegold-400 to-beige-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-beige-800">{user?.username}</p>
              <p className="text-sm text-beige-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-beige-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs font-semibold text-beige-500 uppercase tracking-wider mb-3">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  group flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/20
                  ${isActive 
                    ? 'bg-gradient-to-r from-rosegold-500/20 to-rosegold-600/20 border-l-4 border-rosegold-500 text-rosegold-700' 
                    : 'text-beige-700 hover:text-rosegold-600'
                  }
                `}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Admin Panel</p>
                  <p className="text-xs opacity-70 truncate">Manage system</p>
                </div>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="text-center">
           
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
