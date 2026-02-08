'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format price
function formatPrice(price) {
  return `${parseFloat(price).toFixed(2)} DA`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageColorDialogOpen, setImageColorDialogOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Color form state
  const [colorForm, setColorForm] = useState({
    nameEn: '',
    nameFr: '',
    nameAr: '',
    hex: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    nameFr: '',
    nameAr: '',
    descriptionEn: '',
    descriptionFr: '',
    descriptionAr: '',
    price: '',
    stock: '',
    categoryId: '',
    images: [],
    colors: [],
    hasSize: false,
    sizes: [],
    active: true,
    featured: false,
  });
  const [uploading, setUploading] = useState(false);

  // Fetch products, categories and colors on mount
  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterStatus]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function fetchColors() {
    try {
      const res = await fetch('/api/colors');
      if (res.ok) {
        const data = await res.json();
        setColors(data);
      }
    } catch (err) {
      console.error('Error fetching colors:', err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      let url = '/api/products?';
      
      if (filterCategory) {
        url += `categoryId=${filterCategory}&`;
      }
      
      if (filterStatus !== '') {
        url += `active=${filterStatus}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  function getCategoryName(categoryId) {
    const category = categories.find(c => c._id === categoryId);
    return category?.name?.en || '-';
  }

  function handleOpenDialog(product = null) {
    if (product) {
      // Edit mode
      setSelectedProduct(product);
      setFormData({
        nameEn: product.name?.en || '',
        nameFr: product.name?.fr || '',
        nameAr: product.name?.ar || '',
        descriptionEn: product.description?.en || '',
        descriptionFr: product.description?.fr || '',
        descriptionAr: product.description?.ar || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.categoryId || '',
        images: product.images || [],
        colors: product.colors || [],
        hasSize: product.hasSize || false,
        sizes: product.sizes || [],
        active: product.active !== false,
        featured: product.featured || false,
      });
    } else {
      // Create mode
      setSelectedProduct(null);
      setFormData({
        nameEn: '',
        nameFr: '',
        nameAr: '',
        descriptionEn: '',
        descriptionFr: '',
        descriptionAr: '',
        price: '',
        stock: '',
        categoryId: '',
        images: [],
        colors: [],
        hasSize: false,
        sizes: [],
        active: true,
        featured: false,
      });
    }
    setError('');
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedProduct(null);
    setError('');
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Open dialog to optionally link color
        setPendingImageUrl(data.url);
        setImageColorDialogOpen(true);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function handleSaveImageWithColor(colorId = null) {
    if (!pendingImageUrl) return;
    
    setFormData(prev => {
      const currentImages = prev.images || [];
      const newImage = colorId ? { url: pendingImageUrl, colorId } : { url: pendingImageUrl };
      const newImages = [...currentImages, newImage];
      return { ...prev, images: newImages };
    });
    
    setPendingImageUrl('');
    setImageColorDialogOpen(false);
  }

  function handleRemoveImage(index) {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  }

  function handleMoveImage(index, direction) {
    const newImages = [...formData.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    handleInputChange('images', newImages);
  }

  async function handleSave() {
    if (!formData.nameEn.trim()) {
      setError('Name (EN) is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Valid price is required');
      return;
    }

    // Only validate stock if hasSize is false
    if (!formData.hasSize && (!formData.stock || parseInt(formData.stock) < 0)) {
      setError('Valid stock is required');
      return;
    }

    // Validate sizes if hasSize is true
    if (formData.hasSize && (!formData.sizes || formData.sizes.length === 0)) {
      setError('Please add at least one size');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: {
        en: formData.nameEn.trim(),
        fr: formData.nameFr.trim(),
        ar: formData.nameAr.trim(),
      },
      description: {
        en: formData.descriptionEn.trim(),
        fr: formData.descriptionFr.trim(),
        ar: formData.descriptionAr.trim(),
      },
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: formData.categoryId || null,
      images: Array.isArray(formData.images) ? formData.images : [],
      colors: Array.isArray(formData.colors) ? formData.colors : [],
      hasSize: formData.hasSize,
      sizes: formData.hasSize ? formData.sizes : [],
      active: formData.active,
      featured: formData.featured,
    };

    console.log('Saving product with images:', payload.images);

    try {
      let res;
      if (selectedProduct) {
        // Update
        res = await fetch(`/api/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        handleCloseDialog();
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  function handleOpenDeleteDialog(product) {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  }

  async function handleDelete() {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        handleCloseDeleteDialog();
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setSaving(false);
    }
  }

  // Color dialog handlers
  function handleOpenColorDialog() {
    setColorForm({
      nameEn: '',
      nameFr: '',
      nameAr: '',
      hex: '',
    });
    setColorDialogOpen(true);
  }

  function handleCloseColorDialog() {
    setColorDialogOpen(false);
    setColorForm({
      nameEn: '',
      nameFr: '',
      nameAr: '',
      hex: '',
    });
    setError('');
  }

  async function handleSaveColor() {
    if (!colorForm.nameEn.trim() || !colorForm.hex.trim()) {
      setError('Color name (EN) and hex code are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: {
            en: colorForm.nameEn.trim(),
            fr: colorForm.nameFr.trim(),
            ar: colorForm.nameAr.trim(),
          },
          hex: colorForm.hex.trim(),
        }),
      });

      if (res.ok) {
        handleCloseColorDialog();
        await fetchColors();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create color');
      }
    } catch (err) {
      console.error('Error creating color:', err);
      setError('Failed to create color');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <Typography variant="h5">Products</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          fullWidth={{ xs: true, sm: false }}
        >
          Add product
        </Button>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name?.en || 'Unnamed'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Products Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Colors</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <Box
                        component="img"
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                        alt={product.name?.en || 'Product'}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No img
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{product.name?.en || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getCategoryName(product.categoryId)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {product.hasSize && product.sizes?.length > 0 ? (
                      <Box>
                        <Typography variant="body2">
                          {product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({product.sizes.length} sizes)
                        </Typography>
                      </Box>
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {product.colors?.map((colorId, index) => {
                        const color = colors.find(c => c._id === colorId);
                        if (!color) return null;
                        return (
                          <Box
                            key={index}
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: color.hex,
                              border: '1px solid',
                              borderColor: color.hex === '#FFFFFF' ? 'grey.400' : 'grey.300',
                            }}
                            title={color.name?.en || 'Unnamed'}
                          />
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={product.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(product)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(product)}
                      title="Delete"
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            {/* Name Fields */}
            <Typography variant="subtitle2" color="text.secondary">
              Product Name
            </Typography>
            <TextField
              label="Name (EN)"
              value={formData.nameEn}
              onChange={(e) => handleInputChange('nameEn', e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Name (FR)"
              value={formData.nameFr}
              onChange={(e) => handleInputChange('nameFr', e.target.value)}
              fullWidth
            />
            <TextField
              label="Name (AR)"
              value={formData.nameAr}
              onChange={(e) => handleInputChange('nameAr', e.target.value)}
              fullWidth
              dir="rtl"
            />

            {/* Description Fields */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Description
            </Typography>
            <TextField
              label="Description (EN)"
              value={formData.descriptionEn}
              onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Description (FR)"
              value={formData.descriptionFr}
              onChange={(e) => handleInputChange('descriptionFr', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Description (AR)"
              value={formData.descriptionAr}
              onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
              fullWidth
              multiline
              rows={3}
              dir="rtl"
            />

            {/* Product Details */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Details
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                fullWidth
                required
                slotProps={{
                  htmlInput: { min: 0, step: 0.01 },
                }}
              />
              {!formData.hasSize && (
                <TextField
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: { min: 0, step: 1 },
                  }}
                />
              )}
            </Stack>

            {/* Size Management */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasSize}
                    onChange={(e) => {
                      const hasSize = e.target.checked;
                      handleInputChange('hasSize', hasSize);
                      if (!hasSize) {
                        handleInputChange('sizes', []);
                      }
                    }}
                  />
                }
                label="Product has sizes"
              />
            </Box>

            {formData.hasSize && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Sizes & Stock
                </Typography>
                <Stack spacing={1.5}>
                  {formData.sizes.map((size, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Size name"
                        size="small"
                        value={size.name || ''}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[index].name = e.target.value;
                          handleInputChange('sizes', newSizes);
                        }}
                        sx={{ flex: 1 }}
                        placeholder="e.g., S, M, L, XL"
                      />
                      <TextField
                        label="Stock"
                        size="small"
                        type="number"
                        value={size.stock || 0}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[index].stock = parseInt(e.target.value) || 0;
                          handleInputChange('sizes', newSizes);
                        }}
                        slotProps={{
                          htmlInput: { min: 0, step: 1 },
                        }}
                        sx={{ width: 120 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          const newSizes = formData.sizes.filter((_, i) => i !== index);
                          handleInputChange('sizes', newSizes);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      handleInputChange('sizes', [...formData.sizes, { name: '', stock: 0 }]);
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Add Size
                  </Button>
                </Stack>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category"
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name?.en || 'Unnamed'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Product Images {formData.images?.length > 0 && `(${formData.images.length})`}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                First image will be the cover image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                {uploading ? 'Uploading...' : 'Add Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              
              {formData.images?.length > 0 && (
                <Stack spacing={1.5}>
                  {formData.images.map((item, index) => {
                    const url = typeof item === 'string' ? item : item.url;
                    const colorId = typeof item === 'object' ? item.colorId : null;
                    const linkedColor = colorId ? colors.find(c => c._id === colorId) : null;
                    
                    return (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          bgcolor: index === 0 ? 'primary.50' : 'transparent',
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt={`Product ${index + 1}`}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        />
                        <Stack spacing={0.5} flex={1}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {index === 0 && (
                              <Chip label="Cover" size="small" color="primary" />
                            )}
                            {linkedColor && (
                              <Chip 
                                label={linkedColor.name?.en || 'Color'}
                                size="small"
                                sx={{
                                  bgcolor: linkedColor.hex,
                                  color: linkedColor.hex === '#FFFFFF' || linkedColor.hex.toLowerCase() === '#fff' ? '#000' : '#fff',
                                  border: linkedColor.hex === '#FFFFFF' || linkedColor.hex.toLowerCase() === '#fff' ? '1px solid #ddd' : 'none',
                                }}
                              />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Image {index + 1}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveImage(index, 'up')}
                            disabled={index === 0}
                          >
                            ▲
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveImage(index, 'down')}
                            disabled={index === formData.images.length - 1}
                          >
                            ▼
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Colors Selection */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Available Colors
                </Typography>
                <Button
                  size="small"
                  onClick={handleOpenColorDialog}
                  variant="outlined"
                >
                  + Add Color
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colors.map((color) => {
                  const isSelected = formData.colors?.includes(color._id);
                  return (
                    <Box
                      key={color._id}
                      onClick={() => {
                        const currentColors = formData.colors || [];
                        const newColors = isSelected
                          ? currentColors.filter(c => c !== color._id)
                          : [...currentColors, color._id];
                        handleInputChange('colors', newColors);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.50' : 'transparent',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: color.hex,
                          border: '1px solid',
                          borderColor: color.hex === '#FFFFFF' ? 'grey.300' : 'transparent',
                        }}
                      />
                      <Typography variant="body2">{color.name?.en || 'Unnamed'}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                />
              }
              label="Active"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
              }
              label="Featured"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedProduct?.name?.en}&rdquo;?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Color Dialog */}
      <Dialog
        open={colorDialogOpen}
        onClose={handleCloseColorDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Color</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <TextField
              label="Color Name (English)"
              value={colorForm.nameEn}
              onChange={(e) => setColorForm({ ...colorForm, nameEn: e.target.value })}
              fullWidth
              required
              helperText="Required"
            />

            <TextField
              label="Color Name (French)"
              value={colorForm.nameFr}
              onChange={(e) => setColorForm({ ...colorForm, nameFr: e.target.value })}
              fullWidth
            />

            <TextField
              label="Color Name (Arabic)"
              value={colorForm.nameAr}
              onChange={(e) => setColorForm({ ...colorForm, nameAr: e.target.value })}
              fullWidth
            />

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                label="Hex Code"
                value={colorForm.hex}
                onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                placeholder="#000000"
                fullWidth
                required
                helperText="Format: #RRGGBB or #RGB"
              />
              {colorForm.hex && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorForm.hex) && (
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    bgcolor: colorForm.hex,
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                />
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseColorDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveColor}
            disabled={saving || !colorForm.nameEn.trim() || !colorForm.hex.trim()}
          >
            {saving ? 'Adding...' : 'Add Color'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Image to Color Dialog */}
      <Dialog
        open={imageColorDialogOpen}
        onClose={() => {
          setImageColorDialogOpen(false);
          setPendingImageUrl('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Link Image to Color (Optional)</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You can optionally link this image to a specific color. When customers select that color, this image will be displayed.
            </Typography>

            {pendingImageUrl && (
              <Box
                component="img"
                src={pendingImageUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              />
            )}

            <Typography variant="subtitle2">
              Select a color to link (or skip to add without color):
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colors.map((color) => (
                <Box
                  key={color._id}
                  onClick={() => handleSaveImageWithColor(color._id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: color.hex,
                      border: '1px solid',
                      borderColor: color.hex === '#FFFFFF' ? 'grey.300' : 'transparent',
                    }}
                  />
                  <Typography variant="body2">{color.name?.en || 'Unnamed'}</Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => handleSaveImageWithColor(null)}>
            Skip - Add Without Color
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
