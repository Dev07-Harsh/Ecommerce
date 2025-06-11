import React, { useEffect, useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Filter, ArrowLeft, ArrowRight, Eye } from "lucide-react";

// Define types for our content moderation items
export interface ModerationItem {
  id: string;
  type: "description" | "image" | "review";
  content: string;
  merchantId: string;
  merchantName: string;
  productId: string;
  productName: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  flaggedReason?: string;
  imageUrl?: string;
  rating?: number; // For reviews
  reviewTitle?: string; // For reviews
  reviewerName?: string; // For reviews
}

// Mock data - will be used as fallback if API fails
const mockModerationItems: ModerationItem[] = [
  {
    id: "mod1",
    type: "description",
    content: "This revolutionary product will change your life forever! It cures all ailments and makes you feel 20 years younger overnight.",
    merchantId: "merch1",
    merchantName: "Health Solutions Inc.",
    productId: "prod1",
    productName: "Ultimate Health Booster",
    submittedAt: "2025-04-28T14:30:00Z",
    status: "pending",
    flaggedReason: "Potentially misleading health claims"
  },
  {
    id: "mod2",
    type: "image",
    content: "Product image",
    merchantId: "merch2",
    merchantName: "Fashion Forward",
    productId: "prod2",
    productName: "Designer Handbag",
    submittedAt: "2025-04-29T10:15:00Z",
    status: "pending",
    imageUrl: "/api/placeholder/400/320"
  },
  {
    id: "mod3",
    type: "review",
    content: "This product is absolutely terrible. It broke after one use and customer service refused to help me. I will never shop here again!",
    merchantId: "merch3",
    merchantName: "Tech Gadgets",
    productId: "prod3",
    productName: "Wireless Earbuds",
    submittedAt: "2025-04-29T16:45:00Z",
    status: "pending",
    reviewTitle: "Worst Purchase Ever",
    reviewerName: "Angry Customer",
    rating: 1,
    flaggedReason: "Potential competitor review"
  },
  {
    id: "mod4",
    type: "description",
    content: "High-quality leather wallet with RFID protection. Features 8 card slots and a zippered coin pocket.",
    merchantId: "merch4",
    merchantName: "Luxury Goods",
    productId: "prod4",
    productName: "Leather Wallet",
    submittedAt: "2025-04-30T09:20:00Z",
    status: "pending"
  },
  {
    id: "mod5",
    type: "review",
    content: "I've been using this product for about a month now and I'm very happy with it. The quality is excellent and it works exactly as described.",
    merchantId: "merch2",
    merchantName: "Fashion Forward",
    productId: "prod5",
    productName: "Winter Jacket",
    submittedAt: "2025-04-30T11:10:00Z",
    status: "pending",
    reviewTitle: "Great Quality Product",
    reviewerName: "Satisfied Shopper",
    rating: 5
  },
  {
    id: "mod6",
    type: "image",
    content: "Product image showing supplement facts",
    merchantId: "merch1",
    merchantName: "Health Solutions Inc.",
    productId: "prod6",
    productName: "Vitamin Complex",
    submittedAt: "2025-05-01T08:30:00Z",
    status: "pending",
    imageUrl: "/api/placeholder/400/320",
    flaggedReason: "Potential unverified nutrition claims"
  }
];

// API service - centralizes all API calls
const moderationService = {
  // Get all moderation items with optional filters
  getItems: async (params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string; 
    search?: string;
  }): Promise<{ items: ModerationItem[]; total: number }> => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // Try to fetch from API
      const response = await fetch(`/api/moderation-items${queryString}`);
      
      // If successful, return the data
      if (response.ok) {
        const data = await response.json();
        return { items: data.items, total: data.total };
      }
      
      // If API call fails, use mock data
      console.warn("API call failed, using mock data");
      throw new Error("API call failed");
    } catch (error) {
      // For development/demo purposes, simulate backend pagination
      let filteredItems = [...mockModerationItems];
      
      // Apply type filter
      if (params?.type && params.type !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === params.type);
      }
      
      // Apply status filter
      if (params?.status && params.status !== 'all') {
        filteredItems = filteredItems.filter(item => item.status === params.status);
      }
      
      // Apply search
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.productName.toLowerCase().includes(searchLower) ||
          item.merchantName.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);
      
      return { 
        items: paginatedItems, 
        total: filteredItems.length 
      };
    }
  },
  
  // Approve a moderation item
  approveItem: async (itemId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/moderation-items/${itemId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.warn("API call failed, simulating approval");
      return true; // Simulate successful approval
    }
  },
  
  // Reject a moderation item
  rejectItem: async (itemId: string, reason: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/moderation-items/${itemId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      return response.ok;
    } catch (error) {
      console.warn("API call failed, simulating rejection");
      return true; // Simulate successful rejection
    }
  }
};

