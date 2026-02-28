import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET all orders
export async function GET(request) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    const db = await getDb();
    
    const query = {};
    
    // Filter by status
    if (status && ['pending', 'paid', 'shipped', 'cancelled', 'confirmed', 'retourned'].includes(status)) {
      query.status = status;
    }

    // Get total count for pagination
    const totalCount = await db.collection('orders').countDocuments(query);

    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create order
export async function POST(request) {
  try {
    const body = await request.json();
    const { items, subtotal, deliveryPrice, deliveryType, total, customer, isAdminOrder } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!customer?.name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!customer?.phone) {
      return NextResponse.json(
        { error: 'Customer phone is required' },
        { status: 400 }
      );
    }

    if (!customer?.wilaya || !customer?.commune) {
      return NextResponse.json(
        { error: 'Customer location (wilaya, commune) is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const order = {
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: parseFloat(item.price),
        qty: parseInt(item.qty),
        size: item.size || null,
        color: item.color || null,
      })),
      subtotal: parseFloat(subtotal || total),
      deliveryPrice: parseFloat(deliveryPrice || 0),
      deliveryType: deliveryType || 'domicile',
      total: parseFloat(total),
      customer: {
        name: customer.name,
        phone: customer.phone,
        wilaya: customer.wilaya,
        commune: customer.commune,
        ...(customer.address && { address: customer.address }),
      },
      status: 'pending',
      createdAt: new Date(),
      ...(isAdminOrder && { isAdminOrder: true }),  // Mark admin-created orders (won't count for Meta pixel)
    };

    const result = await db.collection('orders').insertOne(order);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
