import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash, Plus, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Type definitions
interface Category {
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon_url?: string;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    icon: null as File | null,
    iconPreview: '' as string,
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [subcategoryParent, setSubcategoryParent] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add function to organize categories into a tree structure
  const organizeCategories = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.category_id, { ...category, subcategories: [] });
    });

    // Second pass: Organize into tree structure
    categories.forEach(category => {
      const categoryWithSubs = categoryMap.get(category.category_id)!;
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push(categoryWithSubs);
        }
      } else {
        rootCategories.push(categoryWithSubs);
      }
    });

    return rootCategories;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const categoriesData = await response.json();
      const organizedCategories = organizeCategories(categoriesData);
      setCategories(organizedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (parentCategory?: Category) => {
    setCategoryFormData({
      name: '',
      slug: '',
      parent_id: parentCategory ? String(parentCategory.category_id) : '',
      icon: null,
      iconPreview: '',
    });
    setFormErrors({
      name: '',
      slug: '',
    });
    setSubcategoryParent(parentCategory || null);
    setOpenDialog(true);
    setIsEditing(false);
    setEditingCategory(null);
  };

  const handleEditDialog = (category: Category) => {
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id ? String(category.parent_id) : '',
      icon: null,
      iconPreview: category.icon_url || '',
    });
    setFormErrors({
      name: '',
      slug: '',
    });
    setSubcategoryParent(null);
    setOpenDialog(true);
    setIsEditing(true);
    setEditingCategory(category);
  };

  const handleCloseDialog = () => {
    if (categoryFormData.iconPreview) {
      URL.revokeObjectURL(categoryFormData.iconPreview);
    }
    setCategoryFormData({
      name: '',
      slug: '',
      parent_id: '',
      icon: null,
      iconPreview: '',
    });
    setFormErrors({
      name: '',
      slug: '',
    });
    setSubcategoryParent(null);
    setOpenDialog(false);
    setIsEditing(false);
    setEditingCategory(null);
  };

  // Add function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Generate slug when name changes
      const newSlug = generateSlug(value);
      setCategoryFormData({
        ...categoryFormData,
        name: value,
        slug: newSlug,
      });
    } else {
      setCategoryFormData({
        ...categoryFormData,
        [name]: value,
      });
    }

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        setUploadingImage(true);
        const file = e.target.files[0];
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Image size should be less than 2MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setCategoryFormData({
          ...categoryFormData,
          icon: file,
          iconPreview: previewUrl,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Error processing image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Clean up preview URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (categoryFormData.iconPreview) {
        URL.revokeObjectURL(categoryFormData.iconPreview);
      }
    };
  }, [categoryFormData.iconPreview]);

  const validateForm = () => {
    const errors = {
      name: '',
      slug: '',
    };
    let isValid = true;

    if (!categoryFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!categoryFormData.slug.trim()) {
      errors.slug = 'Slug is required';
      isValid = false;
    } else {
      // Add slug validation
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(categoryFormData.slug.trim())) {
        errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', categoryFormData.name.trim());
      formData.append('slug', categoryFormData.slug.trim());
      
      // Handle parent_id - convert empty string to null
      if (categoryFormData.parent_id === '') {
        formData.append('parent_id', '');
      } else if (categoryFormData.parent_id) {
        formData.append('parent_id', categoryFormData.parent_id);
      }

      // Only append icon if it's a parent category (no parent_id) or if it's being edited
      if ((!categoryFormData.parent_id || isEditing) && categoryFormData.icon) {
        formData.append('icon_file', categoryFormData.icon);
      }

      const url = isEditing && editingCategory
        ? `${API_BASE_URL}/api/superadmin/categories/${editingCategory.category_id}`
        : `${API_BASE_URL}/api/superadmin/categories`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
      handleCloseDialog();
      await fetchCategories();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!categoryId) {
      toast.error('Invalid category ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete category' }));
        throw new Error(errorData.message || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      await fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error: Please check your connection and try again');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to delete category');
      }
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

  // Add function to render category rows recursively
  const renderCategoryRows = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories[category.category_id] || false;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isParentCategory = !category.parent_id;

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
              {isParentCategory && category.icon_url && (
                <img 
                  src={category.icon_url} 
                  alt={category.name}
                  className="w-8 h-8 mr-2 object-contain bg-gray-50"
                />
              )}
              <span className="font-medium">{category.name}</span>
              {/* Create Subcategory Button */}
              <button
                className="ml-2 px-2 py-1 text-xs bg-[#FF5733]/10 text-[#FF5733] rounded hover:bg-[#FF5733]/20 transition-colors"
                onClick={() => handleOpenDialog(category)}
                title={`Create subcategory under ${category.name}`}
              >
                + Subcategory
              </button>
            </div>
          </td>
          <td className="px-6 py-4">{category.slug}</td>
          <td className="px-6 py-4 text-right space-x-2">
            <button 
              className="p-1 text-gray-500 hover:text-blue-600 rounded" 
              onClick={() => handleEditDialog(category)}
              title="Edit Category"
            >
              <Edit2 size={16} />
            </button>
            <button 
              className="p-1 text-gray-500 hover:text-red-600 rounded" 
              onClick={() => handleDeleteCategory(category.category_id)}
              title="Delete Category"
            >
              <Trash size={16} />
            </button>
          </td>
        </tr>

        {isExpanded && category.subcategories && category.subcategories.map(subcategory => 
          renderCategoryRows(subcategory, level + 1)
        )}
      </React.Fragment>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          className="bg-[#FF5733] text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-[#FF4500] transition-colors"
          onClick={() => handleOpenDialog()}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-2 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(category => renderCategoryRows(category))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for Categories */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="category-slug"
                />
                {formErrors.slug && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.slug}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                {subcategoryParent ? (
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
                    <span className="text-gray-700">{subcategoryParent.name}</span>
                    <input type="hidden" name="parent_id" value={subcategoryParent.category_id} />
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    This will be a parent category
                  </div>
                )}
              </div>

              {/* Only show icon upload for parent categories */}
              {!categoryFormData.parent_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Icon</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className={`
                      flex-shrink-0 cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                      ${uploadingImage ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      transition-all duration-200
                    `}>
                      {uploadingImage ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </>
                      )}
                    </label>
                    {categoryFormData.icon && !uploadingImage && (
                      <span className="text-sm text-gray-500">
                        {categoryFormData.icon.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {categoryFormData.iconPreview && !uploadingImage && (
                    <div className="mt-4">
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={categoryFormData.iconPreview}
                          alt="Category icon preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(categoryFormData.iconPreview);
                            setCategoryFormData({
                              ...categoryFormData,
                              icon: null,
                              iconPreview: '',
                            });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                          title="Remove image"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5733]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF5733] hover:bg-[#FF4500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5733] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Update Category' : 'Create Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
