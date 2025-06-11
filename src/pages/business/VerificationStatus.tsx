import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type VerificationStatusType = 'approved' | 'rejected' | 'pending' | 'under_review' | 'documents_submitted' | 'email_verified';

const statusColors: Record<VerificationStatusType, string> = {
  approved: 'text-green-700 bg-green-50 border-green-300',
  rejected: 'text-red-700 bg-red-50 border-red-300',
  pending: 'text-orange-700 bg-orange-50 border-orange-300',
  under_review: 'text-orange-700 bg-orange-50 border-orange-300',
  documents_submitted: 'text-orange-700 bg-orange-50 border-orange-300',
  email_verified: 'text-orange-700 bg-orange-50 border-orange-300'
};

const statusIcons: Record<VerificationStatusType, JSX.Element> = {
  approved: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
  rejected: <XCircleIcon className="h-5 w-5 text-red-600" />,
  pending: <ClockIcon className="h-5 w-5 text-orange-600" />,
  under_review: <ClockIcon className="h-5 w-5 text-orange-600" />,
  documents_submitted: <DocumentIcon className="h-5 w-5 text-orange-600" />,
  email_verified: <CheckCircleIcon className="h-5 w-5 text-orange-600" />
};

// Document type mapping for better display
const documentTypeMap: Record<string, string> = {
  business_registration_in: 'Shop & Establishment Certificate',
  business_registration_global: 'Business License',
  pan_card: 'PAN Card',
  gstin: 'GSTIN Certificate',
  tax_id_global: 'Tax ID',
  vat_id: 'VAT ID',
  sales_tax_reg: 'Sales Tax Registration',
  import_export_license: 'Import/Export License',
  aadhar: 'Aadhar Card',
  voter_id: 'Voter ID',
  passport: 'Passport',
  national_id: 'National ID',
  driving_license: 'Driving License',
  business_address_proof_in: 'Business Address Proof (India)',
  business_address_proof_global: 'Business Address Proof (Global)',
  cancelled_cheque: 'Cancelled Cheque',
  bank_statement: 'Bank Statement',
  void_cheque: 'Void Cheque',
  bank_letter: 'Bank Letter',
  bank_account_in: 'Bank Account Details (India)',
  bank_account_global: 'Bank Account Details (Global)',
  gst_certificate: 'GST Certificate',
  vat_certificate: 'VAT Certificate',
  sales_tax_permit: 'Sales Tax Permit',
  msme_certificate: 'MSME Certificate',
  small_business_cert: 'Small Business Certification',
  dsc: 'Digital Signature Certificate',
  esign_certificate: 'eSign Certificate',
  return_policy: 'Return Policy',
  shipping_details: 'Shipping Details',
  product_list: 'Product List',
  category_list: 'Category List',
  brand_approval: 'Brand Approval',
  brand_authorization: 'Brand Authorization',
  product_images: 'Product Images',
  other: 'Other Document'
};

interface DocumentDetail {
  document_type: string;
  status: string;
  admin_notes?: string;
  verified_at?: string;
}

interface VerificationStatusResponse {
  has_submitted_documents: boolean;
  verification_status: string;
  verification_submitted_at: string | null;
  verification_completed_at: string | null;
  verification_notes: string | null;
  required_documents: string[];
  submitted_documents: string[];
  document_details: DocumentDetail[];
}

