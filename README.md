# LiftNShift — Home Relocation Service

> A full-stack home shifting and relocation booking platform built with Spring Boot and React.

LiftNShift lets users book home relocation appointments, manage furniture and appliance items, track booking status in real time, and get transparent pricing — all from a clean, modern interface.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Authors](#authors)

---

## Overview

LiftNShift is a REST API-backed web application where users can:

- Register and log in securely using JWT authentication
- Create home shifting bookings with pickup and drop addresses
- Add items from a predefined catalog (sofa, bed, fridge, etc.) or enter custom items
- Track booking status through the full lifecycle: `PENDING → CONFIRMED → IN_PROGRESS → COMPLETED`
- View itemised pricing calculated automatically based on item type and size

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 4.0.3 | Application framework |
| Spring Security | 7.x | Authentication & authorisation |
| Spring Data JPA | — | ORM / database layer |
| MySQL | 8.x | Primary database |
| jjwt | 0.11.5 | JWT token generation & validation |
| springdoc-openapi | 2.8.5 | Swagger UI / API docs |
| Lombok | 1.18.30 | Boilerplate reduction |
| Maven | — | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Redux Toolkit | — | Global state management |
| React Router DOM | 6.x | Client-side routing |
| Axios | — | HTTP client |

---

## Features

### Authentication
- User registration with name, email, phone, and password
- JWT-based login — token stored in localStorage, attached to every request via Axios interceptor
- Protected routes on the frontend — unauthenticated users are redirected to login
- Auto logout on 401 response

### Bookings
- Create a booking with pickup and drop addresses
- View all personal bookings with status tracking
- Delete bookings
- Update booking status (`PENDING → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED`)
- Guard: completed or cancelled bookings cannot be modified

### Items
- Browse the predefined item catalog (`GET /api/predefined-items`)
- Add items to a booking with quantity and size (`SMALL / MEDIUM / LARGE`)
- Add custom items with a name and manual price calculation
- Update item quantity or delete items from a booking
- Booking total amount recalculates automatically when items change

### Frontend Pages
- **Landing / Splash** — animated intro video with skip button, transitions into Login
- **Login & Register** — split-screen design with video background panel
- **Dashboard** — personal greeting, live booking stats, how-it-works section, features, CTA
- **My Bookings** — ecommerce-style order list with filter pills and reveal glow cards
- **Booking Detail** *(in progress)* — full item list, status controls
- **Create Booking** *(in progress)* — address form with item selection

---

## Project Structure

```
liftnshift/
│
├── backend/                          # Spring Boot project
│   └── src/main/java/com/shifting/
│       ├── config/
│       │   ├── SecurityConfig.java   # CORS, JWT filter, auth provider
│       │   └── SwaggerConfig.java    # OpenAPI / Swagger setup
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── BookingController.java
│       │   ├── ItemController.java
│       │   ├── PredefinedItemController.java
│       │   └── UserController.java
│       ├── exception/
│       │   ├── ApiError.java
│       │   ├── ApiException.java
│       │   └── GlobalExceptionHandler.java
│       ├── model/
│       │   ├── Booking.java
│       │   ├── BookingItem.java
│       │   ├── BookingStatus.java    # PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
│       │   ├── ItemSize.java         # SMALL, MEDIUM, LARGE
│       │   ├── PredefinedItem.java
│       │   └── User.java
│       ├── payload/
│       │   ├── dto/                  # BookingDto, BookingItemDto, UserDto
│       │   ├── request/              # CreateBookingRequest, AddBookingItemRequest, etc.
│       │   └── response/             # AuthResponse
│       ├── repository/
│       ├── security/
│       │   ├── JwtAuthFilter.java
│       │   ├── JwtProvider.java
│       │   └── UserDetailsServiceImpl.java
│       └── service/
│           ├── impl/
│           └── (interfaces)
│
└── frontend/                         # React + Vite project
    └── src/
        ├── assets/                   # liftnshift_intro.mp4
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── MyBookings.jsx
        ├── router/
        │   └── AppRouter.jsx
        ├── store/
        │   ├── store.js
        │   ├── authSlice.js
        │   ├── bookingSlice.js
        │   └── itemSlice.js
        ├── utils/
        │   └── axiosInstance.js      # Base URL + JWT interceptor
        └── main.jsx
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.x running locally
- Maven 3.8+

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/your-username/liftnshift.git
cd liftnshift/backend
```

**2. Create the MySQL database**

```sql
CREATE DATABASE liftnshift;
```

**3. Configure `application.properties`**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/liftnshift
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

jwt.secret=your_jwt_secret_key_minimum_32_characters
jwt.expiration=86400000
```

**4. Seed the predefined items table**

```sql
INSERT INTO predefined_items (name, price) VALUES
('Sofa',              500.00),
('Bed (Single)',      300.00),
('Bed (Double)',      450.00),
('Wardrobe',          600.00),
('Refrigerator',      700.00),
('Washing Machine',   400.00),
('Dining Table',      350.00),
('Television',        250.00),
('Air Conditioner',   550.00),
('Box (Small)',        50.00);
```

**5. Build and run**

```bash
mvn clean install
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

---

### Frontend Setup

**1. Navigate to the frontend directory**

```bash
cd liftnshift/frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Add the intro video**

Place your video file at:

```
src/assets/liftnshift_intro.mp4
```

**4. Start the dev server**

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## API Reference

### Authentication — `/api/auth` — Public

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, phone, password }` | `{ token, message }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, message }` |

### Bookings — `/api/bookings` — JWT Required

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/bookings` | `{ pickupAddress, dropAddress }` | `BookingDto` |
| GET | `/api/bookings` | — | `BookingDto[]` |
| GET | `/api/bookings/{id}` | — | `BookingDto` |
| DELETE | `/api/bookings/{id}` | — | `string` |
| PATCH | `/api/bookings/{id}/status` | `{ status }` | `BookingDto` |

### Booking Items — JWT Required

| Method | Endpoint | Body / Params | Response |
|---|---|---|---|
| POST | `/api/bookings/items` | `{ bookingId, predefinedItemId, customName, quantity, size }` | `BookingDto` |
| GET | `/api/bookings/{bookingId}/items` | — | `BookingItemDto[]` |
| GET | `/api/bookings/{bookingId}/items/{itemId}` | — | `BookingItemDto` |
| PUT | `/api/bookings/{bookingId}/items/{itemId}/quantity` | `?quantity=N` | `string` |
| DELETE | `/api/bookings/{bookingId}/items/{itemId}` | — | `string` |

### Predefined Items — `/api/predefined-items` — Public

| Method | Endpoint | Response |
|---|---|---|
| GET | `/api/predefined-items` | `PredefinedItem[]` |
| GET | `/api/predefined-items/{id}` | `PredefinedItem` |

### User — `/api/user` — JWT Required

| Method | Endpoint | Response |
|---|---|---|
| GET | `/api/user/profile` | `UserDto` |
| GET | `/api/user/{id}` | `UserDto` |
| GET | `/api/user` | `UserDto[]` |

### Booking Status Flow

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
                ↘                 ↘
             CANCELLED         CANCELLED
```

> Once a booking reaches `COMPLETED` or `CANCELLED`, its status cannot be changed.

---

## Environment Variables

### Backend — `application.properties`

| Key | Description | Example |
|---|---|---|
| `spring.datasource.url` | MySQL connection string | `jdbc:mysql://localhost:3306/liftnshift` |
| `spring.datasource.username` | Database username | `root` |
| `spring.datasource.password` | Database password | `password` |
| `jwt.secret` | Secret key for signing JWTs (min 32 chars) | `my_super_secret_key_for_jwt_signing` |
| `jwt.expiration` | Token expiry in milliseconds | `86400000` (24 hours) |

### Frontend — `axiosInstance.js`

| Variable | Default | Description |
|---|---|---|
| `baseURL` | `http://localhost:8080` | Spring Boot backend URL |

---

## Authors

**Shreyash Kolhe** — Backend & Frontend  
MCA Student, Pune · Java Backend Developer

**Om** — Backend Co-developer  
Co-built the Spring Boot API, booking logic, and item pricing system

---

> Built with Java, Spring Boot, React, and Redux · LiftNShift © 2025
