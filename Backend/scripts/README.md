# Test Data Generation Script

This script generates comprehensive test data for the hotel booking application, including users, hotels, rooms, and bookings.

## What it generates:

### 👥 Users (9 total)
- **1 Admin user**: `admin@hotelbooking.com` / `admin123`
- **8 Regular users** with Moroccan names and phone numbers

### 🏨 Hotels (10 total)
- Hotels in major Moroccan cities (Marrakech, Rabat, Casablanca, Tangier, Fez, Agadir, Essaouira)
- Different price ranges from budget to luxury (600-5000 MAD/night)
- Real images from Unsplash
- Complete amenities lists
- Ratings from 4.0 to 4.9

### 🛏️ Rooms (30-50 total)
- 3-5 rooms per hotel
- Different room types: Standard, Deluxe, Suite, Presidential Suite, Family Room, Executive Room
- Appropriate pricing based on hotel category
- Room amenities and descriptions

### 📅 Bookings (15 total)
- Sample bookings with different statuses
- Various dates and guest counts
- Different payment statuses

## How to run:

### Option 1: Using npm scripts (Recommended)
```bash
cd backend
npm run generate-data
```

### Option 2: Direct execution
```bash
cd backend
node scripts/generateTestData.js
```

## Important Notes:

⚠️ **This script will DELETE ALL existing data** before generating new test data.

✅ **All images are real** and sourced from Unsplash with proper URLs.

🔑 **Test accounts created:**
- Admin: `admin@hotelbooking.com` / `admin123`
- User: `ahmed.alami@email.com` / `password123`
- User: `fatima.zahra@email.com` / `password123`

## Sample Hotels Created:

1. **Hotel La Mamounia** (Marrakech) - 2500 MAD/night - Luxury
2. **Hotel Sofitel Rabat** (Rabat) - 1800 MAD/night - Business
3. **Hotel Kenzi Europa** (Casablanca) - 1200 MAD/night - Modern
4. **Hotel Continental** (Tangier) - 900 MAD/night - Historic
5. **Hotel Palais Jamai** (Fez) - 1600 MAD/night - Traditional
6. **Hotel Atlas** (Marrakech) - 800 MAD/night - Boutique
7. **Hotel Riad Dar Karma** (Marrakech) - 600 MAD/night - Authentic
8. **Hotel Agadir Beach** (Agadir) - 1400 MAD/night - Beachfront
9. **Hotel Essaouira Plaza** (Essaouira) - 700 MAD/night - Coastal
10. **Hotel Royal Mansour** (Marrakech) - 5000 MAD/night - Ultra-luxury

## Features:

- ✅ Realistic Moroccan hotel names and locations
- ✅ High-quality images from Unsplash
- ✅ Proper amenities for each hotel category
- ✅ Realistic pricing in Moroccan Dirhams
- ✅ Various room types and configurations
- ✅ Sample bookings with different statuses
- ✅ Admin and user accounts for testing
- ✅ Proper data relationships and references

## Troubleshooting:

If you encounter any issues:

1. Make sure MongoDB is running
2. Check your database connection string in `.env`
3. Ensure all required models are properly defined
4. Check that all dependencies are installed (`npm install`)

## Customization:

You can easily modify the script to:
- Add more hotels or users
- Change pricing ranges
- Modify amenities lists
- Add different room types
- Generate more bookings

Just edit the `sampleUsers`, `sampleHotels`, and `roomTypes` arrays in the script.
