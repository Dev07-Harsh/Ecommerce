import { ReactNode, useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
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
  FolderOpen,
  ShieldCheck
} from "lucide-react";
import SuperadminHeader from "./SuperadminHeader";

// Dashboard sections organized into categories
export const dashboardSections = [
  {
    category: "Analytics & Reports",
    color: "blue",
    icon: BarChart3,
    items: [
      {
        title: "User Activity Overview",
        icon: ActivitySquare,
        description: "Monitor user engagement, session data, and activity patterns"
      },
      {
        title: "Site Traffic Analytics",
        icon: BarChart3,
        description: "Analyze visitor traffic, sources, and behavior patterns"
      },
      {
        title: "Sales Reports",
        icon: FileBarChart2,
        description: "Review comprehensive sales data, trends, and projections"
      },
      {
        title: "Merchant Analytics",
        icon: BarChart3,
        description: "Track merchant performance and growth metrics"
      },
      {
        title: "Platform Performance",
        icon: ActivitySquare,
        description: "Monitor system health, response times, and resource usage"
      }
    ]
  },
  {
    category: "Management",
    color: "emerald",
    icon: UserCog,
    items: [
      {
        title: "Merchant Management",
        icon: UserCog,
        description: "Review and manage merchant accounts and applications"
      },
      {
        title: "Product Monitoring",
        icon: ShoppingBag,
        description: "Track product listings, categories, and inventory status"
      },
      {
        title: "Order Management",
        icon: FileBarChart2,
        description: "Process orders, track fulfillment, and manage exceptions"
      },
      {
        title: "Customer Support Management",
        icon: MessageSquare,
        description: "Oversee support tickets, response times, and resolution rates"
      },
      {
        title: "User Management",
        icon: Users,
        description: "Manage user accounts, permissions, and access controls"
      }
    ]
  },
  {
    category: "Operations & Security",
    color: "amber",
    icon: ShieldCheck,
    items: [
      {
        title: "Payment and Transaction Monitoring",
        icon: ShieldCheck,
        description: "Monitor payment processing and transaction security"
      },
      {
        title: "Promotions and Discounts Management",
        icon: Percent,
        description: "Create and manage platform-wide promotions and offers"
      },
      {
        title: "Content Moderation",
        icon: AlertTriangle,
        description: "Review flagged content and enforce community guidelines"
      },
      {
        title: "System Settings Configuration",
        icon: Settings,
        description: "Configure core platform settings and parameters"
      },
      {
        title: "Notifications and Alerts Management",
        icon: Bell,
        description: "Manage system notifications and alert thresholds"
      }
    ]
  },
  {
    category: "Advanced Controls",
    color: "purple",
    icon: ShieldAlert,
    items: [
      {
        title: "Role-Based Access Control (RBAC)",
        icon: ShieldAlert,
        description: "Configure admin roles, permissions, and access levels"
      },
      {
        title: "Product Listing Approval",
        icon: ShoppingBag,
        description: "Review and approve new product submissions"
      },
      {
        title: "Refund and Return Management",
        icon: ShoppingBag,
        description: "Process refund requests and manage return policies"
      },
      {
        title: "Fraud Detection",
        icon: ShieldCheck,
        description: "Monitor and address suspicious activities and platform health"
      },
      {
        title: "Marketplace Health",
        icon: ShieldCheck,
        description: "Monitor and address platform health"
      }
    ]
  },
  {
    category: "Support",
    color: "indigo",
    icon: MessageSquare,
    items: [
      {
        title: "User Support",
        icon: MessageSquare,
        description: "Support for platform users"
      },
      {
        title: "Merchant Support",
        icon: MessageSquare,
        description: "Support for merchants"
      }
    ]
  }
];

