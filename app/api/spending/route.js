import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';
import { ObjectId } from 'mongodb';

// GET all spending entries
export async function GET() {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = await getDb();
    const spending = await db
      .collection('spending')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(spending);
  } catch (error) {
    console.error('Error fetching spending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending' },
      { status: 500 }
    );
  }
}

// POST create spending entry
export async function POST(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { description, amount, category } = body;

    if (!description?.trim() || amount === undefined) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const spending = {
      description: description.trim(),
      amount: parseFloat(amount),
      category: category?.trim() || 'Other',
      createdAt: new Date(),
    };

    const result = await db.collection('spending').insertOne(spending);

    return NextResponse.json({
      ...spending,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating spending:', error);
    return NextResponse.json(
      { error: 'Failed to create spending' },
      { status: 500 }
    );
  }
}

// DELETE spending entry
export async function DELETE(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid spending ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('spending').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Spending entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spending:', error);
    return NextResponse.json(
      { error: 'Failed to delete spending' },
      { status: 500 }
    );
  }
}

// PUT update spending entry
export async function PUT(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { description, amount, category } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid spending ID' },
        { status: 400 }
      );
    }

    if (!description?.trim() || amount === undefined) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('spending').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          description: description.trim(),
          amount: parseFloat(amount),
          category: category?.trim() || 'Other',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Spending entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating spending:', error);
    return NextResponse.json(
      { error: 'Failed to update spending' },
      { status: 500 }
    );
  }
}
