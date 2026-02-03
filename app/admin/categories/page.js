'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper to generate slug from text
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    nameFr: '',
    nameAr: '',
    slug: '',
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(category = null) {
    if (category) {
      // Edit mode
      setSelectedCategory(category);
      setFormData({
        nameEn: category.name?.en || '',
        nameFr: category.name?.fr || '',
        nameAr: category.name?.ar || '',
        slug: category.slug || '',
        imageUrl: category.imageUrl || '',
      });
    } else {
      // Create mode
      setSelectedCategory(null);
      setFormData({
        nameEn: '',
        nameFr: '',
        nameAr: '',
        slug: '',
        imageUrl: '',
      });
    }
    setError('');
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedCategory(null);
    setError('');
  }

  function handleInputChange(field, value) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from EN name
      if (field === 'nameEn') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'categories');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        handleInputChange('imageUrl', data.url);
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

  async function handleSave() {
    if (!formData.nameEn.trim()) {
      setError('Name (EN) is required');
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
      slug: formData.slug || generateSlug(formData.nameEn),
      imageUrl: formData.imageUrl || '',
    };

    try {
      let res;
      if (selectedCategory) {
        // Update
        res = await fetch(`/api/categories/${selectedCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        handleCloseDialog();
        fetchCategories();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save category');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  function handleOpenDeleteDialog(category) {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  }

  async function handleDelete() {
    if (!selectedCategory) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        handleCloseDeleteDialog();
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
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
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          fullWidth={{ xs: true, sm: false }}
        >
          Add category
        </Button>
      </Box>

      {/* Categories Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No categories found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {category.imageUrl ? (
                      <Box
                        component="img"
                        src={category.imageUrl}
                        alt={category.name?.en || 'Category'}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 1,
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No img
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{category.name?.en || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                    >
                      {category.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(category.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(category)}
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
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
            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              fullWidth
              helperText="Auto-generated from English name"
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Category Image
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.imageUrl && (
                  <Box
                    component="img"
                    src={formData.imageUrl}
                    alt="Preview"
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                )}
              </Stack>
              {formData.imageUrl && (
                <TextField
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  helperText="Or paste image URL directly"
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
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
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedCategory?.name?.en}&rdquo;?
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
    </Box>
  );
}