const VerificationStatus: React.FC = () => {
  const navigate = useNavigate();
  const { user, isMerchant, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationStatusResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);

  const fetchVerificationStatus = async () => {
    if (!user || !accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchants/verification-status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      
      // Only redirect if documents are not submitted and we're not already on the verification page
      if (!data.has_submitted_documents && !window.location.pathname.includes('/business/verification')) {
        navigate('/business/verification');
        return;
      }
      
      setVerificationData(data);
      
      if (data.verification_status === 'rejected') {
        setRejectionReason(data.verification_notes || 'Verification was rejected. Please review the document details below.');
      } else {
        setRejectionReason(null);
      }
      
    } catch (error) {
      console.error('Error fetching verification status:', error);
      toast.error('Failed to load verification status');
      // Only redirect on error if we're not already on the verification page
      if (!window.location.pathname.includes('/business/verification')) {
        navigate('/business/verification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isMerchant) {
      toast.error('You must be logged in as a merchant to access this page');
      navigate('/login');
    } else {
      fetchVerificationStatus();
    }
  }, [user, isMerchant, navigate, accessToken]);

  const handleReapply = () => {
    navigate('/business/verification?reupload=all');
  };

  const handleDocumentReupload = async (documentType: string, file: File) => {
    if (!accessToken) return;

    setUploadingDocument(documentType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      toast.success('Document uploaded successfully');
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleFileSelect = (documentType: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleDocumentReupload(documentType, file);
    }
  };

  const isDocumentRejected = (status: string): boolean => {
    return status.toUpperCase() === 'REJECTED';
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 w-full bg-gray-200 rounded"></div>
          <div className="mt-4 text-gray-500">Loading verification status...</div>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">No Verification Data Found</h2>
        <p className="mt-2 text-gray-600">Please start the verification process to continue.</p>
        <button 
          onClick={() => navigate('/business/Verification')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          Start Verification
        </button>
      </div>
    );
  }

  const status = verificationData.verification_status.toLowerCase() as VerificationStatusType;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verification Status</h1>
        <p className="mt-2 text-lg text-gray-600">
          Track the status of your merchant verification
        </p>
      </div>

      {/* Overall Status Card */}
      <div className={`mb-8 p-6 rounded-lg border ${statusColors[status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              {statusIcons[status]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {status === 'approved' && 'Verification Approved'}
                {status === 'rejected' && 'Verification Rejected'}
                {status === 'pending' && 'Verification Pending'}
                {status === 'under_review' && 'Under Review'}
                {status === 'documents_submitted' && 'Documents Submitted'}
                {status === 'email_verified' && 'Email Verified'}
              </h2>
              <p className="mt-1">
                {status === 'approved' && 'Congratulations! Your merchant account has been verified.'}
                {status === 'rejected' && 'Your verification has been rejected. Please review the reasons below.'}
                {status === 'pending' && 'Your verification process has not started yet.'}
                {status === 'under_review' && 'Your documents are currently under review.'}
                {status === 'documents_submitted' && 'Your documents have been submitted and are awaiting review.'}
                {status === 'email_verified' && 'Your email has been verified. Please proceed with document submission.'}
              </p>
              {rejectionReason && status === 'rejected' && (
                <div className="mt-3 p-3 bg-white/50 rounded border border-red-200">
                  <p className="font-medium">Reason for rejection:</p>
                  <p>{rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
          
          {status === 'rejected' && (
            <button
              onClick={handleReapply}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Reapply
            </button>
          )}
        </div>
      </div>

      {/* Document Status Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Document Verification Status</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {verificationData.document_details.length > 0 ? (
                verificationData.document_details.map((doc, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">
                          {documentTypeMap[doc.document_type] || doc.document_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        isDocumentRejected(doc.status) ? 'bg-red-100 text-red-800' : 
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {doc.status.toLowerCase() in statusIcons ? 
                          statusIcons[doc.status.toLowerCase() as VerificationStatusType] : 
                          <ClockIcon className="h-5 w-5 text-orange-600" />}
                        <span className="ml-1 capitalize">{doc.status.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {doc.admin_notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.verified_at ? new Date(doc.verified_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isDocumentRejected(doc.status) && (
                        <div className="flex items-center space-x-2">
                          <label className="relative cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileSelect(doc.document_type)}
                              disabled={uploadingDocument === doc.document_type}
                            />
                            <span className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                              uploadingDocument === doc.document_type
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                            }`}>
                              {uploadingDocument === doc.document_type ? (
                                <>
                                  <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                                  Reupload
                                </>
                              )}
                            </span>
                          </label>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center py-6">
                      <ExclamationTriangleIcon className="h-12 w-12 text-orange-400 mb-3" />
                      <p>No documents found in your application.</p>
                      <button 
                        onClick={() => navigate('/business/verification')}
                        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Start Verification
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Last updated: {verificationData?.verification_completed_at ? 
                new Date(verificationData.verification_completed_at).toLocaleString() : 
                new Date().toLocaleString()}
            </div>
            <button 
              onClick={fetchVerificationStatus}
              className="flex items-center text-orange-600 hover:text-orange-800"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
        
        {status === 'approved' && (
          <div className="space-y-3">
            <p className="text-green-700">Your merchant account is now verified! You can:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>Set up your store profile</li>
              <li>Add products to your inventory</li>
              <li>Configure shipping options</li>
              <li>Start selling on our marketplace</li>
            </ul>
            <div className="pt-3">
              <button
                onClick={() => navigate('/business/dashboard')}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Go to Merchant Dashboard
              </button>
            </div>
          </div>
        )}
        
        {status === 'rejected' && (
          <div className="space-y-3">
            <p className="text-red-700">Your verification was rejected. To proceed:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>Review the rejection reasons for each document</li>
              <li>Prepare the correct documents addressing the issues</li>
              <li>Resubmit your application</li>
            </ul>
            <div className="pt-3">
              <button
                onClick={handleReapply}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Reapply for Verification
              </button>
            </div>
          </div>
        )}
        
        {['pending', 'email_verified', 'documents_submitted', 'under_review'].includes(status) && (
          <div className="space-y-3">
            <p className="text-orange-700">Your verification is in progress. Please note:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>The review process typically takes 24-48 hours</li>
              <li>You'll receive an email notification once the review is complete</li>
              <li>You can check back here anytime to see the status</li>
            </ul>
            <div className="pt-3">
              <p className="text-sm text-gray-500">
                For urgent inquiries, please contact our merchant support team
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;