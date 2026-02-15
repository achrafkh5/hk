import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET() {
  // Check admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = await getDb();
    
    // Valid statuses for finance calculations
    const validStatuses = ['confirmed', 'paid', 'shipped'];

    // Get total revenue from valid orders only (subtotal only, no delivery)
    const revenueResult = await db.collection('orders').aggregate([
      {
        $match: { status: { $in: validStatuses } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$subtotal' },
        },
      },
    ]).toArray();
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get revenue by status (subtotal only) - only valid statuses
    const revenueByStatus = await db.collection('orders').aggregate([
      {
        $match: { status: { $in: validStatuses } }
      },
      {
        $group: {
          _id: '$status',
          subtotal: { $sum: '$subtotal' },
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    // Calculate product cost from sold items - only valid orders
    const orders = await db.collection('orders').find({ 
      status: { $in: validStatuses } 
    }).toArray();
    
    // Get all products to lookup buying prices
    const products = await db.collection('products').find({}).toArray();
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // Calculate total product cost based on sold items
    let totalProductCost = 0;
    
    orders.forEach(order => {
      const orderProductCost = order.items?.reduce((sum, item) => {
        const product = productMap[item.productId];
        const buyingPrice = product?.buyingPrice || 0;
        return sum + (buyingPrice * (item.qty || 1));
      }, 0) || 0;
      
      totalProductCost += orderProductCost;
    });

    // Get total external spending
    const spendingResult = await db.collection('spending').aggregate([
      {
        $group: {
          _id: null,
          totalSpending: { $sum: '$amount' },
        },
      },
    ]).toArray();
    const totalExternalSpending = spendingResult[0]?.totalSpending || 0;

    // Get spending by category
    const spendingByCategory = await db.collection('spending').aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]).toArray();

    // Calculate totals (all based on confirmed/paid/shipped orders only)
    const totalSpent = totalProductCost + totalExternalSpending;
    const totalGain = totalRevenue - totalSpent;

    return NextResponse.json({
      // Revenue (from confirmed/paid/shipped orders only)
      totalRevenue,
      revenueByStatus: revenueByStatus.map(s => ({
        status: s._id,
        subtotal: s.subtotal,
        count: s.count,
      })),
      
      // Costs
      totalProductCost,
      totalExternalSpending,
      spendingByCategory: spendingByCategory.map(s => ({
        category: s._id || 'Other',
        total: s.total,
        count: s.count,
      })),
      
      // Summary
      totalSpent,
      totalGain,
    });
  } catch (error) {
    console.error('Error fetching finance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 }
    );
  }
}
