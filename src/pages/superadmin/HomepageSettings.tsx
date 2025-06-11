import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ChevronDown, ChevronUp, Save, Upload, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || 'http://localhost:5173';

interface ICategory {
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
    icon_url?: string;
    created_at: string;
    updated_at: string;
    subcategories?: ICategory[];
}

interface IHomepageCategory {
    id: number;
    category_id: number;
    display_order: number;
    is_active: boolean;
    category: ICategory;
    created_at: string;
    updated_at: string;
}

interface IBrand {
    brand_id: number;
    name: string;
    slug: string;
    icon_url?: string;
    created_at: string;
    updated_at: string;
}

interface IProduct {
    product_id: number;
    name: string;
    slug: string;
    image_url?: string;
    price: number;
    brand_id: number;
    category_id: number;
    created_at: string;
    updated_at: string;
    product_name: string;
}

interface ICarouselItem {
    id: number;
    type: 'brand' | 'product' | 'promo' | 'new' | 'featured';
    image_url: string;
    target_id: number;
    display_order: number;
    is_active: boolean;
    shareable_link?: string;
}

const HomepageSettings: React.FC = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [brands, setBrands] = useState<IBrand[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [brandCarousel, setBrandCarousel] = useState<ICarouselItem[]>([]);
    const [productCarousel, setProductCarousel] = useState<ICarouselItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<'brand' | 'product'>('brand');
    const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
    const [shareableLink, setShareableLink] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [shareableBrandLink, setShareableBrandLink] = useState<string>('');
    const [shareableProductLink, setShareableProductLink] = useState<string>('');
    const [carouselItems, setCarouselItems] = useState<ICarouselItem[]>([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [selectedProductGroup, setSelectedProductGroup] = useState<'promo' | 'new' | 'featured'>('promo');
    const [editingCarousel, setEditingCarousel] = useState<ICarouselItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchFeaturedCategories();
        fetchBrands();
        fetchProducts();
        fetchCarousels();
        fetchCarouselItems();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/categories/main`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedCategories = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/homepage/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch featured categories');
            }

            const data: IHomepageCategory[] = await response.json();
            setSelectedCategories(data.map(cat => cat.category_id));
        } catch (error) {
            console.error('Error fetching featured categories:', error);
            toast.error('Failed to fetch featured categories');
        }
    };

    const fetchBrands = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/brands`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data = await response.json();
            setBrands(data);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to fetch brands');
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            console.log('API /products response:', data);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        }
    };

    const fetchCarousels = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch carousels');
            }

            const data = await response.json();
            setBrandCarousel(data.filter((item: ICarouselItem) => item.type === 'brand'));
            setProductCarousel(data.filter((item: ICarouselItem) => item.type === 'product'));
        } catch (error) {
            console.error('Error fetching carousels:', error);
            toast.error('Failed to fetch carousels');
        }
    };

    const fetchCarouselItems = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch carousel items');
            const data = await response.json();
            setCarouselItems(data);
        } catch (error) {
            console.error('Error fetching carousel items:', error);
        }
    };

    const toggleCategoryExpand = (categoryId: number) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleCategorySelect = (categoryId: number) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/homepage/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_ids: selectedCategories
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save homepage settings');
            }

            toast.success('Homepage settings saved successfully');
        } catch (error) {
            console.error('Error saving homepage settings:', error);
            toast.error('Failed to save homepage settings');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const generateShareableLink = (type: 'brand' | 'product' | 'promo' | 'new' | 'featured', targetId: number) => {
        if (type === 'brand') {
            const brand = brands.find(b => b.brand_id === targetId);
            return brand ? `${FRONTEND_BASE_URL}/all-products?brand=${brand.slug}` : '';
        } else if (type === 'product') {
            const product = products.find(p => p.product_id === targetId);
            return product ? `${FRONTEND_BASE_URL}/product/${product.product_id}` : '';
        } else {
            // Handle product groups
            switch (type) {
                case 'promo':
                    return `${FRONTEND_BASE_URL}/promo-products`;
                case 'new':
                    return `${FRONTEND_BASE_URL}/new-product`;
                case 'featured':
                    return `${FRONTEND_BASE_URL}/featured-products`;
                default:
                    return '';
            }
        }
    };

    const handleCarouselUpload = async (carouselType: 'brand' | 'product' | 'promo' | 'new' | 'featured') => {
        const selectedId = carouselType === 'brand' ? selectedBrand : 1; // Use 1 as default ID for product groups
        const link = carouselType === 'brand' ? shareableBrandLink : generateShareableLink(carouselType, 1);
        if (!selectedImage || !link) {
            toast.error('Please select an image and ensure a shareable link is generated.');
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            const formData = new FormData();
            formData.append('type', carouselType);
            formData.append('target_id', selectedId.toString());
            formData.append('shareable_link', link);
            formData.append('image', selectedImage);
            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) {
                throw new Error('Failed to upload carousel item');
            }
            toast.success('Carousel item uploaded successfully');
            setSelectedImage(null);
            if (carouselType === 'brand') {
                setSelectedBrand(null);
                setShareableBrandLink('');
            } else {
                setSelectedProductGroup('promo');
            }
        } catch (error) {
            console.error('Error uploading carousel item:', error);
            toast.error('Failed to upload carousel item');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCarousel = async (itemId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from carousel');
            }

            toast.success('Item removed from carousel successfully');
            fetchCarousels();
        } catch (error) {
            console.error('Error removing item from carousel:', error);
            toast.error('Failed to remove item from carousel');
        }
    };

    const renderCategoryItem = (category: ICategory, level: number = 0) => {
        const isExpanded = expandedCategories[category.category_id] || false;
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        const isSelected = selectedCategories.includes(category.category_id);

        return (
            <div key={category.category_id} className="mb-2">
                <div 
                    className={`flex items-center p-3 rounded-lg ${
                        isSelected ? 'bg-[#FF5733] bg-opacity-10' : 'hover:bg-gray-50'
                    }`}
                    style={{ paddingLeft: `${level * 2 + 1}rem` }}
                >
                    {hasSubcategories && (
                        <button
                            onClick={() => toggleCategoryExpand(category.category_id)}
                            className="p-1 rounded-full hover:bg-gray-200 mr-2"
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                    <div className="flex items-center flex-1">
                        {category.icon_url && (
                            <img
                                src={category.icon_url}
                                alt={category.name}
                                className="w-8 h-8 mr-3 rounded-full"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.slug}</p>
                        </div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCategorySelect(category.category_id)}
                                className="w-4 h-4 text-[#FF5733] border-gray-300 rounded focus:ring-[#FF5733]"
                            />
                            <span className="text-sm text-gray-600">Show on homepage</span>
                        </label>
                    </div>
                </div>

                {isExpanded && hasSubcategories && (
                    <div className="mt-2">
                        {category.subcategories?.map(subcategory =>
                            renderCategoryItem(subcategory, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Drag-and-drop handlers
    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const reordered = Array.from(carouselItems);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        // Update display_order locally
        const updated = reordered.map((item, idx) => ({ ...item, display_order: idx }));
        setCarouselItems(updated);
    };

    const handleSaveOrder = async () => {
        try {
            setOrderLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            const order = carouselItems.map((item, idx) => ({ id: item.id, display_order: idx }));
            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels/order`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order }),
            });
            if (!response.ok) throw new Error('Failed to update order');
            toast.success('Carousel order updated!');
            fetchCarouselItems();
        } catch (error) {
            console.error('Error updating carousel order:', error);
            toast.error('Failed to update carousel order');
        } finally {
            setOrderLoading(false);
        }
    };

    const handleEditCarousel = (item: ICarouselItem) => {
        setEditingCarousel(item);
        setSelectedImage(null);
        if (item.type === 'brand') {
            setSelectedBrand(item.target_id);
            setShareableBrandLink(item.shareable_link || '');
        } else if (['promo', 'new', 'featured'].includes(item.type)) {
            setSelectedProductGroup(item.type as 'promo' | 'new' | 'featured');
            setShareableProductLink(generateShareableLink(item.type as 'promo' | 'new' | 'featured', 1));
        }
        setIsEditing(true);
    };

    const handleUpdateCarousel = async () => {
        if (!editingCarousel) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const formData = new FormData();
            const type = editingCarousel.type === 'brand' ? 'brand' : selectedProductGroup;
            formData.append('type', type);
            formData.append('target_id', editingCarousel.type === 'brand' ? selectedBrand?.toString() || '1' : '1');
            formData.append('shareable_link', generateShareableLink(type, editingCarousel.type === 'brand' ? selectedBrand || 1 : 1));
            
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels/${editingCarousel.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update carousel item');
            }

            toast.success('Carousel item updated successfully');
            setEditingCarousel(null);
            setIsEditing(false);
            setSelectedImage(null);
            setSelectedBrand(null);
            setSelectedProductGroup('promo');
            setShareableBrandLink('');
            fetchCarousels();
            fetchCarouselItems();
        } catch (error) {
            console.error('Error updating carousel item:', error);
            toast.error('Failed to update carousel item');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCarousel = async (itemId: number) => {
        if (!window.confirm('Are you sure you want to delete this carousel item?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/carousels/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete carousel item');
            }

            toast.success('Carousel item deleted successfully');
            fetchCarousels();
            fetchCarouselItems();
        } catch (error) {
            console.error('Error deleting carousel item:', error);
            toast.error('Failed to delete carousel item');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingCarousel(null);
        setIsEditing(false);
        setSelectedImage(null);
        setSelectedBrand(null);
        setSelectedProductGroup('promo');
        setShareableBrandLink('');
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5733]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Homepage Settings</h1>
                <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-[#FF5733] text-white px-4 py-2 rounded flex items-center hover:bg-[#FF4500] transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Featured Categories</h2>
                    <p className="text-sm text-gray-500">
                        Select the categories you want to display on the homepage. Selected categories and their subcategories will be visible to users.
                    </p>
                </div>

                <div className="border rounded-lg p-4">
                    {categories.length > 0 ? (
                        <div className="space-y-2">
                            {categories.map(category => renderCategoryItem(category))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-gray-50 rounded">
                            <p className="text-gray-500">No categories found</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Selected Categories</h3>
                    {selectedCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map(categoryId => {
                                const category = categories.find(c => c.category_id === categoryId);
                                return category ? (
                                    <div
                                        key={categoryId}
                                        className="bg-white px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {category.name}
                                        <button
                                            onClick={() => handleCategorySelect(categoryId)}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No categories selected</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Brand Carousel</h2>
                    <div className="space-y-4">
                        {/* Image size suggestion for Brand Carousel */}
                        <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-yellow-800">
                            <strong>Suggestion:</strong> For your Brand Carousel, use images that are at least <b>1920 x 450 px</b> or larger, with a wide aspect ratio (16:9, 21:9, or wider). 
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex-1">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Upload Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full"
                                />
                            </label>
                            <label className="flex-1">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Select Brand</span>
                                <select
                                    value={selectedBrand || ''}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setSelectedBrand(value);
                                        if (value) {
                                            const link = generateShareableLink('brand', value);
                                            setShareableBrandLink(link);
                                        } else {
                                            setShareableBrandLink('');
                                        }
                                    }}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select a brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.brand_id} value={brand.brand_id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {selectedBrand && shareableBrandLink && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Shareable Link</span>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={shareableBrandLink}
                                        readOnly
                                        className="flex-1 p-2 border rounded text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareableBrandLink);
                                            toast.success('Link copied to clipboard');
                                        }}
                                        className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => handleCarouselUpload('brand')}
                            className="w-full bg-[#FF5733] text-white px-4 py-2 rounded flex items-center justify-center hover:bg-[#FF4500] transition-colors mt-2"
                            disabled={loading}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Upload Brand Carousel Item
                        </button>
                        <div className="mt-4 space-y-2">
                            {brandCarousel.map((item) => {
                                const brand = brands.find(b => b.brand_id === item.target_id);
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                            <img src={item.image_url} alt={brand?.name} className="w-10 h-10 object-cover rounded" />
                                            <span>{brand?.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditCarousel(item)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCarousel(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Product Group Carousel</h2>
                    <div className="space-y-4">
                        {/* Image size suggestion for Product Carousel */}
                        <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-yellow-800">
                            <strong>Suggestion:</strong> For your Product Group Carousel, use images that are at least <b>1920 x 450 px</b> or larger, with a wide aspect ratio (16:9, 21:9, or wider). 
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex-1">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Upload Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full"
                                />
                            </label>
                            <label className="flex-1">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Select Product Group</span>
                                <select
                                    value={selectedProductGroup}
                                    onChange={(e) => {
                                        const value = e.target.value as 'promo' | 'new' | 'featured';
                                        setSelectedProductGroup(value);
                                        setShareableProductLink(generateShareableLink(value, 1));
                                    }}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="promo">Promo Products</option>
                                    <option value="new">New Products</option>
                                    <option value="featured">Featured Products</option>
                                </select>
                            </label>
                        </div>
                        {selectedProductGroup && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Shareable Link</span>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={shareableProductLink}
                                        readOnly
                                        className="flex-1 p-2 border rounded text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareableProductLink);
                                            toast.success('Link copied to clipboard');
                                        }}
                                        className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => handleCarouselUpload(selectedProductGroup)}
                            className="w-full bg-[#FF5733] text-white px-4 py-2 rounded flex items-center justify-center hover:bg-[#FF4500] transition-colors mt-2"
                            disabled={loading}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Upload Product Group Carousel Item
                        </button>
                        <div className="mt-4 space-y-2">
                            {productCarousel.map((item) => {
                                const groupName = item.type === 'promo' ? 'Promo Products' :
                                                item.type === 'new' ? 'New Products' :
                                                item.type === 'featured' ? 'Featured Products' : '';
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                            <img src={item.image_url} alt={groupName} className="w-10 h-10 object-cover rounded" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{groupName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={item.shareable_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <LinkIcon size={16} />
                                            </a>
                                            <button
                                                onClick={() => handleEditCarousel(item)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCarousel(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel Order Management Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-lg font-semibold mb-4">Manage Carousel Display Order</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="carousel-list">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                {carouselItems.map((item, idx) => (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={idx}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`flex items-center bg-gray-50 rounded p-2 shadow-sm ${snapshot.isDragging ? 'ring-2 ring-[#FF5733]' : ''}`}
                                            >
                                                <img src={item.image_url} alt={item.type} className="w-12 h-12 object-cover rounded mr-4" />
                                                <span className="flex-1 font-medium">
                                                    {item.type === 'brand'
                                                        ? brands.find(b => b.brand_id === item.target_id)?.name
                                                        : item.type === 'product'
                                                            ? products.find(p => p.product_id === item.target_id)?.product_name
                                                            : item.type === 'promo'
                                                                ? 'Promo Products'
                                                                : item.type === 'new'
                                                                    ? 'New Products'
                                                                    : 'Featured Products'}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    {item.shareable_link && (
                                                        <a href={item.shareable_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                            <LinkIcon size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditCarousel(item)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCarousel(item.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <span className="text-xs text-gray-400 ml-2">Order: {item.display_order}</span>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <button
                    onClick={handleSaveOrder}
                    className="mt-4 bg-[#FF5733] text-white px-4 py-2 rounded flex items-center hover:bg-[#FF4500] transition-colors disabled:opacity-50"
                    disabled={orderLoading}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {orderLoading ? 'Saving...' : 'Save Order'}
                </button>
            </div>

            {/* Edit Modal */}
            {isEditing && editingCarousel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Carousel Item</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full"
                                />
                            </div>
                            {editingCarousel.type === 'brand' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Brand</label>
                                    <select
                                        value={selectedBrand || ''}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            setSelectedBrand(value);
                                            if (value) {
                                                const link = generateShareableLink('brand', value);
                                                setShareableBrandLink(link);
                                            }
                                        }}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select a brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.brand_id} value={brand.brand_id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product Group</label>
                                    <select
                                        value={selectedProductGroup}
                                        onChange={(e) => {
                                            const value = e.target.value as 'promo' | 'new' | 'featured';
                                            setSelectedProductGroup(value);
                                            setShareableProductLink(generateShareableLink(value, 1));
                                        }}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="promo">Promo Products</option>
                                        <option value="new">New Products</option>
                                        <option value="featured">Featured Products</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCarousel}
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#FF5733] text-white rounded hover:bg-[#FF4500] disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageSettings; 