import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const categoryId = searchParams.get('categoryId');
    const active = searchParams.get('active');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;

    const db = await getDb();
    
    const query = {};
    
    // Filter by featured (for client pages)
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    // Filter by active status
    if (active === 'true') {
      query.active = true;
    } else if (active === 'false') {
      query.active = false;
    }

    let cursor = db.collection('products').find(query).sort({ createdAt: -1 });
    
    if (limit) {
      cursor = cursor.limit(limit);
    }

    const products = await cursor.toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, categoryId, images, colors, hasSize, sizes, active } = body;

    if (!name?.en || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Name (EN), price, and stock are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const product = {
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
      stock: parseInt(stock),
      categoryId: categoryId || null,
      images: Array.isArray(images) ? images : [],
      colors: Array.isArray(colors) ? colors : [],
      hasSize: hasSize || false,
      sizes: hasSize && Array.isArray(sizes) ? sizes : [],
      active: active !== false,
      createdAt: new Date(),
    };

    const result = await db.collection('products').insertOne(product);
    
    return NextResponse.json({
      ...product,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
