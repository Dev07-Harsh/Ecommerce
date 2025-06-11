import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AlertCircle, 
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
    product_id: number;
    product_name: string;
    sku: string;
    status: string;
    cost_price: number;
    selling_price: number;
    brand?: {
        brand_id: number;
        name: string;
        approved_at: string;
        approved_by: number;
        created_at: string;
        categories: Array<any>;
    };
    category?: {
        category_id: number;
        name: string;
        created_at: string;
        icon_url: string | null;
        parent_id: number;
    };
    media?: Array<{
        media_id: number;
        url: string;
        type: string;
        created_at: string;
        deleted_at: string | null;
        product_id: number;
        public_id: string | null;
    }>;
    meta?: {
        product_id: number;
        short_desc: string;
        full_desc: string;
        meta_title: string;
        meta_desc: string;
        meta_keywords: string;
    };
}

interface ProductViewerProps {
    product: Product;
    onClose: () => void;
    onApprove: (productId: number) => Promise<void>;
    onReject: (productId: number, reason: string) => Promise<void>;
    isActionLoading: boolean;
    getStatusBadgeClass: (status: string) => string;
}

const ProductViewer: React.FC<ProductViewerProps> = ({ 
    product, 
    onClose, 
    onApprove, 
    onReject,
    isActionLoading,
    getStatusBadgeClass
}) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleApprove = () => {
        onApprove(product.product_id);
    };

    const handleReject = () => {
        if (rejectionReason.trim()) {
            onReject(product.product_id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
        }
    };

    const nextImage = () => {
        if (product.media && currentImageIndex < product.media.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const previousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const getActionButtonText = () => {
        switch (product.status) {
            case 'APPROVED':
                return 'Reapprove Product';
            case 'REJECTED':
                return 'Approve Product';
            default:
                return 'Approve Product';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl mx-auto max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{product.product_name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(product.status)}`}>
                            {product.status}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Product Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                                {product.media && product.media.length > 0 ? (
                                    <>
                                        <img
                                            src={product.media[currentImageIndex].url}
                                            alt={product.product_name}
                                            className="object-contain w-full h-full"
                                        />
                                        {product.media.length > 1 && (
                                            <>
                                                <button
                                                    onClick={previousImage}
                                                    disabled={currentImageIndex === 0}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    disabled={currentImageIndex === product.media.length - 1}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center text-gray-400">
                                        No images available
                                    </div>
                                )}
                            </div>
                            {product.media && product.media.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.media.map((media, index) => (
                                        <button
                                            key={media.media_id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                                                currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        >
                                            <img
                                                src={media.url}
                                                alt={`${product.product_name} - Image ${index + 1}`}
                                                className="object-cover w-full h-full"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                                <div 
                                    className="mt-1 text-gray-900 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.meta?.short_desc || '' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">SKU</h4>
                                    <p className="mt-1 text-gray-900">{product.sku}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                                    <p className="mt-1 text-gray-900">{product.category?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Brand</h4>
                                    <p className="mt-1 text-gray-900">{product.brand?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <p className="mt-1 text-gray-900">{product.status}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Cost Price</h4>
                                    <p className="mt-1 text-gray-900">${product.cost_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Selling Price</h4>
                                    <p className="mt-1 text-gray-900">${product.selling_price.toFixed(2)}</p>
                                </div>
                            </div>

                            {product.meta && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Full Description</h4>
                                        <div 
                                            className="mt-1 text-gray-900 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: product.meta.full_desc || '' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Meta Title</h4>
                                        <div 
                                            className="mt-1 text-gray-900 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: product.meta.meta_title || '' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Meta Description</h4>
                                        <div 
                                            className="mt-1 text-gray-900 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: product.meta.meta_desc || '' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Meta Keywords</h4>
                                        <p className="mt-1 text-gray-900">{product.meta.meta_keywords}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={isActionLoading}
                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {product.status === 'REJECTED' ? 'Reject Again' : 'Reject Product'}
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isActionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {getActionButtonText()}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start text-red-600 mb-4">
                            <AlertCircle size={22} className="mr-2 mt-0.5 flex-shrink-0" />
                            <h3 className="text-lg font-semibold">
                                {product.status === 'REJECTED' ? 'Reject Again' : 'Reject Product'}
                            </h3>
                        </div>
                        <p className="mb-1 text-sm text-gray-700">
                            Reason for rejecting <span className="font-medium">{product.product_name}</span>:
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

const ProductMonitoring: React.FC = () => {
    const navigate = useNavigate();
    const { accessToken, user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Add debug function
    const debugLog = (message: string, data?: any) => {
        console.log(`[ProductMonitoring Debug] ${message}`, data || '');
    };

    const getStatusBadgeClass = (status: string) => {
        debugLog('Getting status badge class for status:', status);
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    useEffect(() => {
        if (!user || !['admin', 'superadmin'].includes(user.role.toLowerCase())) {
            toast.error('Access denied. Admin role required.');
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, statusFilter]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            debugLog('Fetching products from superadmin endpoints...');
            const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/superadmin/products/pending`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/api/superadmin/products/approved`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/api/superadmin/products/rejected`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                })
            ]);

            debugLog('API Responses Status:', {
                pending: pendingResponse.status,
                approved: approvedResponse.status,
                rejected: rejectedResponse.status
            });

            if (!pendingResponse.ok || !approvedResponse.ok || !rejectedResponse.ok) {
                const pendingError = await pendingResponse.text();
                const approvedError = await approvedResponse.text();
                const rejectedError = await rejectedResponse.text();
                debugLog('API Error Responses:', {
                    pending: pendingError,
                    approved: approvedError,
                    rejected: rejectedError
                });
                throw new Error('Failed to fetch products');
            }

            const [pendingProducts, approvedProducts, rejectedProducts] = await Promise.all([
                pendingResponse.json(),
                approvedResponse.json(),
                rejectedResponse.json()
            ]);

            debugLog('Fetched Products:', {
                pending: pendingProducts,
                approved: approvedProducts,
                rejected: rejectedProducts
            });

            // Map the products to include status
            const allProducts = [
                ...pendingProducts.map((p: Product) => ({ ...p, status: 'PENDING' })),
                ...approvedProducts.map((p: Product) => ({ ...p, status: 'APPROVED' })),
                ...rejectedProducts.map((p: Product) => ({ ...p, status: 'REJECTED' }))
            ];

            debugLog('Combined Products:', allProducts);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error in fetchProducts:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        // Apply status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(product => product.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name.toLowerCase().includes(searchLower) ||
                product.sku.toLowerCase().includes(searchLower) ||
                product.category?.name.toLowerCase().includes(searchLower) ||
                product.brand?.name.toLowerCase().includes(searchLower)
            );
        }

        setFilteredProducts(filtered);
    };

    const handleApprove = async (productId: number) => {
        if (!accessToken) return;

        setIsActionLoading(true);
        try {
            console.log('Approving product:', productId);
            const response = await fetch(`${API_BASE_URL}/api/superadmin/products/${productId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Approve Response Status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Approve Error Response:', errorText);
                throw new Error('Failed to approve product');
            }

            const responseData = await response.json();
            console.log('Approve Success Response:', responseData);

            toast.success('Product approved successfully');
            await fetchProducts();
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error in handleApprove:', error);
            toast.error('Failed to approve product');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (productId: number, reason: string) => {
        if (!accessToken) return;

        setIsActionLoading(true);
        try {
            console.log('Rejecting product:', { productId, reason });
            const response = await fetch(`${API_BASE_URL}/api/superadmin/products/${productId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            console.log('Reject Response Status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Reject Error Response:', errorText);
                throw new Error('Failed to reject product');
            }

            const responseData = await response.json();
            console.log('Reject Success Response:', responseData);

            toast.success('Product rejected successfully');
            await fetchProducts();
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error in handleReject:', error);
            toast.error('Failed to reject product');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleViewDetails = (product: Product) => {
        debugLog('Opening product details for:', product);
        setSelectedProduct(product);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-xl font-semibold text-gray-800">Error</p>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Product Monitoring</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and manage product approvals
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.product_id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-2 right-2 z-10">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(product.status)}`}>
                                    {product.status}
                                </span>
                            </div>

                            {/* Product Image */}
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                {product.media && product.media.length > 0 ? (
                                    <img
                                        src={product.media[0].url}
                                        alt={product.product_name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center text-gray-400">
                                        No image available
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{product.sku}</p>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Category:</span>
                                        <span className="text-gray-900">{product.category?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Brand:</span>
                                        <span className="text-gray-900">{product.brand?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Cost Price:</span>
                                        <span className="text-gray-900">${product.cost_price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Selling Price:</span>
                                        <span className="text-gray-900">${product.selling_price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={() => handleViewDetails(product)}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <Eye size={16} className="mr-2" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Product Viewer Modal */}
            {selectedProduct && (
                <ProductViewer
                    product={selectedProduct}
                    onClose={() => {
                        debugLog('Closing product details for:', selectedProduct);
                        setSelectedProduct(null);
                    }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isActionLoading={isActionLoading}
                    getStatusBadgeClass={getStatusBadgeClass}
                />
            )}
        </div>
    );
};

export default ProductMonitoring;
