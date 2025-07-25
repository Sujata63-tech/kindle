import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  PenTool, 
  Edit3, 
  Trash2, 
  Download,
  Upload,
  FileText,
  Search,
  User,
  Calendar
} from 'lucide-react';
import { api } from '../utils/api';

const Poetry = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPoem, setEditingPoem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ categories: [], popularTags: [] });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    category: '',
    tags: '',
    content: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    category: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    fetchPoems();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.poetry.getAll();
      const poemsData = response.data;

      if (poemsData.stats) {
        setStats(poemsData.stats);
        setCategories(poemsData.stats.categories);
      } else {
        // Fallback for backward compatibility
        const uniqueCategories = [...new Set(poemsData.poems
          .map(poem => poem.category)
          .filter(Boolean)
          .sort()
        )];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const debounceFetchPoems = (newFilters) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchPoems(newFilters);
    }, 300);
    
    setDebounceTimer(timer);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'category') {
      fetchPoems(newFilters);
    } else {
      debounceFetchPoems(newFilters);
    }
  };

  const fetchPoems = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {};

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value && value.toString().trim()) params[key] = value;
      });

      console.log('Fetching poems with params:', params);
      const response = await api.poetry.getAll(params);

      if (response.data.poems) {
        setPoems(response.data.poems);
      }
      if (response.data.stats) {
        setStats(response.data.stats);
        setCategories(response.data.stats.categories);
      }
    } catch (error) {
      console.error('Failed to fetch poems:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const resetFilters = {
      title: '',
      author: '',
      category: '',
      tags: '',
      content: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      search: ''
    };

    setFilters(resetFilters);
    setShowAdvancedFilters(false);
    fetchPoems(resetFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      if (editingPoem) {
        await api.poetry.update(editingPoem.id, formData);
      } else {
        await api.poetry.create(submitData);
      }
      
      setShowModal(false);
      setEditingPoem(null);
      setSelectedFile(null);
      setFormData({ title: '', author: '', content: '', category: '', tags: '' });
      fetchPoems();
    } catch (error) {
      console.error('Failed to save poem:', error);
      alert('Failed to save poem. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this poem?')) {
      try {
        await api.poetry.delete(id);
        fetchPoems();
      } catch (error) {
        console.error('Failed to delete poem:', error);
      }
    }
  };

  const handleEdit = (poem) => {
    setEditingPoem(poem);
    setFormData({
      title: poem.title,
      author: poem.author,
      content: poem.content || '',
      category: poem.category || '',
      tags: poem.tags || ''
    });
    setShowModal(true);
  };

  const handleDownload = async (poem) => {
    if (!poem.filePath) {
      alert('No file available for download');
      return;
    }

    try {
      const response = await api.poetry.download(poem.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', poem.fileName || `${poem.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and Word documents are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-beige-900">Poetry Collection</h1>
          <p className="text-beige-600">Share and discover beautiful poetry</p>
        </div>
        
        <button
          onClick={() => {
            setEditingPoem(null);
            setFormData({ title: '', author: '', content: '', category: '', tags: '' });
            setSelectedFile(null);
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Poem
        </button>
      </div>

      {/* Filters */}
      <div className="card-dreamy p-4 mb-6">
        {/* Quick Search */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-beige-400" />
            <input
              type="text"
              placeholder="Global search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-dreamy pl-10 text-sm w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Title..."
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            className="input-dreamy text-sm"
          />

          <input
            type="text"
            placeholder="Author..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="input-dreamy text-sm"
          />

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-dreamy text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn-secondary text-sm flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showAdvancedFilters ? 'Hide' : 'More'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-beige-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Tags (comma separated)..."
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="input-dreamy text-sm"
              />

              <input
                type="text"
                placeholder="Search in content..."
                value={filters.content}
                onChange={(e) => handleFilterChange('content', e.target.value)}
                className="input-dreamy text-sm"
              />

              <div className="flex space-x-2">
                <input
                  type="date"
                  placeholder="From date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                />
                <input
                  type="date"
                  placeholder="To date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                >
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="category">Category</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="input-dreamy text-sm flex-1"
                >
                  <option value="DESC">↓ Desc</option>
                  <option value="ASC">↑ Asc</option>
                </select>
              </div>
            </div>

            {/* Popular Tags */}
            {stats.popularTags && stats.popularTags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-beige-600 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-1">
                  {stats.popularTags.slice(0, 10).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('tags', tag)}
                      className="px-2 py-1 bg-beige-100 hover:bg-beige-200 text-beige-700 text-xs rounded transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-beige-600">
            {stats.total !== undefined ? `${stats.total} poems found` : ''}
          </div>
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Poetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosegold-500 mx-auto"></div>
          </div>
        ) : poems.length === 0 ? (
          <div className="col-span-full card-dreamy p-8 text-center">
            <PenTool className="w-12 h-12 text-beige-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-beige-600 mb-2">No poems yet</h3>
            <p className="text-beige-500">Share your first poem to get started</p>
          </div>
        ) : (
          poems.map((poem) => (
            <div key={poem.id} className="card-dreamy p-6 group hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold text-beige-900 mb-1">
                    {poem.title}
                  </h3>
                  <p className="text-sm text-beige-600 mb-2">by {poem.author}</p>
                  {poem.category && (
                    <span className="inline-block px-2 py-1 bg-rosegold-100 text-rosegold-700 text-xs rounded-full">
                      {poem.category}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {poem.filePath && (
                    <button
                      onClick={() => handleDownload(poem)}
                      className="p-2 text-beige-400 hover:text-blue-600 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(poem)}
                    className="p-2 text-beige-400 hover:text-beige-600 transition-colors"
                    title="Edit poem"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(poem.id)}
                    className="p-2 text-beige-400 hover:text-red-500 transition-colors"
                    title="Delete poem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {poem.content && (
                <div className="mb-4">
                  <p className="text-sm text-beige-700 line-clamp-4">
                    {poem.content}
                  </p>
                </div>
              )}

              {poem.filePath && (
                <div className="flex items-center space-x-2 mb-4 p-2 bg-beige-50 rounded-lg">
                  <FileText className="w-4 h-4 text-beige-500" />
                  <span className="text-xs text-beige-600 truncate">{poem.fileName}</span>
                </div>
              )}

              {poem.tags && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {poem.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-beige-100 text-beige-600 text-xs rounded"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center text-xs text-beige-400 pt-2 border-t border-beige-100">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>by {poem.user?.username}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-dreamy w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-beige-900 mb-4">
              {editingPoem ? 'Edit Poem' : 'Add New Poem'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-dreamy"
                    placeholder="Enter poem title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input-dreamy"
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-dreamy"
                    placeholder="e.g., Love, Nature, Life"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input-dreamy"
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-dreamy h-32 resize-none"
                  placeholder="Enter poem content or upload a file"
                />
              </div>

              {!editingPoem && (
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Upload File (PDF or Word)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileInput"
                    />
                    <label
                      htmlFor="fileInput"
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-beige-300 rounded-xl hover:border-rosegold-400 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-beige-400 mr-2" />
                      <span className="text-beige-600">
                        {selectedFile ? selectedFile.name : 'Choose file or drag here'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-beige-500 mt-1">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPoem(null);
                    setSelectedFile(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingPoem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Poetry;
