"use client";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Flag,
  Vote,
  BarChart2,
  Award,
  Building,
  UserCheck,
  MapPin,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { href: "/admin/page", label: "Dashboard", icon: LayoutDashboard },
  { 
    href: "/admin/manageplk/", 
    label: "Divisional Secretaries", 
    icon: Building,
    subLinks: [
      { href: "/admin/manageplk/createPlk", label: "Create" },
      { href: "/admin/manageplk/manage", label: "Manage" },
    ],
  },
  { 
    href: "/admin/manageGsw/", 
    label: "Grama Niladhari", 
    icon: MapPin,
    subLinks: [
      { href: "/admin/manageGsw/create", label: "Create" },
      { href: "/admin/manageGsw/manage", label: "Manage" },
    ],
  },
  {
    href: "/admin/elections",
    label: "Elections",
    icon: Vote,
    subLinks: [
      { href: "/admin/elections/page", label: "Create Election" },
      { href: "/admin/elections/manage", label: "Manage Elections" },
    ],
  },
  {
    href: "/admin/polingManager",
    label: "Polling Managers",
    icon: UserCheck,
    subLinks: [
      { href: "/admin/polingManagers/create", label: "Add Polling Manager" },
      { href: "/admin/polingManagers/manage", label: "Manage Polling Manager" },
      { href: "/admin/polingManagers/results", label: "Results" },
    ],
  },
  {
    href: "/admin/manageResults",
    label: "Results",
    icon: BarChart2,
    subLinks: [
      { href: "/admin/manageResults/release", label: "Release Results" },
    ],
  },
  {
    href: "/admin/voters",
    label: "Voters",
    icon: Users,
    subLinks: [
      { href: "/admin/voters/create", label: "Add Voters" },
      { href: "/admin/voters/manage", label: "Manage Voters" },
    ],
  },
  { 
    href: "/admin/candidates", 
    label: "Candidates", 
    icon: Award,
    subLinks: [
      { href: "/admin/candidates/create", label: "Add Candidate" },
      { href: "/admin/candidates/manage", label: "Manage Candidates" },
    ],
  },
  { 
    href: "/admin/parties", 
    label: "Parties", 
    icon: Flag,
    subLinks: [
      { href: "/admin/parties/create", label: "Add Party" },
      { href: "/admin/parties/manage", label: "Manage Parties" },
    ],
  },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>("");

  // Set active item on path change
  useEffect(() => {
    // Find which main section is active
    const active = navItems.find(item => 
      pathname === item.href || 
      (item.subLinks && item.subLinks.some(sub => pathname === sub.href))
    );
    
    if (active) {
      setActiveItem(active.href);
      setOpenDropdown(active.href);
    }
  }, [pathname]);

  const toggleDropdown = (href: string) => {
    setOpenDropdown(openDropdown === href ? null : href);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="block lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white z-40 shadow-2xl transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Admin Logo Area */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-indigo-700">
          <Link href="/admin/page" className="flex items-center">
            <div className="relative h-10 w-10 mr-3">
              {/* <Image
                src="/assets/images/gov-logo-small.png"
                alt="Admin Logo"
                width={40}
                height={40}
                layout="responsive"
              /> */}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                Election <span className="text-blue-300">Handle</span>
              </h1>
              <p className="text-xs text-indigo-300">Administration</p>
            </div>
          </Link>
          
          {/* Close Button (Mobile) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-indigo-300 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-76px)]">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.subLinks && item.subLinks.some(sub => pathname === sub.href));
              const isOpen = openDropdown === item.href;
              
              return (
                <div key={item.href} className="mb-1">
                  <button
                    onClick={() => {
                      if (item.subLinks) {
                        toggleDropdown(item.href);
                      } else {
                        // Navigate to the href
                        window.location.href = item.href;
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-indigo-700 text-white shadow-md" 
                        : "text-indigo-100 hover:bg-indigo-700/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    
                    {item.subLinks && (
                      <div className="text-indigo-300">
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.subLinks && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-10 pr-4 py-2 space-y-1">
                        {item.subLinks.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              pathname === subItem.href
                                ? "bg-indigo-600/50 text-white font-medium"
                                : "text-indigo-200 hover:bg-indigo-700/30 hover:text-white"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Logout Button */}
          {/* <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-100 rounded-lg transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div> */}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Content offset for desktop */}
      <div className="lg:ml-72"></div>
    </>
  );
}
