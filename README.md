# Hotel Booking System - Full Stack Web Application

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A modern hotel reservation platform with secure online payments, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## ✨ Key Features

### 👤 User Features
- **Secure authentication** (JWT + Bcrypt)
- **Advanced hotel search** with filters (location, price, amenities)
- **Real-time booking system** with date selection
- **Online payment** (Stripe/PayPal integration)
- **Booking management** (cancellations, history)
- **Review system** (post-stay ratings)

### 🏨 Admin Features
- **Dashboard** for hotel management
- **Room availability calendar**
- **Payment tracking system**
- **Hotel/room CRUD operations**

## 🛠️ Technical Stack

### Frontend
- React.js (Vite) with Hooks
- Tailwind CSS for styling
- React Router DOM for navigation
- Axios for API requests
- Stripe.js for payment processing

### Backend
- Node.js + Express.js (REST API)
- MongoDB (Mongoose ODM)
- JWT + Bcrypt for authentication
- Stripe API / PayPal SDK for payments
- Nodemailer/MailJS for email notifications

### Dev Tools
- Git + GitHub for version control
- Postman for API testing
- Trello for project management
- Draw.io for UML
-Figma for the design


## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hotel-booking.git
   cd hotel-booking
2. **Set up the backend**
cd server
npm install
cp .env.example .env
# Configure your environment variables
npm start

3. **Set up the frontend**
cd ../client
npm install
cp .env.example .env
# Configure your environment variables
npm run dev


## ⚙️ Environment Variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
MAILJS_SERVICE_ID=your_mailjs_service
MAILJS_TEMPLATE_ID=your_mailjs_template
MAILJS_USER_ID=your_mailjs_user




