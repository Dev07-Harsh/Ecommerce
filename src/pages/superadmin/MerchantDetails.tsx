import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    AlertCircle, 
    FileText, 
    X, 
    ChevronLeft, 
    ChevronRight,
    Eye,        
    Loader2,    
    CheckCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface Document - from your initial code
interface Document {
  id: number;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: string;
  admin_notes?: string;
  verified_at?: string;
}

// Interface Merchant - from your initial code
interface Merchant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  category: string;
  dateApplied: string;
  description: string;
  rejectionReason?: string;
  country_code: string;
  pan_number?: string;
  gstin?: string;
  tax_id?: string;
  vat_number?: string;
  sales_tax_number?: string;
  bank_account_number: string;
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc_code?: string;
  bank_swift_code?: string;
  bank_routing_number?: string;
  bank_iban?: string;
  documents: Document[];
}

// documentTypeMapping - from your initial code
const documentTypeMapping: { [key: string]: string } = {
  business_registration_in: 'Business Registration (India)',
  business_registration_global: 'Business Registration (Global)',
  pan_card: 'PAN Card',
  gstin: 'GSTIN Certificate',
  aadhar: 'Aadhar Card',
  business_address_proof_in: 'Business Address Proof (India)',
  business_address_proof_global: 'Business Address Proof (Global)',
  cancelled_cheque: 'Cancelled Cheque',
  bank_account_in: 'Bank Account Details (India)',
  bank_account_global: 'Bank Account Details (Global)',
  gst_certificate: 'GST Certificate',
  msme_certificate: 'MSME Certificate',
  dsc: 'Digital Signature Certificate',
  tax_id_global: 'Tax ID (Global)',
  sales_tax_reg: 'Sales Tax Registration',
  passport: 'Passport',
  sales_tax_permit: 'Sales Tax Permit',
  small_business_cert: 'Small Business Certificate',
  esign_certificate: 'E-Sign Certificate',
  return_policy: 'Return Policy',
  shipping_details: 'Shipping Details',
  product_list: 'Product List',
  category_list: 'Category List',
  brand_approval: 'Brand Approval',
  brand_authorization: 'Brand Authorization'
};

// documentKeyMapping - from your initial code (not actively used in MerchantDetails but kept for completeness if needed elsewhere)
const documentKeyMapping: { [key: string]: string } = {
  'Business Registration': 'business_registration_in',
  'PAN Card': 'pan_card',
  'GSTIN Certificate': 'gstin',
  'Identity Proof': 'aadhar',
  'Address Proof': 'business_address_proof_in',
  'Cancelled Cheque': 'cancelled_cheque',
  'GST Certificate': 'gst_certificate',
  'MSME Certificate': 'msme_certificate',
  'Digital Signature': 'dsc',
  'Return Policy': 'return_policy',
  'Shipping Details': 'shipping_details',
  'Product List': 'product_list',
  'Category List': 'category_list',
  'Brand Approval': 'brand_approval',
  'Brand Authorization': 'brand_authorization'
};

