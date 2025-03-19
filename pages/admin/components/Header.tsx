import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Bell, Search, User, Moon, Sun, Menu, X } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New candidate added", time: "2 min ago", unread: true },
    { id: 2, text: "Elections results published", time: "1 hour ago", unread: true },
    { id: 3, text: "System maintenance scheduled", time: "1 day ago", unread: false },
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle theme toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header 
      className={`sticky top-0 z-30 bg-white ${
        isScrolled ? "shadow-md" : ""
      } transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section - Title */}
        <div className="hidden lg:flex items-center">
          {/* <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1> */}
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-full overflow-hidden pl-4 pr-1 py-1">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-600 ml-2"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right section - User Menu & Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-700" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 overflow-hidden"
              >
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${
                          notification.unread ? "border-blue-500" : "border-transparent"
                        }`}
                      >
                        <p className={`text-sm ${notification.unread ? "font-medium" : "font-normal"} text-gray-800`}>
                          {notification.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t px-4 py-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {session?.user?.email ? session.user.email[0].toUpperCase() : "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {session?.user?.email?.split('@')[0] || "Admin User"}
                </p>
                <p className="text-xs text-gray-500"> {session?.user?.role || "Admin User"}
                </p>
              </div>
            </button>

            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="py-1 divide-y divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-900 font-medium">
                    {session?.user?.email?.split('@')[0] || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

