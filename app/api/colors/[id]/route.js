import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET single color
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid color ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const color = await db.collection('colors').findOne({
      _id: new ObjectId(id),
    });

    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json(
      { error: 'Failed to fetch color' },
      { status: 500 }
    );
  }
}

// PUT update color
export async function PUT(request, { params }) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, hex } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid color ID' },
        { status: 400 }
      );
    }

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

    // Check if color with same hex already exists for another color
    const existing = await db.collection('colors').findOne({
      hex: hex.toUpperCase(),
      _id: { $ne: new ObjectId(id) },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A color with this hex code already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('colors').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: {
            en: name.en || '',
            fr: name.fr || '',
            ar: name.ar || '',
          },
          hex: hex.toUpperCase(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json(
      { error: 'Failed to update color' },
      { status: 500 }
    );
  }
}

// DELETE color
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
        { error: 'Invalid color ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('colors').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { error: 'Failed to delete color' },
      { status: 500 }
    );
  }
}