// DocumentViewer Component
const DocumentViewer: React.FC<{
  documents: Document[];
  onClose: () => void;
  initialDocKey: string;
  onApprove: (documentId: number) => Promise<void>;
  onReject: (documentId: number, reason: string) => Promise<void>;
  isActionLoading: boolean;
}> = ({ documents, onClose, initialDocKey, onApprove, onReject, isActionLoading }) => {
  const [currentDocKey, setCurrentDocKey] = useState(initialDocKey);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const documentKeys = documents.map(doc => doc.id.toString());
  const currentIndex = documentKeys.indexOf(currentDocKey);
  
  const goToNext = () => {
    if (currentIndex < documentKeys.length - 1) {
      setCurrentDocKey(documentKeys[currentIndex + 1]);
      setIsLoading(true);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentDocKey(documentKeys[currentIndex - 1]);
      setIsLoading(true);
    }
  };
  
  const currentDoc = documents.find(doc => doc.id.toString() === currentDocKey);
  const documentId = currentDoc?.id;
  const documentStatus = currentDoc?.status.toLowerCase() || '';
  
  const isPDF = currentDoc?.mime_type === 'application/pdf' || currentDoc?.file_name.toLowerCase().endsWith('.pdf');
  const isImage = currentDoc?.mime_type.startsWith('image/') || 
                 (currentDoc?.file_name.toLowerCase().endsWith('.jpg') || 
                  currentDoc?.file_name.toLowerCase().endsWith('.jpeg') || 
                  currentDoc?.file_name.toLowerCase().endsWith('.png'));
  const isExcel = currentDoc?.mime_type === 'application/vnd.ms-excel' || 
                 currentDoc?.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 currentDoc?.file_name.toLowerCase().endsWith('.xlsx') ||
                 currentDoc?.file_name.toLowerCase().endsWith('.xls');
  const isCSV = currentDoc?.mime_type === 'text/csv' || currentDoc?.file_name.toLowerCase().endsWith('.csv');

  const handleApprove = () => {
    if (documentId) {
      onApprove(documentId);
    }
  };
  
  const handleReject = () => {
    if (documentId && rejectionReason.trim()) {
      onReject(documentId, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };
  
  useEffect(() => {
    if (documentStatus === 'rejected' && currentDoc?.admin_notes && showRejectModal) {
      setRejectionReason(currentDoc.admin_notes);
    } else if (showRejectModal) {
      setRejectionReason('');
    }
  }, [showRejectModal, documentStatus, currentDoc?.admin_notes, currentDocKey]);

  useEffect(() => {
    setCurrentDocKey(initialDocKey);
    setIsLoading(true);
  }, [initialDocKey]);

  useEffect(() => {
    if (currentDoc) {
      console.debug('DocumentViewer: currentDoc', currentDoc);
      if (currentDoc.file_url) {
        console.debug('DocumentViewer: file_url', currentDoc.file_url);
      }
    }
  }, [currentDoc]);

  const renderDocumentPreview = () => {
    if (!currentDoc?.file_url) {
      return (
        <div className="text-gray-500 text-center p-8">
          <FileText size={48} className="mx-auto mb-3 text-gray-400"/>
          <p className="text-lg">No preview available</p>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-[calc(95vh-250px)] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}
          <iframe
            src={currentDoc.file_url}
            className="w-full h-full border-0"
            title={documentTypeMapping[currentDoc.document_type] || currentDoc.document_type}
            onLoad={() => {
              setIsLoading(false);
              console.debug('PDF iframe loaded:', currentDoc.file_url);
            }}
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-[calc(95vh-250px)] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}
          <img 
            src={currentDoc.file_url} 
            alt={documentTypeMapping[currentDoc.document_type] || currentDoc.document_type}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    // For Excel and CSV files
    return (
      <div className="text-center p-8">
        <FileText size={48} className="mx-auto mb-3 text-gray-400"/>
        <p className="text-lg text-gray-600">
          {isExcel ? 'Excel Spreadsheet' : isCSV ? 'CSV File' : 'Document'} Preview
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {currentDoc.file_name}
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href={currentDoc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} className="mr-2" />
            View File
          </a>
          <a 
            href={currentDoc.file_url}
            download={currentDoc.file_name}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <FileText size={16} className="mr-2" />
            Download
          </a>
        </div>
      </div>
    );
  };

  if (!currentDoc) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-gray-700">Could not load document details.</p>
          <button 
            onClick={onClose} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-auto max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold truncate" title={documentTypeMapping[currentDoc.document_type] || currentDoc.document_type}>
              {documentTypeMapping[currentDoc.document_type] || currentDoc.document_type}
            </h3>
            <div className="text-sm text-gray-500">
              Status: <span className={`font-medium ${documentStatus === 'approved' ? 'text-green-600' : documentStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                {documentStatus.charAt(0).toUpperCase() + documentStatus.slice(1)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-2 sm:p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-100 min-h-[300px]">
          {renderDocumentPreview()}
        </div>
        
        {currentDoc.file_name && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-gray-600">File:</span> <span className="font-medium break-all">{currentDoc.file_name}</span></div>
              {currentDoc.file_size > 0 && (
                <div><span className="text-gray-600">Size:</span> <span className="font-medium">{(currentDoc.file_size / 1024).toFixed(2)} KB</span></div>
              )}
              {currentDoc.verified_at && (
                <div><span className="text-gray-600">Verified:</span> <span className="font-medium">{new Date(currentDoc.verified_at).toLocaleString()}</span></div>
              )}
              {documentStatus === 'rejected' && currentDoc.admin_notes && (
                <div className="sm:col-span-2"><span className="text-gray-600">Reason:</span> <span className="font-medium text-red-600">{currentDoc.admin_notes}</span></div>
              )}
            </div>
          </div>
        )}
        
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center self-start sm:self-center">
              {/* Placeholder if needed in future */}
            </div>
            <div className="flex justify-end space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isActionLoading}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                          ${documentStatus === 'rejected' ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500' 
                                                          : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-300'}`}
              >
                {documentStatus === 'rejected' ? 'Update Rejection' : 'Reject Document'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isActionLoading || documentStatus === 'approved'}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors text-white disabled:opacity-50 
                          ${documentStatus === 'approved' ? 'bg-green-500 cursor-not-allowed' 
                                                         : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'}`}
              >
                {documentStatus === 'approved' ? 'Approved' : 'Approve Document'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-3 sm:p-4 border-t">
          <button 
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isActionLoading}
            className={`flex items-center px-2 py-1.5 rounded-md text-sm transition-colors disabled:text-gray-300 disabled:cursor-not-allowed 
                      ${currentIndex !== 0 ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400' : 'text-gray-400'}`}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </button>
          
          <span className="text-gray-600 text-sm sm:text-base tabular-nums">{currentIndex + 1} of {documentKeys.length}</span>
          
          <button 
            onClick={goToNext}
            disabled={currentIndex === documentKeys.length - 1 || isActionLoading}
            className={`flex items-center px-2 py-1.5 rounded-md text-sm transition-colors disabled:text-gray-300 disabled:cursor-not-allowed
                      ${currentIndex !== documentKeys.length - 1 ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400' : 'text-gray-400'}`}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start text-red-600 mb-4">
              <AlertCircle size={22} className="mr-2 mt-0.5 flex-shrink-0" />
              <h3 className="text-lg font-semibold">Reject Document</h3>
            </div>
            <p className="mb-1 text-sm text-gray-700">
              Reason for rejecting <span className="font-medium">{documentTypeMapping[currentDoc.document_type] || currentDoc.document_type}</span>:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2.5 mb-4 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason(""); 
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isActionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MerchantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null); // Stores document ID as string
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDocumentActionLoading, setIsDocumentActionLoading] = useState(false);

  // --- NEW STATE VARIABLES ---
  const [isFinalizingApproval, setIsFinalizingApproval] = useState(false);
  const [showFinalApprovalSuccess, setShowFinalApprovalSuccess] = useState(false);

  // fetchMerchantDetails - From your initial code
  const fetchMerchantDetails = async (merchantId: string): Promise<Merchant | null> => {
    if (!accessToken) {
      toast.error('You must be logged in to view merchant details');
      navigate('/login');
      return null;
    }
    try {
      // setIsLoading(true); // This is handled by loadMerchantData
      setError(null);
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/admin/merchants/${merchantId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Merchant not found. Redirecting...');
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Failed to fetch details: ${response.statusText}`);
        }
        navigate('/superadmin/merchant-management');
        return null;
      }
      const data = await response.json();
      // Mapping from your initial code, ensure 'category' is handled if it comes from backend
      return {
        ...data, // Spread first to get all fields, then override specifically
        id: data.id,
        name: data.business_name,
        email: data.business_email,
        phone: data.business_phone,
        description: data.business_description,
        status: data.verification_status?.toLowerCase() || 'pending', // Normalize
        category: data.merchant_category?.name || data.category || 'N/A', // Handle category
        dateApplied: data.created_at,
        rejectionReason: data.verification_status?.toLowerCase() === 'rejected' ? data.verification_notes : undefined,
        country_code: data.country_code,
        pan_number: data.pan_number,
        gstin: data.gstin,
        tax_id: data.tax_id,
        vat_number: data.vat_number,
        sales_tax_number: data.sales_tax_number,
        bank_account_number: data.bank_account_number,
        bank_name: data.bank_name,
        bank_branch: data.bank_branch,
        bank_ifsc_code: data.bank_ifsc_code,
        bank_swift_code: data.bank_swift_code,
        bank_routing_number: data.bank_routing_number,
        bank_iban: data.bank_iban,
        documents: [] // Documents will be populated by fetchMerchantDocuments
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch merchant details';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } 
    // finally { setIsLoading(false); } // This is handled by loadMerchantData
  };
  
  // fetchMerchantDocuments - From your initial code, with minor normalization
  const fetchMerchantDocuments = async (merchantId: string): Promise<Document[]> => {
    if (!accessToken) return [];
    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/merchant/documents?merchant_id=${merchantId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to fetch merchant documents: ${response.statusText}`);
      const data = await response.json();
      return Array.isArray(data.documents) ? data.documents.map((doc: any) => ({
        ...doc, // Spread existing doc properties
        status: doc.status?.toUpperCase() || 'PENDING', // Normalize status
        file_name: doc.file_name || 'N/A',
        file_size: doc.file_size || 0,
        mime_type: doc.mime_type || 'N/A',
      })) as Document[] : [];
    } catch (error: unknown) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch merchant documents');
      return [];
    }
  };

  // transformDocuments - From your initial code
  // Note: This function changes doc.document_type to its display name.
  // The list of documents should ideally keep the raw document_type from backend for consistency,
  // and use documentTypeMapping only for display purposes in the JSX.
  // I will adjust where this is called or how it's used.
  const transformDocuments = (apiDocuments: any[]): Document[] => {
    const documents: Document[] = [];
    apiDocuments.forEach(doc => {
      // const docTypeDisplayName = documentTypeMapping[doc.document_type] || doc.document_type;
      documents.push({
        id: doc.id,
        document_type: doc.document_type, // KEEPING THE RAW TYPE HERE
        file_url: doc.file_url,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        status: doc.status?.toUpperCase() || 'PENDING', // Normalize
        admin_notes: doc.admin_notes,
        verified_at: doc.verified_at
      });
    });
    return documents;
  };

  // useEffect for loading data - From your initial code
  useEffect(() => {
    const loadMerchantData = async () => {
      if (!id) { setIsLoading(false); return; } // Ensure id is present
      if (!user || !['admin', 'superadmin'].includes(user.role.toLowerCase())) {
        toast.error('Access denied. Admin role required.');
        navigate('/login');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const merchantData = await fetchMerchantDetails(id);
        if (!merchantData) { // fetchMerchantDetails handles redirect and toast for not found
            setIsLoading(false); // Stop loading if merchant details fetch failed
            return;
        }
        const documentsData = await fetchMerchantDocuments(id);
        // The transformDocuments from your initial code changes document_type.
        // We should use the raw type for logic and map for display.
        // So, let's use the direct output of fetchMerchantDocuments which already returns Document[]
        setMerchant({ ...merchantData, documents: documentsData }); 
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load merchant data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    loadMerchantData();
  }, [id, accessToken, user, navigate]); // Dependencies from your initial code

  const openDocumentViewer = (docId: string) => {
    setViewingDocument(docId);
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
  };

  // approveDocument - Modified for new finalizing flow
    const approveDocument = async (documentId: number) => {
    if (!accessToken || !merchant || !id) return; 
    
    // Find the document being approved to get its name for the toast
    const documentToApprove = merchant.documents.find(doc => doc.id === documentId);
    const documentNameToDisplay = documentToApprove 
        ? (documentTypeMapping[documentToApprove.document_type] || documentToApprove.document_type) 
        : 'Document'; // Fallback name

    setIsDocumentActionLoading(true);
    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/merchant/documents/${documentId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to approve ${documentNameToDisplay}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // --- MODIFIED SUCCESS TOAST ---
      toast.success(data.message || `${documentNameToDisplay} approved successfully!`); 
      
      const documentsData = await fetchMerchantDocuments(id);
      const updatedMerchantWithDocs = { ...merchant, documents: documentsData };
      setMerchant(updatedMerchantWithDocs);

      const allDocsActuallyApproved = documentsData.length > 0 && 
                                  documentsData.every(doc => doc.status.toUpperCase() === 'APPROVED');
      
      if (allDocsActuallyApproved && merchant.status.toLowerCase() !== 'approved') {
        setIsFinalizingApproval(true);
        await new Promise(resolve => setTimeout(resolve, 2500)); 

        const latestMerchantData = await fetchMerchantDetails(id);
        setIsFinalizingApproval(false); 

        if (latestMerchantData) {
          setMerchant(latestMerchantData); 
          if (latestMerchantData.status.toLowerCase() === 'approved') {
            setShowFinalApprovalSuccess(true);
            setTimeout(() => {
              setShowFinalApprovalSuccess(false);
              navigate('/superadmin/merchant-management');
            }, 4000); 
          } else {
            toast("All documents approved. Awaiting final merchant status update.", { duration: 5000, icon: '⏳' });
          }
        } else {
             toast.error("Could not confirm final merchant status.");
        }
      }
    } catch (error: unknown) {
      // --- MODIFIED ERROR TOAST (Optional, but good practice) ---
      const errorMessage = error instanceof Error ? error.message : `Failed to approve ${documentNameToDisplay}`;
      toast.error(errorMessage);
      setIsFinalizingApproval(false);
    } finally {
      setIsDocumentActionLoading(false);
    }
  };

  // rejectDocument - From your initial code
  const rejectDocument = async (documentId: number, reason: string) => {
    if (!accessToken || !reason.trim() || !merchant || !id) return;
    
    setIsDocumentActionLoading(true);
    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/merchant/documents/${documentId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reason })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to reject document: ${response.statusText}`);
      }
      const data = await response.json();
      toast.success(data.message || "Document rejected.");
      
      const documentsData = await fetchMerchantDocuments(id);
      setMerchant({ ...merchant, documents: documentsData });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject document';
      toast.error(errorMessage);
    } finally {
      setIsDocumentActionLoading(false);
    }
  };

  // getStatusBadgeClass - From your initial code
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) { // Normalize
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Loading, Error, No Merchant states - From your initial code (with Loader2)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading merchant data...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800">Error</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/superadmin/merchant-management')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Merchant List
        </button>
      </div>
    );
  }
  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
        <AlertCircle size={48} className="text-orange-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800">Merchant Not Found</p>
        <p className="text-gray-600 mb-6">The requested merchant could not be found or you do not have permission to view it.</p>
        <button
          onClick={() => navigate('/superadmin/merchant-management')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Merchant List
        </button>
      </div>
    );
  }

  // Main JSX - Based on your initial code, with targeted changes
  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6"> {/* Retained bg-gray-50 */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6"> {/* Retained margin */}
          <button
            onClick={() => navigate('/superadmin/merchant-management')} // Corrected navigate(-1) to specific path
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm p-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Back to Merchant List</span>
          </button>
        </div>
        
        {/* --- HEADER: NO COLOR CHANGES HERE --- */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate" title={merchant.name}>{merchant.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(merchant.status)}`}>
                {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
              </span>
              {/* Ensure merchant.category is available and displayed as per your initial code if it exists */}
              {merchant.category && merchant.category !== 'N/A' && <span className="text-blue-100 text-sm">{merchant.category}</span>}
            </div>
          </div>
          
          {/* Content - From your initial code */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4"><h2 className="text-base sm:text-lg font-semibold text-gray-800">Contact Information</h2></div>
                  <div className="p-4 sm:p-6"><div className="space-y-3 sm:space-y-4 text-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Email:</div><div className="col-span-1 sm:col-span-2 text-gray-800 break-all">{merchant.email || 'N/A'}</div></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Phone:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.phone || 'N/A'}</div></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Date Applied:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.dateApplied ? new Date(merchant.dateApplied).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'}) : 'N/A'}</div></div>
                  </div></div>
                </div>
                {/* Business Details */}
                <div className="bg-gray-50 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4"><h2 className="text-base sm:text-lg font-semibold text-gray-800">Business Details ({merchant.country_code})</h2></div>
                  <div className="p-4 sm:p-6"><div className="space-y-3 sm:space-y-4 text-sm">
                    {merchant.country_code === 'IN' ? ( <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">PAN:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.pan_number || 'N/A'}</div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">GSTIN:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.gstin || 'N/A'}</div></div>
                    </>) : (<>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Tax ID:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.tax_id || 'N/A'}</div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">VAT No:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.vat_number || 'N/A'}</div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Sales Tax No:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.sales_tax_number || 'N/A'}</div></div>
                    </>)}
                  </div></div>
                </div>
                {/* Bank Details */}
                <div className="bg-gray-50 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4"><h2 className="text-base sm:text-lg font-semibold text-gray-800">Bank Details</h2></div>
                  <div className="p-4 sm:p-6"><div className="space-y-3 sm:space-y-4 text-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Account No:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_account_number || 'N/A'}</div></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Bank Name:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_name || 'N/A'}</div></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Branch:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_branch || 'N/A'}</div></div>
                    {merchant.country_code === 'IN' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">IFSC:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_ifsc_code || 'N/A'}</div></div>
                    ) : (<>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">SWIFT:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_swift_code || 'N/A'}</div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">Routing No:</div><div className="col-span-1 sm:col-span-2 text-gray-800">{merchant.bank_routing_number || 'N/A'}</div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"><div className="font-medium text-gray-500">IBAN:</div><div className="col-span-1 sm:col-span-2 text-gray-800 break-all">{merchant.bank_iban || 'N/A'}</div></div>
                    </>)}
                  </div></div>
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4"><h2 className="text-base sm:text-lg font-semibold text-gray-800">Business Description</h2></div>
                  <div className="p-4 sm:p-6"><p className="text-sm text-gray-700 whitespace-pre-wrap">{merchant.description || 'N/A'}</p></div>
                </div>
                <div className="bg-gray-50 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Documents</h2>
                     {merchant.documents.length > 0 && (
                        <span className="text-xs text-gray-500">
                            {merchant.documents.filter(d => d.status.toUpperCase() === 'APPROVED').length} / {merchant.documents.length} approved
                        </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    {merchant.documents.length > 0 ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                      {merchant.documents.map((doc) => (
                        <div key={doc.id} className={`flex items-center p-2 sm:p-3 rounded-md border ${
                            doc.status.toUpperCase() === 'APPROVED' ? 'border-green-200 bg-green-50' : 
                            doc.status.toUpperCase() === 'REJECTED' ? 'border-red-200 bg-red-50' : 
                            'border-gray-200 bg-gray-100' }`}>
                          <div className="mr-2 sm:mr-3 flex-shrink-0"> {/* Ensure icon doesn't shrink */}
                            {doc.status.toUpperCase() === 'APPROVED' ? <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">✓</div> : 
                             doc.status.toUpperCase() === 'REJECTED' ? <div className="w-6 h-6 sm:w-7 sm:h-7 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">✗</div> : 
                             <div className="w-6 h-6 sm:w-7 sm:h-7 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 text-sm">○</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-800 truncate" title={documentTypeMapping[doc.document_type] || doc.document_type}>
                              {documentTypeMapping[doc.document_type] || doc.document_type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase()}
                            </p>
                          </div>
                          {doc.file_url && ( // --- UPDATED VIEW BUTTON with Text ---
                            <button
                              onClick={() => openDocumentViewer(doc.id.toString())}
                              title={`View ${documentTypeMapping[doc.document_type] || doc.document_type}`}
                              aria-label={`View ${documentTypeMapping[doc.document_type] || doc.document_type}`}
                              className="ml-2 flex items-center px-2 py-1 rounded-md text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 flex-shrink-0"
                            >
                              <Eye size={14} className="mr-1 sm:mr-1.5" />
                              View
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    ) : (
                        <div className="text-center py-6">
                            <FileText size={36} className="mx-auto text-gray-400 mb-2"/>
                            <p className="text-sm text-gray-500">No documents have been submitted.</p>
                        </div>
                    )}
                  </div>
                </div>
                {merchant.status.toLowerCase() === 'rejected' && merchant.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <div className="border-b border-red-200 px-4 sm:px-6 py-3 sm:py-4"><h2 className="text-base sm:text-lg font-semibold text-red-800">Overall Rejection Reason</h2></div>
                    <div className="p-4 sm:p-6"><p className="text-sm text-red-700 whitespace-pre-wrap">{merchant.rejectionReason}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- MODALS --- */}
      {viewingDocument && merchant && (
        <DocumentViewer 
          documents={merchant.documents} 
          onClose={closeDocumentViewer} 
          initialDocKey={viewingDocument}
          onApprove={approveDocument}
          onReject={rejectDocument}
          isActionLoading={isDocumentActionLoading}
        />
      )}

      {isFinalizingApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-[60] p-4 text-center">
          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-white animate-spin mb-4" />
          <p className="text-white text-lg sm:text-xl font-semibold">
            Finalizing Merchant Approval...
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Please wait, this may take a few moments.
          </p>
        </div>
      )}

      {showFinalApprovalSuccess && merchant && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
            <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 mx-auto mb-5" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              Merchant Approved!
            </h2>
            <p className="text-gray-600 mb-1 text-sm sm:text-base">
              <span className="font-medium">{merchant.name}</span> (ID: {merchant.id})
            </p>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              has been successfully verified and approved.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="bg-green-500 h-1.5 rounded-full animate-progress-bar"></div>
            </div>
            <p className="text-xs text-gray-500">
              Redirecting to merchant list...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDetails;

