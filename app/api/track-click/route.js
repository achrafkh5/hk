import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Helper function to format dates (Algerian time - GMT+1)
function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Algiers'
  });
}

// Helper function to get English product name
function getEnglishName(name) {
  if (!name) return '-';
  if (typeof name === 'string') return name;
  return name.en || name.fr || name.ar || '-';
}

// Format user object with readable dates
function formatUserDates(user) {
  return {
    ...user,
    createdAt: formatDate(user.createdAt),
    lastActivity: formatDate(user.lastActivity),
    orderNowProducts: user.orderNowProducts?.map(product => ({
      ...product,
      clickedAt: formatDate(product.clickedAt)
    })) || []
  };
}

// POST - Track user click
export async function POST(request) {
  try {
    const body = await request.json();
    const { clickType, extraData } = body;

    // Validate click type
    const validTypes = ['whatsapp_contact', 'order_now', 'complete_order'];
    if (!clickType || !validTypes.includes(clickType)) {
      return NextResponse.json(
        { error: 'Invalid click type' },
        { status: 400 }
      );
    }

    // Get user IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Find existing user by IP
    const existingUser = await usersCollection.findOne({ ip });

    // Prepare product click history entry for order_now
    const productClickEntry = clickType === 'order_now' && extraData ? {
      productId: extraData.productId,
      productName: getEnglishName(extraData.productName),
      price: extraData.price,
      color: getEnglishName(extraData.color),
      size: extraData.size,
      clickedAt: new Date()
    } : null;

    if (existingUser) {
      // Update existing user - increment the click count for this type
      const updateField = `clicks.${clickType}`;
      const updateOps = { 
        $inc: { [updateField]: 1 },
        $set: { lastActivity: new Date() }
      };
      
      // Add product to order_now history if applicable
      if (productClickEntry) {
        updateOps.$push = { orderNowProducts: productClickEntry };
      }
      
      await usersCollection.updateOne(
        { ip },
        updateOps
      );

      // Get updated user data
      const updatedUser = await usersCollection.findOne({ ip });
      
      return NextResponse.json({
        success: true,
        ip,
        clickType,
        clickCount: updatedUser.clicks[clickType],
        message: 'Click tracked successfully'
      });
    } else {
      // Create new user record
      const newUser = {
        ip,
        clicks: {
          whatsapp_contact: clickType === 'whatsapp_contact' ? 1 : 0,
          order_now: clickType === 'order_now' ? 1 : 0,
          complete_order: clickType === 'complete_order' ? 1 : 0
        },
        orderNowProducts: productClickEntry ? [productClickEntry] : [],
        createdAt: new Date(),
        lastActivity: new Date()
      };

      await usersCollection.insertOne(newUser);

      return NextResponse.json({
        success: true,
        ip,
        clickType,
        clickCount: 1,
        message: 'New user tracked successfully'
      });
    }
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

// GET - Get user click stats (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    const db = await getDb();
    const usersCollection = db.collection('users');

    if (ip) {
      // Get specific user by IP
      const user = await usersCollection.findOne({ ip });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(formatUserDates(user));
    } else {
      // Get all users
      const users = await usersCollection
        .find({})
        .sort({ lastActivity: -1 })
        .toArray();
      return NextResponse.json(users.map(formatUserDates));
    }
  } catch (error) {
    console.error('Error fetching user clicks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user clicks' },
      { status: 500 }
    );
  }
}
