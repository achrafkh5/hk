import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

// Format user object with readable dates and English names
async function formatUserDates(user, db) {
  // Process orderNowProducts to convert to English
  const processedProducts = [];
  if (user.orderNowProducts && user.orderNowProducts.length > 0) {
    for (const product of user.orderNowProducts) {
      let productName = product.productName;
      let colorName = product.color;
      
      try {
        // Fetch product details to get English name
        if (product.productId) {
          const productData = await db.collection('products').findOne({ 
            _id: ObjectId.isValid(product.productId) ? new ObjectId(product.productId) : product.productId 
          });
          if (productData) {
            productName = getEnglishName(productData.name);
          }
        }
        
        // Fetch color details to get English name
        if (product.color) {
          // Try to find color by ID first
          let colorData = null;
          if (ObjectId.isValid(product.color)) {
            colorData = await db.collection('colors').findOne({ 
              _id: new ObjectId(product.color)
            });
          }
          
          // If not found by ID, try to find by name (in any language)
          if (!colorData) {
            colorData = await db.collection('colors').findOne({ 
              $or: [
                { 'name.en': product.color },
                { 'name.fr': product.color },
                { 'name.ar': product.color }
              ]
            });
          }
          
          if (colorData) {
            colorName = getEnglishName(colorData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching product/color:', error);
      }
      
      processedProducts.push({
        ...product,
        productName,
        color: colorName,
        clickedAt: formatDate(product.clickedAt)
      });
    }
  }
  
  return {
    ...user,
    createdAt: formatDate(user.createdAt),
    lastActivity: formatDate(user.lastActivity),
    orderNowProducts: processedProducts
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
    let productClickEntry = null;
    if (clickType === 'order_now' && extraData) {
      // Fetch product and color from database to get English names
      let productName = getEnglishName(extraData.productName);
      let colorName = getEnglishName(extraData.color);
      
      try {
        // Fetch product from database
        if (extraData.productId) {
          const product = await db.collection('products').findOne({ 
            _id: ObjectId.isValid(extraData.productId) ? new ObjectId(extraData.productId) : extraData.productId 
          });
          if (product) {
            productName = getEnglishName(product.name);
          }
        }
        
        // Fetch color from database if colorId is provided
        if (extraData.color) {
          // Try to find color by ID first
          let color = null;
          if (ObjectId.isValid(extraData.color)) {
            color = await db.collection('colors').findOne({ 
              _id: new ObjectId(extraData.color)
            });
          }
          
          // If not found by ID, try to find by name (in any language)
          if (!color) {
            color = await db.collection('colors').findOne({ 
              $or: [
                { 'name.en': extraData.color },
                { 'name.fr': extraData.color },
                { 'name.ar': extraData.color }
              ]
            });
          }
          
          if (color) {
            colorName = getEnglishName(color.name);
          }
        }
      } catch (error) {
        console.error('Error fetching product/color details:', error);
        // Continue with the names we have
      }
      
      productClickEntry = {
        productId: extraData.productId,
        productName,
        price: extraData.price,
        color: colorName,
        size: extraData.size,
        clickedAt: new Date()
      };
    }

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
      const formattedUser = await formatUserDates(user, db);
      return NextResponse.json(formattedUser);
    } else {
      // Get all users
      const users = await usersCollection
        .find({})
        .sort({ lastActivity: -1 })
        .toArray();
      
      // Format all users with English names
      const formattedUsers = await Promise.all(
        users.map(user => formatUserDates(user, db))
      );
      
      return NextResponse.json(formattedUsers);
    }
  } catch (error) {
    console.error('Error fetching user clicks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user clicks' },
      { status: 500 }
    );
  }
}
