# CrewRide Backend API

A NestJS-based REST API backend for the CrewRide ride-sharing application. Handles user authentication, ride management, waypoint management, and real-time ride operations.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL / MongoDB
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer

## Features

- 🔐 **User Authentication** - JWT-based authentication and authorization
- 🚗 **Ride Management** - Create, update, and manage rides
- 📍 **Waypoint System** - Define and manage ride waypoints
- 👥 **Social Features** - Ride invitations and member management
- 🗺️ **Route Calculation** - OSRM integration for route optimization
- 📊 **Ride Statistics** - Track ride history and user stats

## Project Structure

```
src/
├── auth/           # Authentication module
├── ride/           # Ride management module
├── user/           # User management module
├── social/         # Social features module
├── common/         # Shared utilities, guards, decorators
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
OSRM_URL=your_osrm_service_url
```

## Key Modules

### Auth Module
Handles user registration, login, and JWT token management.

### Ride Module
Core ride creation, updates, status management, and ride details.

### User Module
User profile management, preferences, and statistics.

### Social Module
Ride invitations, member management, and social interactions.

