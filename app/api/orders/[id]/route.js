import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

// GET single order
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(id),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get current order to check if stock should be reduced
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(id),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Reduce stock if changing to 'paid' or 'shipped' and order wasn't already paid/shipped
    const shouldReduceStock = 
      (status === 'paid' || status === 'shipped') && 
      (order.status !== 'paid' && order.status !== 'shipped');

    if (shouldReduceStock && order.items && order.items.length > 0) {
      // Reduce stock for each item
      for (const item of order.items) {
        const product = await db.collection('products').findOne({
          _id: new ObjectId(item.productId),
        });

        if (product) {
          if (product.hasSize && item.size) {
            // Product has sizes - update specific size stock
            const sizeIndex = product.sizes.findIndex(s => s.name === item.size);
            if (sizeIndex !== -1) {
              const newStock = Math.max(0, (product.sizes[sizeIndex].stock || 0) - item.qty);
              await db.collection('products').updateOne(
                { _id: new ObjectId(item.productId) },
                { $set: { [`sizes.${sizeIndex}.stock`]: newStock } }
              );
            }
          } else {
            // Regular product - update main stock
            const newStock = Math.max(0, (product.stock || 0) - item.qty);
            await db.collection('products').updateOne(
              { _id: new ObjectId(item.productId) },
              { $set: { stock: newStock } }
            );
          }
        }
      }
    }

    // Update order status
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
