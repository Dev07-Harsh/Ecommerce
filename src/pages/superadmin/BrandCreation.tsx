import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { PlusCircle, Upload, X, Check, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import SuperAdminLayout from './SuperAdminLayout';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface IBrand {
    brand_id: number;
    name: string;
    slug: string;
    icon_url: string | null;
    created_at: string;
    categories?: ICategory[];
}

interface ICategory {
    category_id: number;
    name: string;
    slug: string;
    icon_url: string | null;
}

interface IBrandRequest {
    request_id: number;
    name: string;
    category_id: number;
    parent_category_id: number | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    category?: {
        name: string;
    };
    parent_category?: {
        name: string;
    };
}

const BrandCreation: React.FC = () => {
    // State for brands list
    const [brands, setBrands] = useState<IBrand[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
    // State for brand creation form
    const [showAddBrandForm, setShowAddBrandForm] = useState<boolean>(false);
    const [newBrandName, setNewBrandName] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [brandImage, setBrandImage] = useState<File | null>(null);
    const [brandImagePreview, setBrandImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const formRef = useRef<HTMLFormElement>(null);
    // State for edit mode
    const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);
    const [editName, setEditName] = useState<string>('');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const [editSelectedCategories, setEditSelectedCategories] = useState<number[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Add new state for brand requests
    const [brandRequests, setBrandRequests] = useState<IBrandRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState<boolean>(true);
    const [requestError, setRequestError] = useState<string | null>(null);

    // Add state for category filter
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | ''>('');

    // Add new state for image uploading
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    // Fetch brands and categories on component mount
    useEffect(() => {
        fetchBrands();
        fetchCategories();
        fetchBrandRequests();
    }, []);

    // Fetch brands from API
    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/brands`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data = await response.json();
            setBrands(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching brands:', err);
            setError('Failed to load brands. Please try again later.');
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/categories`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            toast.error('Failed to load categories');
        }
    };

    // Fetch brand requests from API
    const fetchBrandRequests = async () => {
        setLoadingRequests(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/brand-requests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brand requests');
            }

            const data = await response.json();
            setBrandRequests(data);
            setRequestError(null);
        } catch (err) {
            console.error('Error fetching brand requests:', err);
            setRequestError('Failed to load brand requests. Please try again later.');
            toast.error('Failed to load brand requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    // Handle image upload
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setUploadingImage(true);
                const file = e.target.files[0];
                setBrandImage(file);
                
                // Create preview URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setBrandImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error processing image:', error);
                toast.error('Error processing image');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    // Handle edit image upload
    const handleEditImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setUploadingImage(true);
                const file = e.target.files[0];
                setEditImage(file);
                
                // Create preview URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setEditImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error processing image:', error);
                toast.error('Error processing image');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    // Clear image selection
    const clearImageSelection = () => {
        setBrandImage(null);
        setBrandImagePreview(null);
    };

    // Clear edit image selection
    const clearEditImageSelection = () => {
        setEditImage(null);
        setEditImagePreview(null);
    };

    // Add new function to handle category selection
    const handleCategoryChange = (categoryId: number, isChecked: boolean) => {
        setSelectedCategories(prev => 
            isChecked 
                ? [...prev, categoryId]
                : prev.filter(id => id !== categoryId)
        );
    };

    // Add new function to handle edit category selection
    const handleEditCategoryChange = (categoryId: number, isChecked: boolean) => {
        setEditSelectedCategories(prev => 
            isChecked 
                ? [...prev, categoryId]
                : prev.filter(id => id !== categoryId)
        );
    };

    // Submit new brand (also handles approving request)
    const handleSubmitBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return setSubmitError('Brand name is required');

        setSubmitting(true);
        try {
            // Create brand
            const formData = new FormData();
            formData.append('name', newBrandName.trim());
            if (brandImage) formData.append('icon_file', brandImage);

            const response = await fetch(`${API_BASE_URL}/api/superadmin/brands`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                body: formData,
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to create brand');

            const newBrand = await response.json();

            // Associate categories (only valid IDs)
            const validCats = selectedCategories.filter(id => id != null);
            await Promise.all(validCats.map(catId =>
                fetch(
                    `${API_BASE_URL}/api/superadmin/brands/${newBrand.brand_id}/categories/${catId}`,
                    {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    }
                )
            ));

            // Approve original request if exists
            if (currentRequestId) {
                const resp = await fetch(
                    `${API_BASE_URL}/api/superadmin/brand-requests/${currentRequestId}/approve`,
                    { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
                );
                if (!resp.ok) throw new Error((await resp.json()).message || 'Failed to approve request');
                toast.success('Brand request approved and brand created');
            } else {
                toast.success('Brand created');
            }

            // Refresh
            fetchBrands();
            fetchBrandRequests();
            resetForm();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit brand
    const handleEditBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        try {
            const formData = new FormData();
            formData.append('name', editName.trim());
            
            if (editImage) {
                formData.append('icon_file', editImage);
            }

            // First update the brand details
            const response = await fetch(`${API_BASE_URL}/api/superadmin/brands/${editingBrand.brand_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    // Remove Content-Type header to let the browser set it automatically with the boundary for FormData
                },
                body: formData
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update brand');
                } else {
                    throw new Error('Failed to update brand');
                }
            }

            const updatedBrand = await response.json();
            
            // Then update category associations
            const currentCategories = editingBrand.categories?.map(c => c.category_id) || [];
            
            // Remove categories that are no longer selected
            for (const categoryId of currentCategories) {
                if (!editSelectedCategories.includes(categoryId)) {
                    const deleteResponse = await fetch(`${API_BASE_URL}/api/superadmin/brands/${editingBrand.brand_id}/categories/${categoryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!deleteResponse.ok) {
                        throw new Error('Failed to remove category association');
                    }
                }
            }
            
            // Add new categories
            for (const categoryId of editSelectedCategories) {
                if (!currentCategories.includes(categoryId)) {
                    const addResponse = await fetch(`${API_BASE_URL}/api/superadmin/brands/${editingBrand.brand_id}/categories/${categoryId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!addResponse.ok) {
                        throw new Error('Failed to add category association');
                    }
                }
            }
            
            // Update the brands list
            setBrands(brands.map(brand => 
                brand.brand_id === editingBrand.brand_id ? updatedBrand : brand
            ));
            
            toast.success('Brand updated successfully');
            cancelEdit();
            fetchBrands();
        } catch (err: any) {
            console.error('Error updating brand:', err);
            toast.error(err.message || 'Failed to update brand');
        }
    };

    // Handle delete brand
    const handleDeleteBrand = async (brandId: number) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/brands/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete brand');
            }

            // Remove the deleted brand from the list
            setBrands(brands.filter(brand => brand.brand_id !== brandId));
            toast.success('Brand deleted successfully');
        } catch (err: any) {
            console.error('Error deleting brand:', err);
            toast.error(err.message || 'Failed to delete brand');
        }
    };

    // Start editing a brand
    const startEdit = (brand: IBrand) => {
        setEditingBrand(brand);
        setEditName(brand.name);
        setEditImagePreview(brand.icon_url);
        setEditSelectedCategories(brand.categories?.map(c => c.category_id) || []);
        setIsEditing(true);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingBrand(null);
        setEditName('');
        setEditImage(null);
        setEditImagePreview(null);
        setIsEditing(false);
    };

    // Reset form fields
     const resetForm = () => {
        setNewBrandName('');
        setSelectedCategories([]);
        setBrandImage(null);
        setBrandImagePreview(null);
        setShowAddBrandForm(false);
        setCurrentRequestId(null);
    };

    // Update the filtered brands logic to include category filtering
    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryFilter === '' || 
            brand.categories?.some(cat => cat.category_id === selectedCategoryFilter);
        return matchesSearch && matchesCategory;
    });

    // Add function to handle brand request approval
    const handleApproveRequest = (requestId: number) => {
        const req = brandRequests.find(r => r.request_id === requestId);
        if (!req) {
            toast.error('Invalid request');
            return;
        }
        // Prefill form with request data
        setNewBrandName(req.name);
        setSelectedCategories([req.category_id]);
        setBrandImage(null);
        setBrandImagePreview(null);
        setCurrentRequestId(requestId);
        setShowAddBrandForm(true);

        // Scroll form into view
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

    };


    // Add function to handle brand request rejection
    const handleRejectRequest = async (requestId: number) => {
        if (!requestId) {
            toast.error('Invalid request ID');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/brand-requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notes: 'Rejected by superadmin'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject brand request');
            }

            toast.success('Brand request rejected successfully');
            fetchBrandRequests(); // Refresh requests
        } catch (err: any) {
            console.error('Error rejecting brand request:', err);
            toast.error(err.message || 'Failed to reject brand request');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Brand Management</h1>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-[200px]">
                    <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setShowAddBrandForm(true)}
                    className="bg-[#FF5733] text-white px-4 py-2 rounded hover:bg-[#FF4500] transition-colors"
                >
                    Add New Brand
                </button>
            </div>

            {/* Brand Requests Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Brand Requests</h2>
                
                {loadingRequests ? (
                    <div className="text-center py-4">Loading brand requests...</div>
                ) : requestError ? (
                    <div className="text-center py-4 text-red-500">{requestError}</div>
                ) : brandRequests.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No pending brand requests</div>
                ) : (
                    <div className="space-y-4">
                        {brandRequests.map((request) => (
                            <div key={request.request_id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{request.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Category: {request.category?.name}
                                            {request.parent_category && ` > ${request.parent_category.name}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Requested on: {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleApproveRequest(request.request_id)}
                                            className="px-3 py-1 bg-[#FF5733] text-white rounded hover:bg-[#FF4500] transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.request_id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Brands</h2>
                        <button
                            className="flex items-center text-[#FF5733] hover:text-[#FF4500]"
                            onClick={() => setShowAddBrandForm(!showAddBrandForm)}
                        >
                            <PlusCircle className="w-4 h-4 mr-1" />
                            {showAddBrandForm ? 'Cancel' : 'Add New Brand'}
                        </button>
                    </div>
                    
                    {/* Brand Creation Form */}
                    {showAddBrandForm && (
                        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                            <h3 className="text-md font-medium mb-3">Create New Brand</h3>
                            
                            {submitSuccess && (
                                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded flex items-center">
                                    <Check className="w-4 h-4 mr-2" />
                                    Brand created successfully!
                                </div>
                            )}
                            
                            {submitError && (
                                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {submitError}
                                </div>
                            )}
                            
                            <form ref={formRef} onSubmit={handleSubmitBrand}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newBrandName}
                                        onChange={(e) => setNewBrandName(e.target.value)}
                                        placeholder="Enter brand name"
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Icon
                                    </label>
                                    
                                    {brandImagePreview ? (
                                        <div className="relative w-32 h-32 mb-2">
                                            <img 
                                                src={brandImagePreview} 
                                                alt="Brand preview" 
                                                className="w-full h-full object-contain border rounded-md"
                                            />
                                            <button 
                                                type="button"
                                                onClick={clearImageSelection}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`
                                            border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50
                                            ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                            onClick={() => !uploadingImage && document.getElementById('brandImageInput')?.click()}
                                        >
                                            {uploadingImage ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 border-4 border-[#FF5733] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                    <p className="text-sm text-gray-500">Uploading...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 mx-auto text-gray-400" />
                                                    <p className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG, JPEG, GIF, SVG, WEBP</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    
                                    <input
                                        id="brandImageInput"
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categories
                                    </label>
                                    <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                                        {categories.map((category) => (
                                            <div key={category.category_id} className="flex items-center space-x-2 py-1">
                                                <input
                                                    type="checkbox"
                                                    id={`category-${category.category_id}`}
                                                    checked={selectedCategories.includes(category.category_id)}
                                                    onChange={(e) => handleCategoryChange(category.category_id, e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={`category-${category.category_id}`} className="text-sm">
                                                    {category.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#FF5733] text-white px-4 py-2 rounded hover:bg-[#FF4500] transition-colors"
                                    >
                                        Create Brand
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {/* Loading and Error States */}
                    {loading ? (
                        <div className="text-center py-4">Loading brands...</div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">{error}</div>
                    ) : (
                        /* Brand List */
                        <div className="mt-4">
                            {filteredBrands.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">No brands found</div>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <div key={brand.brand_id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                                        <div className="flex items-center">
                                            {brand.icon_url ? (
                                                <img 
                                                    src={brand.icon_url} 
                                                    alt={brand.name} 
                                                    className="w-8 h-8 mr-3 object-contain"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium">
                                                        {brand.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="font-medium">{brand.name}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => startEdit(brand)}
                                                className="text-[#FF5733] hover:text-[#FF4500] text-sm flex items-center"
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" />
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBrand(brand.brand_id)}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Brand Modal */}
            {isEditing && editingBrand && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Edit Brand</h3>
                        <form onSubmit={handleEditBrand}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand Name *
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter brand name"
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand Icon
                                </label>
                                
                                {editImagePreview ? (
                                    <div className="relative w-32 h-32 mb-2">
                                        <img 
                                            src={editImagePreview} 
                                            alt="Brand preview" 
                                            className="w-full h-full object-contain border rounded-md"
                                        />
                                        <button 
                                            type="button"
                                            onClick={clearEditImageSelection}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`
                                        border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50
                                        ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                        onClick={() => !uploadingImage && document.getElementById('editBrandImageInput')?.click()}
                                    >
                                        {uploadingImage ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-[#FF5733] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                <p className="text-sm text-gray-500">Uploading...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 mx-auto text-gray-400" />
                                                <p className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, JPEG, GIF, SVG, WEBP</p>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                <input
                                    id="editBrandImageInput"
                                    type="file"
                                    onChange={handleEditImageChange}
                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categories
                                </label>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                                    {categories.map((category) => (
                                        <div key={category.category_id} className="flex items-center space-x-2 py-1">
                                            <input
                                                type="checkbox"
                                                id={`edit-category-${category.category_id}`}
                                                checked={editSelectedCategories.includes(category.category_id)}
                                                onChange={(e) => handleEditCategoryChange(category.category_id, e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label htmlFor={`edit-category-${category.category_id}`} className="text-sm">
                                                {category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandCreation;