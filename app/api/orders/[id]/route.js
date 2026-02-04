import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

// GET single order
export async function GET(request, { params }) {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, customer, items, subtotal, deliveryPrice, deliveryType, total } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
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

    // Build update object
    const updateData = {
      updatedAt: new Date(),
    };

    // Update status if provided
    if (status) {
      const validStatuses = ['pending', 'paid', 'shipped', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
          { status: 400 }
        );
      }
      updateData.status = status;

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
    }

    // Update customer info if provided
    if (customer) {
      updateData.customer = customer;
    }

    // Update items if provided
    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'Order must have at least one item' },
          { status: 400 }
        );
      }
      updateData.items = items;
    }

    // Update pricing if provided
    if (typeof subtotal !== 'undefined') {
      updateData.subtotal = parseFloat(subtotal);
    }
    if (typeof deliveryPrice !== 'undefined') {
      updateData.deliveryPrice = parseFloat(deliveryPrice);
    }
    if (deliveryType) {
      updateData.deliveryType = deliveryType;
    }
    if (typeof total !== 'undefined') {
      updateData.total = parseFloat(total);
    }

    // Update order
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
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

// DELETE order
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
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if order exists
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(id),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete the order
    const result = await db.collection('orders').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
