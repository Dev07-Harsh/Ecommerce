import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Filter, 
  Check, 
  X, 
  Info,
  AlertCircle,
  Eye,
  Loader
} from 'lucide-react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface for merchant document data
interface MerchantDocument {
  id: number;
  document_type: string;
  status: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  admin_notes?: string;
  verified_at?: string;
  created_at: string;
}

interface Merchant {
  id: number;
  user_id: number;
  name: string; // Combination of first_name and last_name
  email: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_description: string;
  business_address: string;
  status: string;
  dateApplied: string; // created_at
  description: string; // business_description
  rejectionReason?: string;
  documents: {
    businessLicense: boolean;
    taxCertificate: boolean;
    identityProof: boolean;
  };
  verification_status: string;
  verification_submitted_at?: string;
  verification_completed_at?: string;
  verification_notes?: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
  }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// Main component
const MerchantManagement: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch merchants from API
  useEffect(() => {
    const fetchMerchants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all users with merchant role
        const response = await fetch(`${API_BASE_URL}/api/admin/merchants`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch merchants: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched merchants:', data);
                // Transform the data to match our component's expected format
        const transformedMerchants = data.merchants.map((merchant: any) => ({
          id: merchant.id,
          user_id: merchant.user_id,
          name: `${merchant.user?.first_name || ''} ${merchant.user?.last_name || ''}`.trim(),
          email: merchant.user?.email || '',
          business_name: merchant.business_name,
          business_email: merchant.business_email,
          business_phone: merchant.business_phone || '',
          business_description: merchant.business_description || '',
          business_address: merchant.business_address || '',
          status: merchant.verification_status?.toLowerCase() || 'pending',
          dateApplied: new Date(merchant.created_at).toISOString().split('T')[0],
          description: merchant.business_description || '',
          rejectionReason: merchant.verification_notes,
          verification_status: merchant.verification_status,
          verification_submitted_at: merchant.verification_submitted_at,
          verification_completed_at: merchant.verification_completed_at,
          verification_notes: merchant.verification_notes,
          // Store the original document objects for later use
          documentList: merchant.documents || [],
          // Create a simplified document status object for quick checks
          documents: {
            businessLicense: merchant.documents?.some((doc: any) => doc.document_type === 'BUSINESS_LICENSE') || false,
            taxCertificate: merchant.documents?.some((doc: any) => doc.document_type === 'TAX_CERTIFICATE') || false,
            identityProof: merchant.documents?.some((doc: any) => doc.document_type === 'IDENTITY_PROOF') || false
          }
        }));
        
        setMerchants(transformedMerchants);
      } catch (err) {
        console.error('Error fetching merchants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (accessToken) {
      fetchMerchants();
    }
  }, [accessToken]);

  // Filter merchants based on search and status
  useEffect(() => {
    let results = merchants;
    
    if (searchTerm) {
      results = results.filter(merchant => 
        merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      results = results.filter(merchant => merchant.status === statusFilter);
    }
    
    setFilteredMerchants(results);
  }, [merchants, searchTerm, statusFilter]);

  // Handle merchant approval
  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/merchants/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve merchant: ${response.status}`);
      }
      
      // Update local state
      const updatedMerchants = merchants.map(merchant => 
        merchant.id === id ? { ...merchant, status: "approved" } : merchant
      );
      setMerchants(updatedMerchants);
      setShowApprovalModal(false);
      setSelectedMerchant(null);
    } catch (err) {
      console.error('Error approving merchant:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve merchant');
    }
  };

  // Handle merchant rejection
  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/merchants/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject merchant: ${response.status}`);
      }
      
      // Update local state
      const updatedMerchants = merchants.map(merchant => 
        merchant.id === id ? { ...merchant, status: "rejected", rejectionReason } : merchant
      );
      setMerchants(updatedMerchants);
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedMerchant(null);
    } catch (err) {
      console.error('Error rejecting merchant:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject merchant');
    }
  };

  // Navigate to merchant details page with document data
  const viewMerchantDetails = (merchant: any) => {
    // Store merchant data in sessionStorage to avoid additional API calls
    sessionStorage.setItem('selectedMerchant', JSON.stringify(merchant));
    navigate(`/superadmin/merchant-management/${merchant.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Merchant Management</h1>
      
      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search merchants by name or email"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <div className="relative inline-flex items-center">
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-600">Loading merchants...</p>
          </div>
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No merchants found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#FF5733]/10 text-[#FF5733]/90">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                        <div className="text-sm text-gray-500">{merchant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.dateApplied}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={merchant.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => viewMerchantDetails(merchant)}
                        className="text-[#FF5733] hover:text-[#FF4500] transition-colors"
                      >
                        View Details
                      </button>
                      {merchant.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setShowApprovalModal(true);
                            }}
                            className="bg-[#FF5733] text-white px-3 py-1 rounded hover:bg-[#FF4500] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setShowRejectionModal(true);
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            Reject
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
      )}
      
      {/* Approval Modal */}
      {showApprovalModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-green-500 mb-4">
              <Check size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">Approve Merchant</h3>
            </div>
            <p className="mb-6">
              Are you sure you want to approve <span className="font-semibold">{selectedMerchant.name}</span> as a merchant on your platform?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedMerchant(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedMerchant.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejection Modal */}
      {showRejectionModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-500 mb-4">
              <X size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">Reject Merchant</h3>
            </div>
            <p className="mb-4">
              Please provide a reason for rejecting <span className="font-semibold">{selectedMerchant.name}</span>:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedMerchant(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedMerchant.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-700">Pending Applications</h4>
            <span className="text-xl font-bold text-blue-700">
              {merchants.filter(m => m.status === "pending").length}
            </span>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-green-700">Approved Merchants</h4>
            <span className="text-xl font-bold text-green-700">
              {merchants.filter(m => m.status === "approved").length}
            </span>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-red-700">Rejected Applications</h4>
            <span className="text-xl font-bold text-red-700">
              {merchants.filter(m => m.status === "rejected").length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Help Info */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg flex items-start">
        <Info size={20} className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-700 mb-1">Managing Merchants</h4>
          <p className="text-sm text-blue-600">
            Review merchant applications thoroughly before approval. Check all verification documents 
            and ensure they meet platform requirements. When rejecting an application, provide a clear 
            and specific reason to help merchants understand what they need to correct.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MerchantManagement;