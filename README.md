# HK Lux E-commerce Store

A modern, full-featured e-commerce platform built with Next.js 16, designed for selling clothing and accessories with multilingual support (English, French, Arabic).
 
## 🚀 Features

### Customer Features
- **Multilingual Support**: Browse the store in English, French, or Arabic with RTL support
- **Product Catalog**: Browse products by categories with featured products section
- **Product Details**: View product images, descriptions, sizes, colors, and pricing
- **Shopping Cart**: Add/remove items, adjust quantities, persistent cart storage
- **Direct Order**: Quick "Order Now" button for instant checkout
- **Checkout System**: Complete order form with Algerian wilaya/commune selection
- **Delivery Options**: Choose between home delivery (domicile) or stop desk with dynamic pricing based on wilaya
- **WhatsApp Integration**: Contact button for customer support
- **Meta Pixel Tracking**: Facebook/Instagram conversion tracking for marketing

### Admin Features
- **Dashboard**: Statistics overview with sales charts, revenue tracking, and top products
- **Order Management**: 
  - View, edit, and delete orders
  - Update order status (pending, paid, shipped, confirmed, cancelled, returned)
  - Manual order creation (marked as admin orders, excluded from Meta tracking)
  - Pagination with customizable items per page (20/30/40/50)
  - Filter by status
  - Refresh button for real-time updates
- **Product Management**:
  - Create, edit, and delete products
  - Multilingual product names and descriptions
  - Image uploads via Cloudinary
  - Multiple colors and sizes support
  - Sale pricing and stock management
  - Featured products selection
  - Active/inactive status
- **Category Management**: Create and manage product categories with multilingual names
- **Color Management**: Define colors with names (multilingual) and hex codes
- **Finance Tracking**: Track spending/costs separately from revenue
- **User Analytics**: Track user behavior (WhatsApp clicks, order now clicks, completed orders) by IP
- **Real-time Notifications**: Browser notifications with sound for new orders (Desktop/Android support)
- **Authentication**: Secure admin panel with NextAuth

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Libraries**: 
  - Material-UI (MUI) v7.3.7 for admin panel
  - Tailwind CSS v4 for customer-facing pages
- **Database**: MongoDB
- **Authentication**: NextAuth v4.24.13
- **Image Management**: Cloudinary
- **Analytics**: Meta Pixel (Facebook/Instagram)
- **Location Data**: algeria-wilayas package
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)
- Meta Pixel ID (optional, for tracking)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lux
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/lux
   # or MongoDB Atlas
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lux

   # NextAuth
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Meta Pixel (optional)
   NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Collections

The application uses the following MongoDB collections:
- `admins`: Admin user accounts
- `products`: Product catalog
- `categories`: Product categories
- `colors`: Available colors
- `orders`: Customer orders
- `spending`: Business expenses/costs
- `users`: User behavior tracking (by IP)

## 👤 Admin Setup

1. **Create the first admin account**
   Navigate to `/signup` (first time only) or use MongoDB to insert an admin:
   ```javascript
   {
     email: "admin@example.com",
     password: "bcrypt-hashed-password"
   }
   ```

2. **Access the admin panel**
   Navigate to `/admin` and login with your credentials

## 🌍 Localization

The site supports three languages:
- **English (en)** - Default
- **French (fr)**
- **Arabic (ar)** - Right-to-left (RTL) layout

Users can switch languages using the language selector in the header.

## 📦 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Deploy to Vercel
The easiest deployment option:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Don't forget to configure environment variables in your Vercel project settings.

## 🔔 Notifications System

The admin panel includes real-time order notifications:
- **Browser Notifications**: Desktop notifications for new orders
- **Sound Alerts**: Audio notification on new orders
- **Support**: Works on Desktop (Chrome, Firefox, Edge) and Android Chrome
- **Note**: iOS Safari does not support web notifications

## 💰 Delivery Pricing

Delivery prices are configured per wilaya with two options:
- **Domicile** (Home delivery)
- **Stop Desk** (Pickup point)

Prices range from 400 DA (Alger) to 2000 DA (remote areas).

## 📊 Analytics & Tracking

- **Meta Pixel**: Tracks ViewContent, AddToCart, InitiateCheckout, and Purchase events
- **User Tracking**: IP-based tracking of user interactions (WhatsApp, Order Now, Complete Order)
- **Admin Orders**: Orders created by admin are marked with `isAdminOrder: true` and excluded from Meta tracking

## 🔐 Security Features

- Password hashing with bcryptjs
- NextAuth session management
- Admin-only routes protection
- Environment variable security

## 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interfaces
- RTL layout support for Arabic

## 🤝 Contributing

This is a private e-commerce project. For questions or support, contact the development team.

## 📄 License

Private/Proprietary - All rights reserved.

## 🐛 Known Issues & Notes

- iOS devices do not support web notifications
- Admin orders bypass Meta Pixel tracking by design
- First-time setup requires manual admin account creation
- Image uploads require active Cloudinary account

## 📞 Support

For technical support or questions about the platform, contact the development team.

---

**Built with ❤️ using Next.js**
