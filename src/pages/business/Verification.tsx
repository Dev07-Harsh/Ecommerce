import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CountryConfig {
  country_code: string;
  country_name: string;
  required_documents: Array<{
    type: string;
    name: string;
    required: boolean;
  }>;
  field_validations: {
    [key: string]: {
      pattern: string;
      message: string;
    };
  };
  bank_fields: string[];
  tax_fields: string[];
}

interface DocumentUpload {
  id: string;
  file: File | null;
  status: 'pending' | 'uploaded' | 'error';
  required: boolean;
  documentType: string;
  name: string;
  fileUrl?: string | null; // Added to store the URL of the uploaded file
}

interface BusinessDetails {
  gstin?: string;
  panNumber?: string;
  taxId?: string;
  vatNumber?: string;
  salesTaxNumber?: string;
}

interface BankDetails {
  accountNumber: string;
  bankName: string;
  bankBranch?: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  iban?: string;
}

interface ValidationErrors {
  panNumber?: string;
  gstin?: string;
  taxId?: string;
  vatNumber?: string;
  salesTaxNumber?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  iban?: string;
  documents?: string;
}

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
  other: 'Other Document'
};

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { user, accessToken, isMerchant } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null);
  const [supportedCountries, setSupportedCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    gstin: '',
    panNumber: '',
    taxId: '',
    vatNumber: '',
    salesTaxNumber: ''
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    swiftCode: '',
    routingNumber: '',
    iban: ''
  });

  const [documents, setDocuments] = useState<{ [key: string]: DocumentUpload }>({});

  const checkVerificationStatus = async () => {
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
      
      if (data.has_submitted_documents && !window.location.pathname.includes('/business/verification-status')) {
        navigate('/business/verification-pending');
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isMerchant) {
      toast.error('You must be logged in as a merchant to access this page');
      navigate('/login');
    } else {
      checkVerificationStatus();
    }
  }, [user, isMerchant, navigate, accessToken]);

  useEffect(() => {
    const fetchSupportedCountries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/merchants/supported-countries`);
        if (!response.ok) throw new Error('Failed to fetch supported countries');
        const data = await response.json();
        setSupportedCountries(data.countries);
      } catch (error) {
        console.error('Error fetching supported countries:', error);
        toast.error('Failed to load supported countries');
      }
    };
    fetchSupportedCountries();
  }, []);

  useEffect(() => {
    const fetchCountryConfig = async () => {
      if (!selectedCountry || !accessToken) return; 
      try {
        setIsLoading(true); // Indicate loading when config changes
        const response = await fetch(`${API_BASE_URL}/api/merchants/country-config/${selectedCountry}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch country configuration');
        const config = await response.json();
        setCountryConfig(config);
        
        const newDocuments: { [key: string]: DocumentUpload } = {};
        if (config.required_documents) {
            config.required_documents.forEach((doc: { type: string; name: string; required: boolean }) => {
            newDocuments[doc.type] = {
                id: doc.type,
                file: null,
                status: 'pending',
                required: doc.required,
                documentType: doc.type,
                name: doc.name,
                fileUrl: null 
            };
            });
        }
        setDocuments(newDocuments);
      } catch (error) {
        console.error('Error fetching country config:', error);
        toast.error('Failed to load country configuration.');
      } finally {
        // setIsLoading(false); // Already handled by checkVerificationStatus initial load 
      }
    };

    if (accessToken) { // Only fetch if accessToken is present
      fetchCountryConfig();
    }
  }, [selectedCountry, accessToken]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setValidationErrors({});
    // Resetting form fields on country change if desired - user's original did not do this.
    // setBusinessDetails({ gstin: '', panNumber: '', taxId: '', vatNumber: '', salesTaxNumber: '' });
    // setBankDetails({ accountNumber: '', bankName: '', bankBranch: '', ifscCode: '', swiftCode: '', routingNumber: '', iban: '' });
    // setDocuments({}); // This would clear documents, might need refetch or careful handling
  };

  const handleFileChange = async (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !accessToken) {
      toast.error('Please log in to upload documents');
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, JPEG, or PNG files only.');
        e.target.value = ''; // Clear the input
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum size is 10MB.');
        e.target.value = ''; // Clear the input
        return;
      }

      const toastId = toast.loading(`Uploading ${file.name}...`);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documents[documentId].documentType);
        formData.append('country_code', selectedCountry);

        const response = await fetch(`${API_BASE_URL}/api/merchant/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload document');
        }

        const data = await response.json();

        setDocuments(prev => ({
          ...prev,
          [documentId]: {
            ...prev[documentId],
            file, // Store the File object
            status: 'uploaded',
            fileUrl: data.document.file_url // Store the URL from backend
          }
        }));

        toast.success(`${documents[documentId].name} uploaded successfully`, { id: toastId });
      } catch (error) {
        console.error('Error uploading document:', error);
        setDocuments(prev => ({
          ...prev,
          [documentId]: {
            ...prev[documentId],
            file, // Keep the file that failed to give context
            status: 'error',
            fileUrl: prev[documentId].fileUrl // Retain old URL if update failed
          }
        }));
        toast.error(error instanceof Error ? error.message : 'Failed to upload document', { id: toastId });
      } finally {
        // Clear the file input to allow re-selection of the same file if needed
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  const handleBusinessDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessDetails(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    if (!countryConfig || !countryConfig.field_validations) return; // Add null check for field_validations
    
    // console.log(`Validating field ${name} with value:`, value);
    // console.log('Current country config:', countryConfig);
    
    const errors = { ...validationErrors };
    const validationRule = countryConfig.field_validations[name]; // Corrected access
    
    if (validationRule) {
      const pattern = new RegExp(validationRule.pattern);
      if (!pattern.test(value) && value.trim() !== '') { // Only validate if not empty, empty check is for submit
        errors[name as keyof ValidationErrors] = validationRule.message;
        // console.log(`Validation failed for ${name}:`, validationRule.message);
      } else {
        delete errors[name as keyof ValidationErrors];
        // console.log(`Validation passed for ${name}`);
      }
    }
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !accessToken) {
      toast.error('Please log in to submit verification');
      return;
    }

    const currentValidationErrors: ValidationErrors = {};
    const requiredFieldsMap = {
      'IN': ['panNumber', 'gstin', 'accountNumber', 'bankName', 'ifscCode'], // Added common ones
      // Define for other countries or a 'GLOBAL' default if applicable
      // For example, if 'US' is a country code:
      // 'US': ['taxId', 'accountNumber', 'bankName', 'swiftCode', 'routingNumber'], 
    };
    // Fallback to a general set if country not in map, or handle specific else case
    const defaultRequiredFields = ['taxId', 'accountNumber', 'bankName', 'swiftCode'];


    // Validate required text fields based on country
    let fieldsToValidate = requiredFieldsMap[selectedCountry as keyof typeof requiredFieldsMap] || defaultRequiredFields;
    if (selectedCountry !== 'IN') { // Generic non-India case
        fieldsToValidate = ['taxId', 'accountNumber', 'bankName', 'swiftCode'];
        // Add routingNumber as optional or conditionally required for specific non-IN countries
    }


    fieldsToValidate.forEach(field => {
        let value: string | undefined;
        if (field in businessDetails) {
            value = businessDetails[field as keyof BusinessDetails];
        } else if (field in bankDetails) {
            value = bankDetails[field as keyof BankDetails];
        }

        if (!value || value.trim() === '') {
            currentValidationErrors[field as keyof ValidationErrors] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`;
        } else if (countryConfig?.field_validations?.[field]) {
            // Re-run pattern validation for required fields on submit
            const rule = countryConfig.field_validations[field];
            const pattern = new RegExp(rule.pattern);
            if (!pattern.test(value)) {
                currentValidationErrors[field as keyof ValidationErrors] = rule.message;
            }
        }
    });
    

    // Validate required documents
    let allRequiredDocsUploaded = true;
    Object.values(documents).forEach(doc => {
      if (doc.required && doc.status !== 'uploaded') {
        allRequiredDocsUploaded = false;
      }
    });

    if (!allRequiredDocsUploaded) {
      toast.error('Please upload all required documents.');
      // Optionally, you could set a specific error message for documents
      // currentValidationErrors.documents = 'Please upload all required documents.';
    }

    if (Object.keys(currentValidationErrors).length > 0 || !allRequiredDocsUploaded) {
      setValidationErrors(currentValidationErrors);
      toast.error('Please fill in all required fields correctly and upload documents.');
      return;
    }

    setIsSubmitting(true);
    const submissionToastId = toast.loading('Submitting verification...');

    try {
      const profileData = {
        country_code: selectedCountry,
        pan_number: selectedCountry === 'IN' ? businessDetails.panNumber : '',
        gstin: selectedCountry === 'IN' ? businessDetails.gstin : '',
        tax_id: selectedCountry !== 'IN' ? businessDetails.taxId : '',
        vat_number: selectedCountry !== 'IN' ? businessDetails.vatNumber : '',
        sales_tax_number: selectedCountry !== 'IN' ? businessDetails.salesTaxNumber : '',
        bank_account_number: bankDetails.accountNumber,
        bank_name: bankDetails.bankName,
        bank_branch: bankDetails.bankBranch || '', // Ensure empty string if undefined
        bank_ifsc_code: selectedCountry === 'IN' ? bankDetails.ifscCode : '',
        bank_swift_code: selectedCountry !== 'IN' ? bankDetails.swiftCode : '',
        bank_routing_number: selectedCountry !== 'IN' ? bankDetails.routingNumber : '',
        bank_iban: selectedCountry !== 'IN' ? bankDetails.iban : ''
      };

      const profileResponse = await fetch(`${API_BASE_URL}/api/merchants/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || errorData.message || errorData.details?.body || 'Failed to update profile');
      }

      const verifyResponse = await fetch(`${API_BASE_URL}/api/merchants/profile/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || errorData.message || errorData.details?.body || 'Failed to submit for verification');
      }

      toast.success('Verification submitted successfully!', { id: submissionToastId });
      navigate('/business/verification-pending');
    } catch (error) {
      console.error('Error in verification process:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit verification', { id: submissionToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldHelperText = (fieldName: string, countryCode: string) => {
    const helpers: { [key: string]: { [key: string]: string } } = {
      panNumber: {
        IN: "Enter your 10-character PAN number (e.g., ABCDE1234F)",
        GLOBAL: "Enter your tax identification number"
      },
      gstin: {
        IN: "Enter your 15-character GSTIN (e.g., 22AAAAA0000A1Z5)",
        GLOBAL: "Enter your GST/VAT number"
      },
      taxId: {
        IN: "Enter your tax identification number",
        GLOBAL: "Enter your tax ID (e.g., EIN for US)"
      },
      ifscCode: {
        IN: "Enter your 11-character IFSC code (e.g., SBIN0001234)",
        GLOBAL: "Enter your bank's local clearing code (if applicable)"
      },
      swiftCode: {
        IN: "Enter your bank's SWIFT/BIC code (if applicable for international transfers)",
        GLOBAL: "Enter your 8-11 character SWIFT/BIC code (e.g., SBINUS33)"
      },
      accountNumber: {
        IN: "Enter your bank account number",
        GLOBAL: "Enter your bank account number or IBAN"
      },
      bankName: {
        IN: "Enter your bank's name",
        GLOBAL: "Enter your bank's name"
      },
      routingNumber: {
        GLOBAL: "Enter your bank's routing number (e.g., ABA for US banks)"
      },
      product_list: {
        IN: "Upload a list of products you plan to sell",
        GLOBAL: "Upload a list of products you plan to sell"
      },
      category_list: {
        IN: "Upload a list of product categories you plan to sell in",
        GLOBAL: "Upload a list of product categories you plan to sell in"
      },
      brand_approval: {
        IN: "Upload brand authorization and approval documents",
        GLOBAL: "Upload brand authorization and approval documents"
      }
    };
    return helpers[fieldName]?.[countryCode] || helpers[fieldName]?.['GLOBAL'] || "";
  };

  const getValidationErrorMessage = (fieldName: string, countryCode: string) => {
    // This function seems to be duplicated by the direct messages from validationErrors state
    // For direct display from validationErrors, this might not be strictly needed if messages are good there
    // However, keeping it as per your original structure
    const errorMessages: { [key: string]: { [key: string]: string } } = {
      panNumber: {
        IN: "Please enter a valid PAN number (e.g., ABCDE1234F)",
        GLOBAL: "Please enter a valid tax identification number"
      },
      gstin: {
        IN: "Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)",
        GLOBAL: "Please enter a valid GST/VAT number"
      },
      taxId: {
        IN: "Please enter a valid tax identification number",
        GLOBAL: "Please enter a valid tax ID (e.g., XX-XXXXXXX for EIN)"
      },
      ifscCode: {
        IN: "Please enter a valid IFSC code (e.g., SBIN0001234)",
        GLOBAL: "Please enter a valid local clearing code"
      },
      swiftCode: {
        IN: "Please enter a valid SWIFT/BIC code",
        GLOBAL: "Please enter a valid SWIFT/BIC code (e.g., SBINUS33)"
      },
      accountNumber: {
        IN: "Please enter a valid account number",
        GLOBAL: "Please enter a valid account number or IBAN"
      },
      bankName: {
        IN: "Please enter a valid bank name",
        GLOBAL: "Please enter a valid bank name"
      },
      routingNumber: {
          GLOBAL: "Please enter a valid routing number"
      }
    };
    // Fallback logic for messages
    return validationErrors[fieldName as keyof ValidationErrors] || errorMessages[fieldName]?.[countryCode] || errorMessages[fieldName]?.['GLOBAL'] || "Invalid input";
  };

  if (isLoading && !countryConfig) { // Show loading skeleton if initial data or config is loading
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 self-center"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-10 self-center"></div>
          
          <div className="w-full bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="h-10 w-full max-w-md bg-gray-200 rounded mb-8"></div>

            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-6">
                <div className="h-10 w-full max-w-md bg-gray-200 rounded"></div>
                <div className="h-10 w-full max-w-md bg-gray-200 rounded"></div>
            </div>
             <div className="mt-4 h-4 w-3/4 max-w-md bg-gray-200 rounded"></div>
          </div>
          <div className="mt-6 text-gray-500">Loading verification form...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Merchant Verification</h1>
        <p className="mt-2 text-lg text-gray-600">
          Please upload the required documents to verify your business and start selling.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} noValidate> {/* Added noValidate to rely on custom validation */}
          {/* Country Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              Select Your Country
            </h2>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="block w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              disabled={isSubmitting}
            >
              {supportedCountries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Business Details Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              Business Details
            </h2>
            <div className="space-y-6">
              {selectedCountry === 'IN' ? (
                <>
                  <div>
                    <label htmlFor="panNumber" className="block mb-2 font-medium text-gray-700">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="panNumber"
                      type="text"
                      name="panNumber"
                      value={businessDetails.panNumber || ''}
                      onChange={handleBusinessDetailsChange}
                      className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                        validationErrors.panNumber ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                   : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., ABCDE1234F"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('panNumber', selectedCountry)}</p>
                    {validationErrors.panNumber && <p className="mt-1 text-sm text-red-600">{validationErrors.panNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="gstin" className="block mb-2 font-medium text-gray-700">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="gstin"
                      type="text"
                      name="gstin"
                      value={businessDetails.gstin || ''}
                      onChange={handleBusinessDetailsChange}
                      className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                        validationErrors.gstin ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                               : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('gstin', selectedCountry)}</p>
                    {validationErrors.gstin && <p className="mt-1 text-sm text-red-600">{validationErrors.gstin}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="taxId" className="block mb-2 font-medium text-gray-700">
                      Tax ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="taxId"
                      type="text"
                      name="taxId"
                      value={businessDetails.taxId || ''}
                      onChange={handleBusinessDetailsChange}
                      className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                        validationErrors.taxId ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                               : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., XX-XXXXXXX"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('taxId', selectedCountry)}</p>
                    {validationErrors.taxId && <p className="mt-1 text-sm text-red-600">{validationErrors.taxId}</p>}
                  </div>
                  <div>
                    <label htmlFor="vatNumber" className="block mb-2 font-medium text-gray-700">VAT Number</label>
                    <input id="vatNumber" type="text" name="vatNumber" value={businessDetails.vatNumber || ''} onChange={handleBusinessDetailsChange} className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="salesTaxNumber" className="block mb-2 font-medium text-gray-700">Sales Tax Number</label>
                    <input id="salesTaxNumber" type="text" name="salesTaxNumber" value={businessDetails.salesTaxNumber || ''} onChange={handleBusinessDetailsChange} className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" disabled={isSubmitting} />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Bank Details Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              Bank Details
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="accountNumber" className="block mb-2 font-medium text-gray-700">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber || ''}
                  onChange={handleBankDetailsChange}
                  className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                    validationErrors.accountNumber ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('accountNumber', selectedCountry)}</p>
                {validationErrors.accountNumber && <p className="mt-1 text-sm text-red-600">{validationErrors.accountNumber}</p>}
              </div>
              <div>
                <label htmlFor="bankName" className="block mb-2 font-medium text-gray-700">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankName"
                  type="text"
                  name="bankName"
                  value={bankDetails.bankName || ''}
                  onChange={handleBankDetailsChange}
                  className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                    validationErrors.bankName ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                             : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('bankName', selectedCountry)}</p>
                 {validationErrors.bankName && <p className="mt-1 text-sm text-red-600">{validationErrors.bankName}</p>}
              </div>
              {selectedCountry === 'IN' ? (
                <div>
                  <label htmlFor="ifscCode" className="block mb-2 font-medium text-gray-700">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ifscCode"
                    type="text"
                    name="ifscCode"
                    value={bankDetails.ifscCode || ''}
                    onChange={handleBankDetailsChange}
                    className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                      validationErrors.ifscCode ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                    }`}
                    placeholder="e.g., SBIN0001234"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('ifscCode', selectedCountry)}</p>
                  {validationErrors.ifscCode && <p className="mt-1 text-sm text-red-600">{validationErrors.ifscCode}</p>}
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="swiftCode" className="block mb-2 font-medium text-gray-700">
                      SWIFT/BIC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="swiftCode"
                      type="text"
                      name="swiftCode"
                      value={bankDetails.swiftCode || ''}
                      onChange={handleBankDetailsChange}
                      className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                        validationErrors.swiftCode ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                   : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., SBINUS33"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('swiftCode', selectedCountry)}</p>
                    {validationErrors.swiftCode && <p className="mt-1 text-sm text-red-600">{validationErrors.swiftCode}</p>}
                  </div>
                  <div>
                    <label htmlFor="routingNumber" className="block mb-2 font-medium text-gray-700">Routing Number</label>
                    <input id="routingNumber" type="text" name="routingNumber" value={bankDetails.routingNumber || ''} onChange={handleBankDetailsChange} className={`block w-full max-w-md rounded-md border px-3 py-2 shadow-sm focus:outline-none ${ validationErrors.routingNumber ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'}`} placeholder="e.g., 123456789" disabled={isSubmitting} />
                    <p className="mt-1 text-sm text-gray-500">{getFieldHelperText('routingNumber', selectedCountry)}</p>
                    {validationErrors.routingNumber && <p className="mt-1 text-sm text-red-600">{validationErrors.routingNumber}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              Required Documents
            </h2>
            <div className="space-y-6">
              {countryConfig && Object.keys(documents).length > 0 ? (
                Object.values(documents).map((doc) => (
                  <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
                    <label className="block mb-2 font-medium text-gray-700">
                      {doc.name}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {/* Document Type Specific Instructions */}
                    {(doc.documentType === 'product_list' || doc.documentType === 'category_list') && (
                      <div className="mb-3 p-3 bg-orange-50 rounded-md">
                        <div className="flex items-start">
                          <InformationCircleIcon className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-orange-700 font-medium">
                              {doc.documentType === 'product_list' 
                                ? 'Please provide a detailed list of products you plan to sell'
                                : 'Please provide a list of product categories you plan to sell in'}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              Include product names, descriptions, and categories. For categories, specify the main categories and subcategories.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {doc.documentType === 'brand_approval' && (
                      <div className="mb-3 p-3 bg-orange-50 rounded-md">
                        <div className="flex items-start">
                          <InformationCircleIcon className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-orange-700 font-medium">
                              Brand Authorization Documents
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              Please provide authorization letters, brand agreements, or any official documentation proving your right to sell these brands.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {doc.status === 'uploaded' && doc.fileUrl ? (
                      // Uploaded State: Show file info, View, and Update buttons
                      <div className="mt-1">
                        <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-700 font-medium truncate flex-grow" title={doc.file?.name || 'Document uploaded'}>
                            {doc.file?.name 
                              ? (doc.file.name.length > 30 ? doc.file.name.substring(0,27) + '...' : doc.file.name) 
                              : 'Uploaded'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <button
                            type="button"
                            onClick={() => window.open(doc.fileUrl!, '_blank', 'noopener,noreferrer')}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium py-1 px-2 rounded-md hover:bg-orange-50 transition-colors"
                            disabled={isSubmitting}
                          >
                            View
                          </button>
                          <label className={`text-sm font-medium py-1 px-2 rounded-md transition-colors ${isSubmitting ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 cursor-pointer'}`}>
                            Update
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => !isSubmitting && handleFileChange(doc.id, e)}
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    ) : (
                      // Pending or Error State: Show Upload button/area
                      <>
                        <div className="flex items-center">
                          <label className={`
                            flex justify-center items-center px-4 py-2 border-2 rounded-md 
                            ${doc.status === 'error' ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-300 bg-white text-gray-600'}
                            ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'hover:bg-gray-50 cursor-pointer'}
                            w-full max-w-xs 
                          `}
                          >
                            {doc.status === 'error' ? (
                              <span className="flex items-center">
                                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                                Upload failed. Retry?
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                Upload File
                              </span>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => !isSubmitting && handleFileChange(doc.id, e)}
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>
                        {doc.status === 'error' && (
                          <p className="mt-1 text-sm text-red-600">
                            Please try uploading again. {doc.file?.name ? `(${doc.file.name})` : ''}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                      </>
                    )}
                  </div>
                ))
              ) : countryConfig && Object.keys(documents).length === 0 ? (
                <p className="text-gray-500 text-sm">No documents are currently required for {countryConfig.country_name}.</p>
              ) : (
                <p className="text-gray-500 text-sm">Select a country to view document requirements.</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-10 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || (isLoading && !countryConfig)} // Disable if still loading initial config
              className={`
                px-8 py-3 rounded-md text-white font-semibold text-lg
                ${isSubmitting || (isLoading && !countryConfig) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}
                shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Submit Verification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verification;