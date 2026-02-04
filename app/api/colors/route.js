import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET all colors
export async function GET() {
  try {
    const db = await getDb();
    const colors = await db
      .collection('colors')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}

// POST create color
export async function POST(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { name, hex } = body;

    if (!name?.en || !hex) {
      return NextResponse.json(
        { error: 'Name (EN) and hex code are required' },
        { status: 400 }
      );
    }

    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hex)) {
      return NextResponse.json(
        { error: 'Invalid hex color format. Use #RRGGBB or #RGB' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if color with same hex already exists
    const existing = await db.collection('colors').findOne({ hex: hex.toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'A color with this hex code already exists' },
        { status: 400 }
      );
    }

    const color = {
      name: {
        en: name.en || '',
        fr: name.fr || '',
        ar: name.ar || '',
      },
      hex: hex.toUpperCase(),
      createdAt: new Date(),
    };

    const result = await db.collection('colors').insertOne(color);
    
    return NextResponse.json({
      ...color,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json(
      { error: 'Failed to create color' },
      { status: 500 }
    );
  }
}
