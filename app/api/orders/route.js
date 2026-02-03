import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET all orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = await getDb();
    
    const query = {};
    
    // Filter by status
    if (status && ['pending', 'paid', 'shipped', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
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
    const { items, total, customer } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.email) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
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
      })),
      total: parseFloat(total),
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
      },
      status: 'pending',
      createdAt: new Date(),
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