// Add Category Management section
export const catalogSection = {
  category: "Catalog Management",
  color: "green",
  icon: FolderOpen,
  items: [
    {
      title: "Categories",
      icon: FolderOpen,
      description: "Manage product categories and subcategories"
    },
    {
      title: "Brand Creation",
      icon: ShoppingBag,
      description: "Manage product brands"
    },
    {
      title: "Attribute",
      icon: Settings,
      description: "Manage product attributes and specifications"
    },
    {
      title: "Homepage Settings",
      icon: Home,
      description: "Manage categories displayed on homepage"
    }
  ]
};

// Get color classes based on category
export const getCategoryColorClasses = (categoryName: string) => {
  // Use the same orange theme for all categories
  return {
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    hover: "hover:text-orange-600",
    active: "bg-orange-200 text-orange-700"
  };
};

const SuperAdminLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState(dashboardSections[0].category);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/superadmin/login" replace />;
  }

  // Redirect to unauthorized page if authenticated but not a superadmin
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole.includes('admin') || userRole === 'super_admin';
  
  if (isAuthenticated && !isAdmin) {
    console.log('Unauthorized access attempt with role:', user?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // If dashboard is selected, navigate to dashboard and collapse all expanded menus
    if (category === "Dashboard") {
      navigate("/superadmin/dashboard");
      setExpandedCategories([]); // Collapse all expanded menus
      return;
    }
    // Toggle category expansion - only one category can be expanded at a time
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? [] // Close if already expanded
        : [category] // Open only this category
    );
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Check if a submenu item is active
  const isSubmenuActive = (itemTitle: string) => {
    const path = location.pathname;
    const itemPath = itemTitle.toLowerCase().replace(/\s+/g, "-");
    return path.includes(itemPath);
  };

  // Check if a category is active (including its submenus)
  const isCategoryActive = (category: string) => {
    // Special case for Dashboard
    if (category === "Dashboard") {
      return location.pathname === "/superadmin/dashboard";
    }

    // Check if any submenu item in the category is active
    const section = dashboardSections.find(section => section.category === category);
    if (section) {
      return section.items.some(item => {
        const itemPath = item.title.toLowerCase().replace(/\s+/g, "-");
        return location.pathname.includes(itemPath);
      });
    }

    // Check Catalog Management items
    if (category === "Catalog Management") {
      return catalogSection.items.some(item => {
        const itemPath = item.title.toLowerCase().replace(/\s+/g, "-");
        return location.pathname.includes(itemPath);
      });
    }

    return false;
  };

  // Get the active category based on current route
  const getActiveCategory = () => {
    const path = location.pathname;
    
    // Check Dashboard first
    if (path === "/superadmin/dashboard") {
      return "Dashboard";
    }

    // Check all dashboard sections
    for (const section of dashboardSections) {
      if (section.items.some(item => {
        const itemPath = item.title.toLowerCase().replace(/\s+/g, "-");
        return path.includes(itemPath);
      })) {
        return section.category;
      }
    }

    // Check Catalog Management
    if (catalogSection.items.some(item => {
      const itemPath = item.title.toLowerCase().replace(/\s+/g, "-");
      return path.includes(itemPath);
    })) {
      return "Catalog Management";
    }

    return null;
  };

  // Update selected category when location changes
  useEffect(() => {
    const activeCategory = getActiveCategory();
    if (activeCategory) {
      setSelectedCategory(activeCategory);
      // Expand the category if it has an active submenu
      if (activeCategory !== "Dashboard") {
        setExpandedCategories([activeCategory]);
      }
    }
  }, [location.pathname]);

  const handleNavigation = (section: string) => {
    const route = `/superadmin/${section.toLowerCase().replace(/\s+/g, "-")}`;
    navigate(route);
    setSelectedCategory(section);
  };

  const handleCatalogItemClick = (item: string) => {
    const route = `/superadmin/${item.toLowerCase()}`;
    navigate(route);
    setSelectedCategory("Catalog Management");
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-orange-500">
      <SuperadminHeader onMenuClick={toggleSidebar} />
      </div>

      <div className="flex pt-16">
        {/* Fixed Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed md:static z-20 transform md:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 h-[calc(100vh-4rem)] top-16 bg-orange-100 shadow-md flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Home className="w-6 h-6 text-black" />
                <h2 className="text-xl font-bold text-black">Super Admin</h2>
              </div>
              <button
                className="md:hidden p-2 text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {/* Dashboard Menu Item */}
              <li>
                <button
                  onClick={() => handleCategorySelect("Dashboard")}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-left
                    ${isCategoryActive("Dashboard") ? 'bg-orange-200 text-orange-700' : 'text-black hover:bg-orange-50'}
                    transition-all duration-200
                  `}
                >
                  <Home className={`w-5 h-5 ${isCategoryActive("Dashboard") ? '' : 'text-gray-500'} mr-3`} />
                  <span className="font-medium">Dashboard</span>
                </button>
              </li>

              {dashboardSections.map((section, index) => {
                const Icon = section.icon;
                const colorClasses = getCategoryColorClasses(section.category);
                const isActive = isCategoryActive(section.category);
                const isExpanded = expandedCategories.includes(section.category);

                return (
                  <li key={index}>
                    <button
                      onClick={() => handleCategorySelect(section.category)}
                      className={`
                        w-full flex items-center px-4 py-3 rounded-lg text-left
                        ${isActive ? colorClasses.active : 'text-black hover:bg-orange-50'}
                        transition-all duration-200
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-500'} mr-3`} />
                      <span className="font-medium">{section.category}</span>
                      <ChevronRight className={`w-4 h-4 ml-auto transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {/* Show section items when expanded */}
                    {isExpanded && (
                      <div className="mt-2 ml-6 space-y-1">
                        {section.items.map((item, itemIndex) => {
                          const ItemIcon = item.icon;
                          const isItemActive = isSubmenuActive(item.title);
                          return (
                            <button
                              key={itemIndex}
                              onClick={() => handleNavigation(item.title)}
                              className={`
                                w-full flex items-center px-3 py-2 rounded-md text-left
                                ${isItemActive ? 'bg-orange-50 text-orange-700' : 'text-black hover:bg-orange-50'}
                              `}
                            >
                              <ItemIcon className={`w-4 h-4 ${isItemActive ? 'text-orange-600' : 'text-gray-500'} mr-2`} />
                              <span className="text-sm">{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
              
              {/* Catalog Management Category */}
              <li>
                <button
                  onClick={() => handleCategorySelect("Catalog Management")}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-left
                    ${isCategoryActive("Catalog Management") ? 
                      getCategoryColorClasses("Catalog Management").active : 
                      'text-black hover:bg-orange-50'}
                    transition-all duration-200
                  `}
                >
                  <FolderOpen className={`w-5 h-5 ${isCategoryActive("Catalog Management") ? '' : 'text-gray-500'} mr-3`} />
                  <span className="font-medium">Catalog Management</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transform transition-transform duration-200 ${expandedCategories.includes("Catalog Management") ? 'rotate-90' : ''}`} />
                </button>
                
                {/* Show catalog items when expanded */}
                {expandedCategories.includes("Catalog Management") && (
                  <div className="mt-2 ml-6 space-y-1">
                    {catalogSection.items.map((item, index) => {
                      const ItemIcon = item.icon;
                      const isItemActive = isSubmenuActive(item.title);
                      return (
                        <button
                          key={index}
                          onClick={() => handleCatalogItemClick(item.title.toLowerCase().replace(/\s+/g, "-"))}
                          className={`
                            w-full flex items-center px-3 py-2 rounded-md text-left
                            ${isItemActive ? 'bg-orange-50 text-orange-700' : 'text-black hover:bg-orange-50'}
                          `}
                        >
                          <ItemIcon className={`w-4 h-4 ${isItemActive ? 'text-orange-600' : 'text-gray-500'} mr-2`} />
                          <span className="text-sm">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;