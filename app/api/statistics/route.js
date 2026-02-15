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
    
    // Get total orders count
    const totalOrders = await db.collection('orders').countDocuments();
    
    // Get total revenue (sum of all order totals)
    const revenueResult = await db.collection('orders').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await db.collection('orders').countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    // Get orders per day for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);
    
    const ordersPerDayResult = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]).toArray();
    
    // Fill in missing days with zero counts
    const ordersPerDay = [];
    const currentDate = new Date(fourteenDaysAgo);
    
    while (currentDate < tomorrow) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = ordersPerDayResult.find(item => item._id === dateStr);
      ordersPerDay.push({
        date: dateStr,
        count: found?.count || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get order status counts
    const statusCounts = await db.collection('orders').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    // Format status counts into object
    const ordersByStatus = {
      pending: 0,
      paid: 0,
      shipped: 0,
      cancelled: 0,
      confirmed: 0,
      retourned: 0,
    };
    statusCounts.forEach(item => {
      if (item._id && ordersByStatus.hasOwnProperty(item._id)) {
        ordersByStatus[item._id] = item.count;
      }
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      todayOrders,
      ordersPerDay,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
