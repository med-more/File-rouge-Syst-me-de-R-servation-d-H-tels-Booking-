const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');

// Sample data
const sampleUsers = [
  {
    name: 'Ahmed Alami',
    email: 'ahmed.alami@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '612345678',
    role: 'user'
  },
  {
    name: 'Fatima Zahra',
    email: 'fatima.zahra@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '623456789',
    role: 'user'
  },
  {
    name: 'Youssef Benali',
    email: 'youssef.benali@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '634567890',
    role: 'user'
  },
  {
    name: 'Aicha Mansouri',
    email: 'aicha.mansouri@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '645678901',
    role: 'user'
  },
  {
    name: 'Omar Tazi',
    email: 'omar.tazi@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '656789012',
    role: 'user'
  },
  {
    name: 'Khadija El Fassi',
    email: 'khadija.elfassi@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '667890123',
    role: 'user'
  },
  {
    name: 'Hassan Idrissi',
    email: 'hassan.idrissi@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '678901234',
    role: 'user'
  },
  {
    name: 'Zineb Alaoui',
    email: 'zineb.alaoui@email.com',
    password: 'password123',
    countryCode: '+212',
    phone: '689012345',
    role: 'user'
  },
  {
    name: 'Admin User',
    email: 'admin@hotelbooking.com',
    password: 'admin123',
    countryCode: '+212',
    phone: '600000000',
    role: 'admin'
  }
];

const sampleHotels = [
  {
    name: 'Hotel La Mamounia',
    location: 'Marrakech',
    description: 'Luxury hotel in the heart of Marrakech with traditional Moroccan architecture and modern amenities.',
    pricePerNight: 2500,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Room Service', 'Concierge'],
    capacity: 4,
    originalPrice: 3000
  },
  {
    name: 'Hotel Sofitel Rabat',
    location: 'Rabat',
    description: 'Modern business hotel in Rabat with excellent facilities for both business and leisure travelers.',
    pricePerNight: 1800,
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Business Center', 'Restaurant', 'Parking', 'Gym', 'Bar'],
    capacity: 2,
    originalPrice: 2200
  },
  {
    name: 'Hotel Kenzi Europa',
    location: 'Casablanca',
    description: 'Contemporary hotel in Casablanca with stunning views and premium services.',
    pricePerNight: 1200,
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking', 'Room Service'],
    capacity: 3,
    originalPrice: 1500
  },
  {
    name: 'Hotel Continental',
    location: 'Tangier',
    description: 'Historic hotel with Mediterranean views and authentic Moroccan hospitality.',
    pricePerNight: 900,
    rating: 4.1,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Bar'],
    capacity: 2,
    originalPrice: 1100
  },
  {
    name: 'Hotel Palais Jamai',
    location: 'Fez',
    description: 'Traditional palace converted into a luxury hotel with authentic Moroccan decor.',
    pricePerNight: 1600,
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking', 'Room Service', 'Concierge'],
    capacity: 4,
    originalPrice: 2000
  },
  {
    name: 'Hotel Atlas',
    location: 'Marrakech',
    description: 'Boutique hotel in Marrakech with modern amenities and traditional charm.',
    pricePerNight: 800,
    rating: 4.2,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking'],
    capacity: 2,
    originalPrice: 1000
  },
  {
    name: 'Hotel Riad Dar Karma',
    location: 'Marrakech',
    description: 'Authentic riad in the medina with beautiful courtyard and traditional architecture.',
    pricePerNight: 600,
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Restaurant', 'Concierge'],
    capacity: 2,
    originalPrice: 750
  },
  {
    name: 'Hotel Agadir Beach',
    location: 'Agadir',
    description: 'Beachfront hotel with stunning ocean views and resort-style amenities.',
    pricePerNight: 1400,
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Room Service', 'Gym'],
    capacity: 4,
    originalPrice: 1800
  },
  {
    name: 'Hotel Essaouira Plaza',
    location: 'Essaouira',
    description: 'Coastal hotel with modern facilities and easy access to the beach.',
    pricePerNight: 700,
    rating: 4.0,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Bar'],
    capacity: 3,
    originalPrice: 900
  },
  {
    name: 'Hotel Royal Mansour',
    location: 'Marrakech',
    description: 'Ultra-luxury hotel with private riads and world-class service.',
    pricePerNight: 5000,
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&q=80'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Room Service', 'Concierge', 'Business Center'],
    capacity: 6,
    originalPrice: 6000
  }
];

