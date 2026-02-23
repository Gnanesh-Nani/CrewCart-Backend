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

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=crewride

# JWT Authentication
JWT_SECRET_KEY=your_jwt_secret_key
REFRESH_SECRET_KEY=your_refresh_secret_key

# Token Expiration
JWT_EXPIRATION_TIME=15m
REFRESH_EXPIRATION_TIME=7d

# External Services
OSRM_URL=your_osrm_service_url
```

### Environment Variables Explanation

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment mode (development/production) |
| `PORT` | Server port number |
| `DB_HOST` | Database host address |
| `DB_PORT` | Database port number |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET_KEY` | Secret key for JWT access tokens |
| `REFRESH_SECRET_KEY` | Secret key for JWT refresh tokens |
| `JWT_EXPIRATION_TIME` | Access token expiration duration |
| `REFRESH_EXPIRATION_TIME` | Refresh token expiration duration |
| `OSRM_URL` | OSRM (Open Route Service Manager) API endpoint |

## Key Modules

### Auth Module
Handles user registration, login, and JWT token management.

### Ride Module
Core ride creation, updates, status management, and ride details.

### User Module
User profile management, preferences, and statistics.

### Social Module
Ride invitations, member management, and social interactions.

