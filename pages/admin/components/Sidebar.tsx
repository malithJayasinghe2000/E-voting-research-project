"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { icon } from "leaflet";

const navItems = [
  { href: "/admin/page", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/manageplk/", 
    label: "Divisional Secretaries", 
    icon: Users ,
    subLinks: [
      { href: "/admin/manageplk/createPlk", label: "Create" },
      { href: "/admin/manageplk/manage", label: "Manage" },
    ],
  },
  { href: "/admin/manageGsw/", 
    label: "Grama Niladhari", 
    icon: Users ,
    subLinks: [
      { href: "/admin/manageGsw/create", label: "Create" },
      { href: "/admin/manageGsw/manage", label: "Manage" },
    ],
  },
  {
    href: "/admin/elections",
    label: "Elections",
    icon: FileText,
    subLinks: [
      { href: "/admin/elections/page", label: "Create Election" },
      { href: "/admin/elections/manage", label: "Manage Elections" },
    ],
  },
  {
    href: "/admin/polingManager",
    label: "polling managers",
    icon: Users,
    subLinks: [
      { href: "/admin/polingManagers/create", label: "Add Polling Manager" },
      { href: "/admin/polingManagers/manage", label: "Manage Polling Manager" },
      { href: "/admin/polingManagers/results", label: "Results" },
    ],
  },
  {
    href: "/admin/manageResults",
    label: "Results",
    icon: Users,
    subLinks: [
      { href: "/admin/manageResults/release", label: "Release results" },
      // { href: "/admin/voters/manage", label: "Manage Voters" },
    ],
  },

  {
    href: "/admin/dd",
    label: "Add Voters",
    icon: Users,
    subLinks: [
      { href: "/admin/dd/create", label: "Add Polling Manager" },
      { href: "/admin/ded/manage", label: "Manage Polling Manager" },
    ],
  },

  { href: "/admin/candidates", 
    label: "Candidates", 
    icon: Users ,
    subLinks: [
      { href: "/admin/candidates/create", label: "Add Candidate" },
      { href: "/admin/candidates/manage", label: "Manage Candidates" },
    ],
  },

  { href: "/admin/parties", 
    label: "Parties", 
    icon: Users ,
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

  const toggleDropdown = (href: string) => {
    setOpenDropdown(openDropdown === href ? null : href);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      
      {/* Conditionally Render Mobile Menu Button */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="block md:hidden fixed top-4 left-4 z-50 text-gray-200 p-2 bg-gray-800 rounded-full"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close Button for Mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 md:hidden text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <nav className="p-4">
          <ul>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.href} className="mb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.subLinks ? "#" : item.href}
                      onClick={item.subLinks ? () => toggleDropdown(item.href) : undefined}
                      className={`flex items-center p-2 rounded hover:bg-gray-700 transition-colors ${
                        isActive ? "bg-gray-700" : ""
                      }`}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Link>
                    {item.subLinks && (
                      <button
                        onClick={() => toggleDropdown(item.href)}
                        className="text-gray-400 focus:outline-none"
                      >
                        {openDropdown === item.href ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {item.subLinks && openDropdown === item.href && (
                    <ul className="pl-6 mt-2 space-y-1">
                      {item.subLinks.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`block p-2 rounded hover:bg-gray-700 transition-colors ${
                              pathname === subItem.href ? "bg-gray-700" : ""
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Overlay Adjustment */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64 md:ml-0" : "ml-0"
        } md:ml-64`}
      >
        {/* Empty for content adjustment */}
      </div>
    </>
  );
}
