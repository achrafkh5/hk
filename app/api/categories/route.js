import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET all categories
export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { name, slug, imageUrl } = body;

    if (!name?.en || !slug) {
      return NextResponse.json(
        { error: 'Name (EN) and slug are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if slug already exists
    const existing = await db.collection('categories').findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = {
      name: {
        en: name.en || '',
        fr: name.fr || '',
        ar: name.ar || '',
      },
      slug,
      imageUrl: imageUrl || '',
      createdAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(category);
    
    return NextResponse.json({
      ...category,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
