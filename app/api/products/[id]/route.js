import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, salePrice, buyingPrice, stock, categoryId, images, colors, hasSize, sizes, active, featured } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    if (!name?.en || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Name (EN), price, and stock are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: {
            en: name.en || '',
            fr: name.fr || '',
            ar: name.ar || '',
          },
          description: {
            en: description?.en || '',
            fr: description?.fr || '',
            ar: description?.ar || '',
          },
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          buyingPrice: parseFloat(buyingPrice) || 0,
          stock: parseInt(stock),
          categoryId: categoryId || null,
          images: Array.isArray(images) ? images : [],
          colors: Array.isArray(colors) ? colors : [],
          hasSize: hasSize || false,
          sizes: hasSize && Array.isArray(sizes) ? sizes : [],
          active: active !== false,
          featured: featured || false,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // First, get the product to retrieve its images
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete all product images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          // Handle both old format (string) and new format (object with url)
          const imageUrl = typeof image === 'string' ? image : image.url;
          
          if (imageUrl) {
            // Extract public_id from Cloudinary URL
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension

            // Call delete endpoint
            await fetch(`${request.nextUrl.origin}/api/upload/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                url: imageUrl,
                publicId: publicId,
                resourceType: 'image'
              }),
            });
          }
        } catch (err) {
          console.error('Error deleting image:', err);
          // Continue even if image deletion fails
        }
      }
    }

    // Delete the product from database
    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
