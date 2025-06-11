import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ChevronDown, ChevronUp, ChevronRight, Edit, Trash2, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the input types enum to match backend
enum AttributeInputType {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    MULTI_SELECT = 'multiselect',
    Boolean = 'boolean'
}

interface ICustomAttribute {
    attribute_id: number;
    code: string;
    name: string;
    input_type: AttributeInputType;
    created_at: string;
}

interface IAttributeValue {
    attribute_id: number;
    value_code: string;
    value_label: string;
}

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

interface ICategoryAttribute {
    category_id: number;
    attribute_id: number;
    required_flag: boolean;
    attribute_details?: {
        attribute_id: number;
        name: string;
        code: string;
    };
}

const Attribute: React.FC = () => {
    // States
    const [activeTab, setActiveTab] = useState<'custom' | 'category'>('custom');
    const [customAttributes, setCustomAttributes] = useState<ICustomAttribute[]>([]);
    const [attributeValues, setAttributeValues] = useState<IAttributeValue[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

    // Form states
    const [showAddCustomAttribute, setShowAddCustomAttribute] = useState<boolean>(false);
    const [newCustomAttribute, setNewCustomAttribute] = useState<{
        code: string;
        name: string;
        input_type: AttributeInputType;
    }>({
        code: '',
        name: '',
        input_type: AttributeInputType.TEXT,
    });

    const [selectedAttribute, setSelectedAttribute] = useState<number | null>(null);
    const [attributeValue, setAttributeValue] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [requiredFlag, setRequiredFlag] = useState<boolean>(false);

    // Add new state for attribute value management
    const [showAddValueModal, setShowAddValueModal] = useState<boolean>(false);
    const [newAttributeValue, setNewAttributeValue] = useState<{
        value_code: string;
        value_label: string;
    }>({
        value_code: '',
        value_label: ''
    });

    const [linkedAttributes, setLinkedAttributes] = useState<ICategoryAttribute[]>([]);

    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        fetchAttributes();
        fetchCategories();
    }, []);

    // Fetch attribute values for all attributes when customAttributes changes
    useEffect(() => {
        customAttributes.forEach(attr => {
            fetchAttributeValues(attr.attribute_id);
        });
    }, [customAttributes]);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/attributes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                // Optionally redirect to login page
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch attributes');
            }

            const data = await response.json();
            setCustomAttributes(data);
        } catch (error) {
            console.error('Error fetching attributes:', error);
            toast.error('Failed to fetch attributes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                // Optionally redirect to login page
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

    const fetchAttributeValues = async (attributeId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/attribute-values/${attributeId}`, {
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
                throw new Error('Failed to fetch attribute values');
            }

            const data = await response.json();
            setAttributeValues(prevValues => {
                const filteredValues = prevValues.filter(v => v.attribute_id !== attributeId);
                return [...filteredValues, ...data];
            });
        } catch (error) {
            console.error('Error fetching attribute values:', error);
            toast.error('Failed to fetch attribute values');
        } finally {
            setLoading(false);
        }
    };

    // Create new attribute
    const handleAddCustomAttribute = async () => {
        if (newCustomAttribute.name.trim() && newCustomAttribute.code.trim()) {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/superadmin/attributes`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: newCustomAttribute.code,
                        name: newCustomAttribute.name,
                        input_type: newCustomAttribute.input_type
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create attribute');
                }

                const data = await response.json();
                setCustomAttributes([...customAttributes, data]);
                setNewCustomAttribute({
                    code: '',
                    name: '',
                    input_type: AttributeInputType.TEXT,
                });
                setShowAddCustomAttribute(false);
                toast.success('Attribute created successfully');
            } catch (error) {
                console.error('Error adding attribute:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to create attribute');
            } finally {
                setLoading(false);
            }
        }
    };

    // Add attribute value
    const handleAddAttributeValue = async () => {
        if (!selectedAttribute || !newAttributeValue.value_label.trim()) {
            toast.error('Please select an attribute and enter a value');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            // Store current scroll position
            const scrollPosition = window.scrollY;

            const response = await fetch(`${API_BASE_URL}/api/superadmin/attribute-values`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attribute_id: selectedAttribute,
                    value_code: newAttributeValue.value_code || newAttributeValue.value_label.toLowerCase().replace(/\s+/g, '_'),
                    value_label: newAttributeValue.value_label
                }),
            });

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create attribute value');
            }

            const data = await response.json();
            setAttributeValues([...attributeValues, data]);
            setNewAttributeValue({ value_code: '', value_label: '' });
            setShowAddValueModal(false);
            toast.success('Attribute value added successfully');

            // Restore scroll position after state updates
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollPosition);
            });
        } catch (error) {
            console.error('Error adding attribute value:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create attribute value');
        } finally {
            setLoading(false);
        }
    };

    // Link attribute to category
    const handleLinkAttributeToCategory = async () => {
        if (selectedAttribute && selectedCategory) {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/superadmin/categories/${selectedCategory}/assign-attribute`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        attribute_id: selectedAttribute,
                        required_flag: requiredFlag
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to link attribute to category');
                }

                toast.success('Attribute linked to category successfully');
                setSelectedAttribute(null);
                setRequiredFlag(false);
            } catch (error) {
                console.error('Error linking attribute to category:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to link attribute to category');
            } finally {
                setLoading(false);
            }
        }
    };

    // Delete attribute
    const handleDeleteAttribute = async (attributeId: number) => {
        if (!window.confirm('Are you sure you want to delete this attribute?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/superadmin/attributes/${attributeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete attribute');
            }

            setCustomAttributes(customAttributes.filter(attr => attr.attribute_id !== attributeId));
            toast.success('Attribute deleted successfully');
        } catch (error) {
            console.error('Error deleting attribute:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete attribute');
        } finally {
            setLoading(false);
        }
    };

    // Delete attribute value
    const handleDeleteAttributeValue = async (attributeId: number, valueCode: string) => {
        if (!window.confirm('Are you sure you want to delete this attribute value?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/superadmin/attribute-values/${attributeId}/${valueCode}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete attribute value');
            }

            setAttributeValues(attributeValues.filter(val => 
                !(val.attribute_id === attributeId && val.value_code === valueCode)
            ));
            toast.success('Attribute value deleted successfully');
        } catch (error) {
            console.error('Error deleting attribute value:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete attribute value');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoryExpand = (categoryId: number) => {
        setExpandedCategories({
            ...expandedCategories,
            [categoryId]: !expandedCategories[categoryId],
        });
    };

    // Add new function to fetch linked attributes
    const fetchLinkedAttributes = async (categoryId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/categories/${categoryId}/attributes`, {
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
                throw new Error('Failed to fetch linked attributes');
            }

            const data = await response.json();
            setLinkedAttributes(data);
        } catch (error) {
            console.error('Error fetching linked attributes:', error);
            toast.error('Failed to fetch linked attributes');
        } finally {
            setLoading(false);
        }
    };

    // Update the category selection handler
    const handleCategorySelect = (categoryId: number) => {
        setSelectedCategory(categoryId);
        fetchLinkedAttributes(categoryId);
    };

    // Update the renderCategoryRows function to use the new handler
    const renderCategoryRows = (category: ICategory, level: number = 0) => {
        const isExpanded = expandedCategories[category.category_id] || false;
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;

        return (
            <React.Fragment key={category.category_id}>
                <tr className="hover:bg-gray-50">
                    <td className="px-2 py-4">
                        {hasSubcategories && (
                            <button 
                                className="p-1 rounded-full hover:bg-gray-200" 
                                onClick={() => toggleCategoryExpand(category.category_id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center" style={{ paddingLeft: `${level * 2}rem` }}>
                            {category.icon_url && (
                                <img 
                                    src={category.icon_url} 
                                    alt={category.name}
                                    className="w-8 h-8 mr-2 rounded-full"
                                />
                            )}
                            <span className="font-medium">{category.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">{category.slug}</td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            className="p-1 text-[#FF5733] hover:text-[#FF4500] rounded mr-2"
                            onClick={() => handleCategorySelect(category.category_id)}
                            title="Link Attribute"
                        >
                            <Link size={16} />
                        </button>
                    </td>
                </tr>

                {isExpanded && category.subcategories && category.subcategories.map(subcategory => 
                    renderCategoryRows(subcategory, level + 1)
                )}
            </React.Fragment>
        );
    };

    // Add function to handle unlinking attributes
    const handleUnlinkAttribute = async (attributeId: number) => {
        if (!selectedCategory) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/superadmin/categories/${selectedCategory}/attributes/${attributeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to unlink attribute');
            }

            // Update the linked attributes list
            setLinkedAttributes(linkedAttributes.filter(attr => attr.attribute_id !== attributeId));
            toast.success('Attribute unlinked successfully');
        } catch (error) {
            console.error('Error unlinking attribute:', error);
            toast.error('Failed to unlink attribute');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Product Attributes</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex border-b mb-6">
                    <button
                        className={`px-4 py-2 mr-4 ${activeTab === 'custom' ? 'border-b-2 border-[#FF5733] text-[#FF5733]' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        Custom Attributes
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'category' ? 'border-b-2 border-[#FF5733] text-[#FF5733]' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('category')}
                    >
                        Category-Specific Attributes
                    </button>
                </div>

                {/* Custom Attributes Tab */}
                {activeTab === 'custom' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search attributes..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-[#FF5733] focus:border-[#FF5733]"
                                />
                            </div>
                            <button
                                className="ml-4 bg-[#FF5733] text-white px-4 py-2 rounded flex items-center hover:bg-[#FF4500] transition-colors"
                                onClick={() => setShowAddCustomAttribute(true)}
                            >
                                <PlusCircle className="w-4 h-4 mr-1" />
                                Add New Attribute
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Add values for additional attributes specific to your product.
                        </p>

                        {(customAttributes.filter(attr =>
                            attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            attr.code.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 0) ? (
                            <div className="space-y-6">
                                {customAttributes.filter(attr =>
                                    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    attr.code.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((attr) => (
                                    <div key={attr.attribute_id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium">{attr.name}</h3>
                                                <p className="text-sm text-gray-500">Code: {attr.code}</p>
                                                <p className="text-sm text-gray-500">Type: {attr.input_type}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button 
                                                    className="text-[#FF5733] hover:text-[#FF4500] p-2"
                                                    onClick={() => {
                                                        setSelectedAttribute(attr.attribute_id);
                                                        setShowAddValueModal(true);
                                                    }}
                                                    title="Add Values"
                                                >
                                                    <PlusCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    className="text-red-500 hover:text-red-600 p-2"
                                                    onClick={() => handleDeleteAttribute(attr.attribute_id)}
                                                    title="Delete Attribute"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Attribute Values Section */}
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium">Values</h4>
                                                <button
                                                    className="text-[#FF5733] text-sm hover:text-[#FF4500]"
                                                    onClick={() => {
                                                        setSelectedAttribute(attr.attribute_id);
                                                        setShowAddValueModal(true);
                                                    }}
                                                >
                                                    Add Value
                                                </button>
                                            </div>
                                            
                                            {attributeValues.filter(v => v.attribute_id === attr.attribute_id).length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {attributeValues
                                                        .filter(v => v.attribute_id === attr.attribute_id)
                                                        .map((val) => (
                                                            <div
                                                                key={`${val.attribute_id}-${val.value_code}`}
                                                                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{val.value_label}</p>
                                                                    <p className="text-xs text-gray-500">{val.value_code}</p>
                                                                </div>
                                                                <button
                                                                    className="text-red-500 hover:text-red-600"
                                                                    onClick={() => handleDeleteAttributeValue(val.attribute_id, val.value_code)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="text-center p-4 bg-gray-50 rounded">
                                                    <p className="text-sm text-gray-500">No values added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded">
                                <p>No custom attributes added yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Category-Specific Attributes Tab */}
                {activeTab === 'category' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Category-Specific Attributes</h2>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Link attributes to specific categories and mark them as required if needed.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Categories Section */}
                            <div className="bg-white border rounded-lg p-4">
                                <h3 className="font-medium mb-4">Categories</h3>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {categories.length > 0 ? (
                                        <div className="space-y-2">
                                            {categories.map(category => renderCategoryRows(category))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-gray-50 rounded">
                                            <p className="text-sm text-gray-500">No categories found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attribute Linking Section */}
                            <div className="bg-white border rounded-lg p-4">
                                <h3 className="font-medium mb-4">Link Attributes</h3>
                                
                                {selectedCategory ? (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2">Selected Category</label>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-medium">
                                                    {categories.find(c => c.category_id === selectedCategory)?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {categories.find(c => c.category_id === selectedCategory)?.slug}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Display Linked Attributes */}
                                        {linkedAttributes.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="font-medium mb-2">Linked Attributes</h4>
                                                <div className="space-y-2">
                                                    {linkedAttributes.map((linkedAttr) => (
                                                        <div key={linkedAttr.attribute_id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium">{linkedAttr.attribute_details?.name}</p>
                                                                <p className="text-xs text-gray-500">{linkedAttr.attribute_details?.code}</p>
                                                                {linkedAttr.required_flag && (
                                                                    <span className="text-xs text-[#FF5733] font-medium">Required</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                className="text-red-500 hover:text-red-600"
                                                                onClick={() => handleUnlinkAttribute(linkedAttr.attribute_id)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2">Select Attribute</label>
                                            <select
                                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:border-[#FF5733] [&>option]:bg-white [&>option]:text-gray-900 [&>option:checked]:bg-[#FF5733] [&>option:checked]:text-white"
                                                value={selectedAttribute || ''}
                                                onChange={(e) => {
                                                    const attrId = parseInt(e.target.value);
                                                    setSelectedAttribute(attrId);
                                                    if (attrId) {
                                                        fetchAttributeValues(attrId);
                                                    }
                                                }}
                                            >
                                                <option value="">Select an attribute...</option>
                                                {customAttributes
                                                    .filter(attr => !linkedAttributes.some(linked => linked.attribute_id === attr.attribute_id))
                                                    .map(attr => (
                                                        <option key={attr.attribute_id} value={attr.attribute_id}>
                                                            {attr.name} ({attr.input_type})
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={requiredFlag}
                                                    onChange={(e) => setRequiredFlag(e.target.checked)}
                                                    className="rounded border-gray-300 text-[#FF5733] focus:ring-[#FF5733]"
                                                />
                                                <span className="text-sm font-medium">Mark as Required</span>
                                            </label>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                className="bg-[#FF5733] text-white px-4 py-2 rounded hover:bg-[#FF4500] disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={handleLinkAttributeToCategory}
                                                disabled={!selectedAttribute || !selectedCategory}
                                            >
                                                Link Attribute
                                            </button>
                                        </div>

                                        {/* Show attribute values if an attribute is selected */}
                                        {selectedAttribute && attributeValues.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="font-medium mb-2">Attribute Values</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {attributeValues
                                                        .filter(v => v.attribute_id === selectedAttribute)
                                                        .map((val) => (
                                                            <div
                                                                key={`${val.attribute_id}-${val.value_code}`}
                                                                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{val.value_label}</p>
                                                                    <p className="text-xs text-gray-500">{val.value_code}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-500">
                                            Select a category to link attributes
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Custom Attribute Modal */}
            {showAddCustomAttribute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New Custom Attribute</h3>
                            <button onClick={() => setShowAddCustomAttribute(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddCustomAttribute();
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Attribute Name *</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter attribute name"
                                    value={newCustomAttribute.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const code = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                                        setNewCustomAttribute({ 
                                            ...newCustomAttribute, 
                                            name: name,
                                            code: code 
                                        });
                                    }}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Attribute Code *</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter attribute code"
                                    value={newCustomAttribute.code}
                                    onChange={(e) => setNewCustomAttribute({ ...newCustomAttribute, code: e.target.value })}
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Code is automatically generated from the attribute name
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Attribute Type *</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={newCustomAttribute.input_type}
                                    onChange={(e) => setNewCustomAttribute({
                                        ...newCustomAttribute,
                                        input_type: e.target.value as AttributeInputType
                                    })}
                                >
                                    {Object.values(AttributeInputType).map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                                    onClick={() => setShowAddCustomAttribute(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#FF5733] text-white px-4 py-2 rounded hover:bg-[#FF4500] transition-colors"
                                >
                                    Add Attribute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Value Modal */}
            {showAddValueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Add Attribute Value</h3>
                                {selectedAttribute && (
                                    <p className="text-sm text-gray-500">
                                        Adding value for: {customAttributes.find(a => a.attribute_id === selectedAttribute)?.name}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowAddValueModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddAttributeValue();
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Value Label *</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter value label"
                                    value={newAttributeValue.value_label}
                                    onChange={(e) => setNewAttributeValue({
                                        ...newAttributeValue,
                                        value_label: e.target.value,
                                        value_code: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                    })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Value Code</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter value code (optional)"
                                    value={newAttributeValue.value_code}
                                    onChange={(e) => setNewAttributeValue({
                                        ...newAttributeValue,
                                        value_code: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                    })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If not provided, will be generated from the label
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                                    onClick={() => setShowAddValueModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#FF5733] text-white px-4 py-2 rounded hover:bg-[#FF4500] transition-colors"
                                >
                                    Add Value
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Attribute;