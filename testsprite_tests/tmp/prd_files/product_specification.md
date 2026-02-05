# Product Specification Document: Gamasa Properties

## 1. Project Overview
Gamasa Properties is a modern real estate web application designed to facilitate the buying, selling, and renting of properties in Gamasa city. The platform connects property owners with potential buyers and renters through a user-friendly interface backed by robust technology.

## 2. Core Features

### 2.1 Public User Features
- **Homepage**: Featured listings, search bar, and city highlights.
- **Property Search**: Advanced filtering by location, price, property type, and amenities.
- **Interactive Maps**: View property locations on a map (powered by Leaflet).
- **Property Details**: High-quality images, detailed descriptions, amenities list, and agent contact info.

### 2.2 Authenticated User Features
- **User Authentication**: Secure sign-up and login (Supabase Auth).
- **User Profile**: Manage personal details and contact information.
- **My Properties**: Property owners can list, list, and manage their properties.
- **Add Property**: A multi-step form to upload property details, photos, and location.
- **Favorites**: Save properties to a wishlist for later viewing.
- **Messages**: Internal messaging system to communicate with agents/owners.
- **Notifications**: Real-time updates on bookings, messages, and property status.
- **Bookings**: Manage rental bookings and reservations.

### 2.3 Admin Features
- **Dashboard**: Overview of platform statistics (users, listings, revenue).
- **User Management**: Manage user accounts and permissions.
- **Property Management**: Approve or reject property listings.

## 3. Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 19.
- **Styling**: Tailwind CSS (with semantic color system).
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage).
- **Maps**: Leaflet / React-Leaflet.
- **PWA**: Progressive Web App support for mobile-like experience.

## 4. User Flows
1.  **Guest Visitor**: Lands on home -> Searches for properties -> Filters results -> Views details -> Clicks "Contact" (prompted to login/register).
2.  **Property Owner**: Logs in -> Goes to "Add Property" -> Fills form & Uploads images -> Submits for review.
3.  **Renter/Buyer**: Logs in -> Browses listings -> Adds to Favorites -> Sends Message to Owner.

## 5. Deployment & Environment
- **Local Development**: Runs on `http://localhost:3000`.
- **Environment Variables**: Managed via `.env.local` (Supabase keys, API URLs).
