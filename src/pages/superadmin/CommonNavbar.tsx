import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  ActivitySquare,
  ShoppingBag,
  UserCog,
  FileBarChart2,
  Settings,
  Bell,
  Users,
  AlertTriangle,
  Percent,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  ChevronRight,
  Home,
  Menu,
  X,
  FolderOpen
} from "lucide-react";

// Dashboard sections organized into categories
const dashboardSections = [
  {
    category: "Analytics",
    color: "blue",
    icon: BarChart3,
    items: [
      { title: "User Activity", icon: ActivitySquare },
      { title: "Traffic", icon: BarChart3 },
      { title: "Sales", icon: FileBarChart2 },
      { title: "Merchant Stats", icon: BarChart3 },
      { title: "Performance", icon: ActivitySquare }
    ]
  },
  {
    category: "Management",
    color: "emerald",
    icon: UserCog,
    items: [
      { title: "Merchants", icon: UserCog },
      { title: "Products", icon: ShoppingBag },
      { title: "Orders", icon: ShoppingBag },
      { title: "Support", icon: MessageSquare },
      { title: "Users", icon: Users }
    ]
  },
  {
    category: "Operations",
    color: "amber",
    icon: ShieldCheck,
    items: [
      { title: "Transactions", icon: ShieldCheck },
      { title: "Promotions", icon: Percent },
      { title: "Moderation", icon: AlertTriangle },
      { title: "Settings", icon: Settings },
      { title: "Alerts", icon: Bell }
    ]
  },
  {
    category: "Security",
    color: "purple",
    icon: ShieldAlert,
    items: [
      { title: "Access Control", icon: ShieldAlert },
      { title: "Listing Approval", icon: ShoppingBag },
      { title: "Returns", icon: ShoppingBag },
      { title: "Fraud", icon: ShieldCheck },
      { title: "Health", icon: ShieldCheck }
    ]
  },
  {
    category: "Support",
    color: "indigo",
    icon: MessageSquare,
    items: [
      { title: "User Support", icon: MessageSquare },
      { title: "Merchant Support", icon: MessageSquare }
    ]
  }
];

// Additional navigation links
const additionalLinks = [
  { title: "Categories", path: "/superadmin/categories", icon: FolderOpen },
  { title: "Attribute", path: "/superadmin/attribute", icon: FolderOpen }
];

interface CommonNavbarProps {
  children: React.ReactNode;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const CommonNavbar = ({ 
  children, 
  initialCategory = dashboardSections[0].category,
  onCategoryChange
}: CommonNavbarProps) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get color classes based on category
  const getCategoryColorClasses = (categoryName: string) => {
    const colorMap: Record<string, any> = {
      "Management": {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        hover: "hover:bg-emerald-100/80 hover:text-emerald-700",
        active: "bg-emerald-100 text-emerald-700 font-medium"
      },
      "Operations": {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        hover: "hover:bg-amber-100/80 hover:text-amber-700",
        active: "bg-amber-100 text-amber-700 font-medium"
      },
      "Security": {
        text: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        hover: "hover:bg-purple-100/80 hover:text-purple-700",
        active: "bg-purple-100 text-purple-700 font-medium"
      }
    };
    
    return colorMap[categoryName] || {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      hover: "hover:bg-blue-100/80 hover:text-blue-700",
      active: "bg-blue-100 text-blue-700 font-medium"
    };
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    
    // Close sidebar on mobile when selecting a category
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Update selected category based on URL path
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if the path matches any section item
    for (const section of dashboardSections) {
      for (const item of section.items) {
        const itemPath = `/superadmin/${item.title.toLowerCase().replace(/\s+/g, "-")}`;
        if (currentPath === itemPath) {
          setSelectedCategory(section.category);
          return;
        }
      }
    }
  }, [location.pathname]);

return (
  <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
    <div className="flex flex-1 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm
          transition-transform duration-200 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center gap-3 px-4 border-b bg-white">
          <Home className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold tracking-wide">Admin</h2>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Nav</h3>
            <ul className="space-y-1">
              {dashboardSections.map((section, index) => {
                const Icon = section.icon;
                const isActive = selectedCategory === section.category;
                const colors = getCategoryColorClasses(section.category);

                return (
                  <li key={index}>
                    <button
                      onClick={() => handleCategorySelect(section.category)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors
                        ${isActive ? colors.active : `hover:bg-gray-100 text-gray-700`}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? colors.text : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{section.category}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? colors.text : 'text-gray-400'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tools */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Tools</h3>
            <ul className="space-y-1">
              {additionalLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <li key={`tool-${index}`}>
                    <button
                      onClick={() => handleNavigation(link.path)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors
                        ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                        <span className="text-sm">{link.title}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t text-xs text-gray-500 bg-gray-50 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>v1.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden h-14 flex items-center gap-3 px-4 border-b bg-white shadow-sm">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <span className="text-base font-medium">Admin</span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto p-4 bg-white">
          {children}
        </div>
      </main>
    </div>

    {/* Mobile Sidebar Toggle */}
    <button
      onClick={toggleSidebar}
      className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
    >
      {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  </div>
);

};

export default CommonNavbar;