const roomTypes = [
  { type: 'single', name: 'Single Room', basePrice: 0.8, maxGuests: 1, description: 'Comfortable single room with basic amenities' },
  { type: 'double', name: 'Double Room', basePrice: 1.0, maxGuests: 2, description: 'Spacious double room with premium amenities' },
  { type: 'triple', name: 'Triple Room', basePrice: 1.2, maxGuests: 3, description: 'Perfect for small groups or families' },
  { type: 'suite', name: 'Suite', basePrice: 1.5, maxGuests: 4, description: 'Luxury suite with separate living area' },
  { type: 'family', name: 'Family Room', basePrice: 1.3, maxGuests: 5, description: 'Perfect for families with children' },
  { type: 'deluxe', name: 'Deluxe Room', basePrice: 1.4, maxGuests: 3, description: 'Business-friendly with work area' },
  { type: 'presidential', name: 'Presidential Suite', basePrice: 2.0, maxGuests: 6, description: 'Ultimate luxury with panoramic views' }
];

async function generateTestData() {
  try {
    console.log('🗑️ Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    
    console.log('✅ Data cleared successfully');

    console.log('👥 Creating users...');
    const users = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        countryCode: userData.countryCode,
        phone: userData.phone,
        role: userData.role,
        isEmailVerified: true,
        status: 'active'
      });
      
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${userData.name}`);
    }

    console.log('🏨 Creating hotels...');
    const hotels = [];
    
    for (const hotelData of sampleHotels) {
      const hotel = new Hotel({
        name: hotelData.name,
        location: hotelData.location,
        description: hotelData.description,
        pricePerNight: hotelData.pricePerNight,
        originalPrice: hotelData.originalPrice,
        rating: hotelData.rating,
        images: hotelData.images,
        amenities: hotelData.amenities,
        capacity: hotelData.capacity,
        availability: 'available',
        createdAt: new Date()
      });
      
      await hotel.save();
      hotels.push(hotel);
      console.log(`✅ Created hotel: ${hotelData.name}`);
    }

    console.log('🛏️ Creating rooms...');
    
    for (const hotel of hotels) {
      // Create 3-5 rooms per hotel
      const numberOfRooms = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numberOfRooms; i++) {
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const roomPrice = Math.round(hotel.pricePerNight * roomType.basePrice);
        
        const room = new Room({
          hotelId: hotel._id,
          type: roomType.type,
          name: roomType.name,
          description: roomType.description,
          pricePerNight: roomPrice,
          maxGuests: roomType.maxGuests,
          quantity: Math.floor(Math.random() * 5) + 2, // 2-6 rooms available
          amenities: ['wifi', 'tv', 'air_conditioning', 'minibar', 'safe', 'balcony'],
          images: hotel.images.slice(0, 2).map((url, index) => ({
            url: url,
            alt: `${roomType.name} image`,
            isPrimary: index === 0
          })),
          size: Math.floor(Math.random() * 30) + 20, // 20-50 square meters
          floor: Math.floor(Math.random() * 10) + 1, // 1-10 floor
          isAvailable: true,
          status: 'active'
        });
        
        await room.save();
        console.log(`✅ Created room: ${roomType.type} for ${hotel.name}`);
      }
    }

    console.log('📅 Creating sample bookings...');
    
    // Create some sample bookings
    const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'refunded'];
    
    for (let i = 0; i < 15; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomHotel = hotels[Math.floor(Math.random() * hotels.length)];
      const rooms = await Room.find({ hotelId: randomHotel._id });
      
      if (rooms.length === 0) continue;
      
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Generate random dates
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));
      
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);
      
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const subtotal = nights * randomRoom.pricePerNight;
      const taxes = subtotal * 0.12;
      const total = subtotal + taxes;
      
      // Generate unique booking number
      const bookingNumber = `BK${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const booking = new Booking({
        bookingNumber: bookingNumber,
        userId: randomUser._id,
        hotelId: randomHotel._id,
        roomId: randomRoom._id,
        checkIn: checkIn,
        checkOut: checkOut,
        numberOfNights: nights,
        guests: {
          adults: Math.floor(Math.random() * 4) + 1,
          children: Math.floor(Math.random() * 2),
          infants: Math.floor(Math.random() * 1)
        },
        pricePerNight: randomRoom.pricePerNight,
        totalPrice: subtotal,
        taxes: taxes,
        fees: 0,
        discount: 0,
        finalPrice: total,
        status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 4)],
        specialRequests: Math.random() > 0.7 ? 'Late check-in requested' : '',
        roomPreferences: Math.random() > 0.8 ? ['high_floor', 'non_smoking'] : [],
        cancellationPolicy: 'free_cancellation',
        source: 'website',
        emailSent: Math.random() > 0.5,
        smsSent: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      await booking.save();
      console.log(`✅ Created booking for ${randomUser.name} at ${randomHotel.name}`);
    }

    console.log('\n🎉 Test data generation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏨 Hotels: ${hotels.length}`);
    
    const totalRooms = await Room.countDocuments();
    console.log(`   🛏️ Rooms: ${totalRooms}`);
    
    const totalBookings = await Booking.countDocuments();
    console.log(`   📅 Bookings: ${totalBookings}`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('   Admin: admin@hotelbooking.com / admin123');
    console.log('   User: ahmed.alami@email.com / password123');
    console.log('   User: fatima.zahra@email.com / password123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
generateTestData();