const ContentModeration = () => {
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "description" | "image" | "review">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const itemsPerPage = 10;

  // Fetch moderation items
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await moderationService.getItems({
        page: currentPage,
        limit: itemsPerPage,
        type: typeFilter,
        status: statusFilter,
        search: searchTerm
      });
      
      setModerationItems(result.items);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error fetching moderation items:", error);
      setError("Failed to load content moderation items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever filters or pagination changes
  useEffect(() => {
    fetchItems();
  }, [currentPage, typeFilter, statusFilter, searchTerm]);

  // Handle approve action
  const handleApprove = async (itemId: string) => {
    try {
      setLoading(true);
      const success = await moderationService.approveItem(itemId);
      
      if (success) {
        // Update local state
        setModerationItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, status: "approved" } : item
          )
        );
        
        // Close detail view if the approved item is currently selected
        if (selectedItem?.id === itemId) {
          setSelectedItem(null);
        }
      } else {
        setError("Failed to approve the item. Please try again.");
      }
    } catch (error) {
      console.error("Error approving item:", error);
      setError("An error occurred while approving the item.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject action
  const handleReject = async (itemId: string, reason: string) => {
    try {
      setLoading(true);
      const success = await moderationService.rejectItem(itemId, reason);
      
      if (success) {
        // Update local state
        setModerationItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { 
              ...item, 
              status: "rejected", 
              flaggedReason: reason || "Content violates platform policy" 
            } : item
          )
        );
        
        // Close detail view if the rejected item is currently selected
        if (selectedItem?.id === itemId) {
          setSelectedItem(null);
        }
        
        setRejectionReason("");
      } else {
        setError("Failed to reject the item. Please try again.");
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
      setError("An error occurred while rejecting the item.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new timeout
    window.searchTimeout = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page on new search
    }, 300); // 300ms debounce
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render stars for review ratings
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`text-lg ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Display content based on type
  const renderContent = (item: ModerationItem) => {
    switch (item.type) {
      case "description":
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-800">{item.content}</p>
          </div>
        );
      case "image":
        return (
          <div className="text-center">
            <img 
              src={item.imageUrl} 
              alt={`Product image for ${item.productName}`}
              className="max-w-full h-auto mx-auto rounded-md border border-gray-200"
            />
          </div>
        );
      case "review":
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{item.reviewTitle}</span>
              {item.rating && renderRatingStars(item.rating)}
            </div>
            <p className="text-gray-800 mb-2">{item.content}</p>
            <p className="text-sm text-gray-600">By: {item.reviewerName}</p>
          </div>
        );
      default:
        return <p>Unknown content type</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-purple-600 w-8 h-8" />
          <h1 className="text-3xl font-bold text-gray-800">Content Moderation</h1>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by product, merchant, or content..."
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="description">Descriptions</option>
                <option value="image">Images</option>
                <option value="review">Reviews</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content List */}
        {loading && moderationItems.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">Loading moderation items...</p>
          </div>
        ) : moderationItems.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">No moderation items found matching your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-purple-100 text-purple-800">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Merchant</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationItems.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${item.type === "description" ? "bg-blue-100 text-blue-800" : 
                           item.type === "image" ? "bg-green-100 text-green-800" : 
                           "bg-yellow-100 text-yellow-800"}`}
                        >
                          {item.type}
                          {item.flaggedReason && (
                            <AlertTriangle className="ml-1 w-3 h-3 text-red-500" />
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800">{item.productName}</td>
                      <td className="p-4 text-gray-600">{item.merchantName}</td>
                      <td className="p-4 text-gray-500">{formatDate(item.submittedAt)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${item.status === "pending" ? "bg-gray-100 text-gray-800" : 
                           item.status === "approved" ? "bg-green-100 text-green-800" : 
                           "bg-red-100 text-red-800"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md flex items-center gap-1"
                            disabled={loading}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md flex items-center gap-1"
                                disabled={loading}
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1"
                                disabled={loading}
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className={`p-2 rounded-md ${currentPage === 1 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {/* Show limited page numbers with ellipsis for large page counts */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNum 
                            ? 'bg-purple-500 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className={`p-2 rounded-md ${currentPage === totalPages || loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="capitalize">{selectedItem.type}</span> Moderation
                  {selectedItem.flaggedReason && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="mr-1 w-3 h-3" />
                      Flagged
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-medium">{selectedItem.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Merchant</p>
                    <p className="font-medium">{selectedItem.merchantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium">{formatDate(selectedItem.submittedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${selectedItem.status === "pending" ? "bg-gray-100 text-gray-800" : 
                       selectedItem.status === "approved" ? "bg-green-100 text-green-800" : 
                       "bg-red-100 text-red-800"}`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
                
                {selectedItem.flaggedReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Flagged reason:</strong> {selectedItem.flaggedReason}
                    </p>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Content:</p>
                  {renderContent(selectedItem)}
                </div>
              </div>

              {selectedItem.status === "pending" && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Take Action</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason (optional for "Reject" action)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      rows={3}
                      placeholder="Explain why this content is being rejected..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleApprove(selectedItem.id)}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedItem.id, rejectionReason)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Type declaration for the timeout property
declare global {
  interface Window {
    searchTimeout: ReturnType<typeof setTimeout>;
  }
}

export default ContentModeration;