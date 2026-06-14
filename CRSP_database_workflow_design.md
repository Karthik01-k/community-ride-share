# CRSP Database Workflow, Attributes, and Visual Connections

## 1. Database Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ VEHICLE : owns
    USER ||--o{ TRIP : drives
    USER ||--o{ BOOKING : requests
    USER ||--o{ RATING : gives
    USER ||--o{ RATING : receives
    USER ||--o{ AUDIT_LOG : performs

    VEHICLE ||--o{ TRIP : used_for
    TRIP ||--o{ MATCH : produces
    TRIP ||--o{ BOOKING : receives
    TRIP ||--o{ RATING : has
    BOOKING ||--o| PAYMENT : settled_by
    BOOKING ||--o{ RATING : unlocks
    TRIP ||--o{ AUDIT_LOG : audited_by
    BOOKING ||--o{ AUDIT_LOG : audited_by

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string phone
        string gender
        enum role
        boolean govtIdVerified
        number ratingAvg
        number ratingCount
        number totalRidesAsDriver
        number totalRidesAsPassenger
        number totalCo2SavedKg
        date blockedAt
        date createdAt
        date updatedAt
    }

    VEHICLE {
        ObjectId _id PK
        ObjectId ownerId FK
        enum type
        string model
        string numberPlate
        number seatsTotal
        boolean active
        date createdAt
        date updatedAt
    }

    TRIP {
        ObjectId _id PK
        ObjectId driverId FK
        ObjectId vehicleId FK
        string startLocation
        string endLocation
        object startCoords
        object endCoords
        string routePolyline
        array routePoints
        number totalDistanceKm
        number estimatedDurationMinutes
        number estimatedFuelCost
        date departureTime
        number seatsTotal
        number seatsAvailable
        enum status
        date deletedAt
        date createdAt
        date updatedAt
    }

    MATCH {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId passengerId FK
        string requestHash
        number overlapDistanceKm
        number matchScore
        number costEstimate
        number detourMinutes
        object pickupSuggestion
        object dropSuggestion
        date createdAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId passengerId FK
        number seatsRequested
        string pickupLocation
        object pickupCoords
        string dropLocation
        object dropCoords
        number overlapDistanceKm
        number costContribution
        enum status
        date approvedAt
        date confirmedAt
        date cancelledAt
        date createdAt
        date updatedAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId bookingId FK
        enum provider
        string providerOrderId
        string providerPaymentId
        number amount
        string currency
        enum status
        date verifiedAt
        string rawWebhookRef
        date createdAt
        date updatedAt
    }

    RATING {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId bookingId FK
        ObjectId raterId FK
        ObjectId rateeId FK
        enum roleContext
        number score
        string comment
        enum moderationStatus
        date createdAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actorId FK
        string action
        string targetType
        ObjectId targetId
        object before
        object after
        string reason
        date createdAt
    }

    ECO_STAT {
        ObjectId _id PK
        number totalKmShared
        number totalCo2SavedKg
        number totalTripsCompleted
        date updatedAt
    }
```

## 2. Database Tables and Attribute Connections

### User

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | `Vehicle.ownerId`, `Trip.driverId`, `Booking.passengerId`, `Rating.raterId`, `Rating.rateeId`, `AuditLog.actorId` | Unique user identity. |
| `name` | String | - | UI profile, trip cards | User display name. |
| `email` | String | Unique | Auth login | Login identifier. |
| `passwordHash` | String | - | Auth service | Secure hashed password. |
| `phone` | String | - | Profile/contact | Optional contact info. |
| `gender` | String | - | Profile/safety filters | Optional profile field. |
| `role` | Enum | Indexed | Admin middleware, protected routes | Controls passenger, driver, admin permissions. |
| `govtIdVerified` | Boolean | - | TripCard/Profile trust badge | Shows verification trust signal. |
| `ratingAvg` | Number | - | TripCard/Profile | Average received rating. |
| `ratingCount` | Number | - | Rating aggregation | Number of ratings received. |
| `totalRidesAsDriver` | Number | - | Profile/stats | Driver ride history count. |
| `totalRidesAsPassenger` | Number | - | Profile/stats | Passenger ride history count. |
| `totalCo2SavedKg` | Number | - | Eco stats | Personal environmental impact. |
| `blockedAt` | Date | - | Admin moderation | Blocks access when set. |
| `createdAt`, `updatedAt` | Date | - | Audit/debug | Record lifecycle. |

### Vehicle

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | `Trip.vehicleId` | Unique vehicle identity. |
| `ownerId` | ObjectId | Foreign Key | `User._id` | Vehicle owner/driver. |
| `type` | Enum | - | Trip creation | Car, bike, or auto. |
| `model` | String | - | Trip detail UI | Vehicle display. |
| `numberPlate` | String | - | Safety/admin | Vehicle verification detail. |
| `seatsTotal` | Number | - | Trip seat defaults | Max seats vehicle can offer. |
| `active` | Boolean | - | Trip posting | Prevent inactive vehicle use. |
| `createdAt`, `updatedAt` | Date | - | Audit/debug | Record lifecycle. |

### Trip

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | `Match.tripId`, `Booking.tripId`, `Rating.tripId` | Unique trip identity. |
| `driverId` | ObjectId | Foreign Key | `User._id` | Driver who posted the trip. |
| `vehicleId` | ObjectId | Foreign Key | `Vehicle._id` | Vehicle used for trip. |
| `startLocation` | String | - | Search/UI | Human-readable origin. |
| `endLocation` | String | - | Search/UI | Human-readable destination. |
| `startCoords` | Object | 2dsphere | Maps/search | Origin latitude/longitude. |
| `endCoords` | Object | 2dsphere | Maps/search | Destination latitude/longitude. |
| `routePolyline` | String | - | Maps/matching | Encoded Google route. |
| `routePoints` | Array | - | Matching service | Decoded route points for overlap. |
| `totalDistanceKm` | Number | - | Cost formula | Full trip distance. |
| `estimatedDurationMinutes` | Number | - | Search/matching | Trip duration estimate. |
| `estimatedFuelCost` | Number | - | Cost formula/payment | Driver-entered or estimated fuel cost. |
| `departureTime` | Date | Indexed | Match filtering | Time-based search. |
| `seatsTotal` | Number | - | Booking limit | Original offered seats. |
| `seatsAvailable` | Number | Indexed | Booking lock | Available seats after approvals. |
| `status` | Enum | Indexed | Search/admin | draft, open, full, completed, cancelled, flagged, blocked. |
| `deletedAt` | Date | - | Soft delete | Preserve historical records. |
| `createdAt`, `updatedAt` | Date | - | Audit/debug | Record lifecycle. |

### Match

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | - | Unique match record. |
| `tripId` | ObjectId | Foreign Key | `Trip._id` | Candidate driver trip. |
| `passengerId` | ObjectId | Foreign Key Optional | `User._id` | User who searched, if logged in. |
| `requestHash` | String | Indexed | Match cache/debug | Repeatable search signature. |
| `overlapDistanceKm` | Number | - | Cost calculation | Shared route distance. |
| `matchScore` | Number | - | Ranking | Match quality score. |
| `costEstimate` | Number | - | Booking/payment | Estimated passenger contribution. |
| `detourMinutes` | Number | - | Ranking | Pickup/drop inconvenience. |
| `pickupSuggestion` | Object | - | Booking form | Suggested pickup point. |
| `dropSuggestion` | Object | - | Booking form | Suggested drop point. |
| `createdAt` | Date | - | Debug/cache expiry | Match creation time. |

### Booking

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | `Payment.bookingId`, `Rating.bookingId` | Unique booking identity. |
| `tripId` | ObjectId | Foreign Key | `Trip._id` | Trip being booked. |
| `passengerId` | ObjectId | Foreign Key | `User._id` | Passenger requesting seat. |
| `seatsRequested` | Number | - | Seat locking | Number of seats requested. |
| `pickupLocation` | String | - | Driver/passenger UI | Pickup address. |
| `pickupCoords` | Object | - | Maps/matching | Pickup coordinates. |
| `dropLocation` | String | - | Driver/passenger UI | Drop address. |
| `dropCoords` | Object | - | Maps/matching | Drop coordinates. |
| `overlapDistanceKm` | Number | - | Cost/payment | Shared distance for this booking. |
| `costContribution` | Number | - | Payment | Amount passenger pays. |
| `status` | Enum | Indexed | Workflow | pending_driver_approval, approved_pending_payment, confirmed, cancelled, completed, rejected, payment_failed. |
| `approvedAt` | Date | - | Workflow audit | Driver approval timestamp. |
| `confirmedAt` | Date | - | Workflow audit | Payment-confirmed timestamp. |
| `cancelledAt` | Date | - | Workflow audit | Cancellation timestamp. |
| `createdAt`, `updatedAt` | Date | - | Audit/debug | Record lifecycle. |

### Payment

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | - | Unique payment identity. |
| `bookingId` | ObjectId | Foreign Key | `Booking._id` | Booking being settled. |
| `provider` | Enum | - | Payment service | razorpay, stripe, manual. |
| `providerOrderId` | String | Indexed | Razorpay order | Provider order reference. |
| `providerPaymentId` | String | Indexed Optional | Razorpay payment | Provider payment reference. |
| `amount` | Number | - | Payment verification | Amount charged. |
| `currency` | String | - | Payment verification | Usually INR. |
| `status` | Enum | Indexed | Booking confirmation | created, pending, captured, failed, refunded. |
| `verifiedAt` | Date | - | Security/audit | Signature verification time. |
| `rawWebhookRef` | String | - | Debug/audit | Reference to webhook payload/log. |
| `createdAt`, `updatedAt` | Date | - | Audit/debug | Record lifecycle. |

### Rating

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | - | Unique rating identity. |
| `tripId` | ObjectId | Foreign Key | `Trip._id` | Completed trip. |
| `bookingId` | ObjectId | Foreign Key | `Booking._id` | Completed booking that unlocks rating. |
| `raterId` | ObjectId | Foreign Key | `User._id` | User giving rating. |
| `rateeId` | ObjectId | Foreign Key | `User._id` | User receiving rating. |
| `roleContext` | Enum | - | Trust display | driver or passenger context. |
| `score` | Number | - | Rating aggregation | 1 to 5 score. |
| `comment` | String | - | Profile/admin | Optional feedback. |
| `moderationStatus` | Enum | - | Admin moderation | visible, hidden, flagged. |
| `createdAt` | Date | - | Audit/debug | Rating creation time. |

### AuditLog

| Attribute | Type | Key | Connected To | Purpose |
|---|---:|---|---|---|
| `_id` | ObjectId | Primary Key | - | Unique audit event. |
| `actorId` | ObjectId | Foreign Key Optional | `User._id` | User/admin/system actor. |
| `action` | String | Indexed | Admin dashboard | Action name. |
| `targetType` | String | Indexed | Admin dashboard | User, Trip, Booking, Payment, Rating. |
| `targetId` | ObjectId | Indexed | Related record | Target record ID. |
| `before` | Object | - | Audit comparison | State before action. |
| `after` | Object | - | Audit comparison | State after action. |
| `reason` | String | - | Admin notes | Moderation or cancellation reason. |
| `createdAt` | Date | - | Audit timeline | Event time. |

## 3. Attribute Connection Matrix

| From Table.Attribute | To Table.Attribute | Relationship | Meaning |
|---|---|---|---|
| `Vehicle.ownerId` | `User._id` | Many vehicles to one user | A user owns vehicles. |
| `Trip.driverId` | `User._id` | Many trips to one user | A driver posts many trips. |
| `Trip.vehicleId` | `Vehicle._id` | Many trips to one vehicle | A vehicle can be reused across trips. |
| `Match.tripId` | `Trip._id` | Many matches to one trip | A trip can appear in many passenger searches. |
| `Match.passengerId` | `User._id` | Many matches to one user | Logged-in passenger search history. |
| `Booking.tripId` | `Trip._id` | Many bookings to one trip | A trip can receive multiple bookings. |
| `Booking.passengerId` | `User._id` | Many bookings to one user | A passenger can request many rides. |
| `Payment.bookingId` | `Booking._id` | One payment to one booking | A booking is settled by payment. |
| `Rating.tripId` | `Trip._id` | Many ratings to one trip | Completed trip context. |
| `Rating.bookingId` | `Booking._id` | Many ratings to one booking | Booking unlocks rating rights. |
| `Rating.raterId` | `User._id` | Many ratings from one user | User gives ratings. |
| `Rating.rateeId` | `User._id` | Many ratings to one user | User receives ratings. |
| `AuditLog.actorId` | `User._id` | Many audit logs by one user | Actor performs auditable action. |

## 4. Main Project Workflow Design

```mermaid
flowchart TD
    A[User opens CRSP] --> B{Logged in?}
    B -->|No| C[Browse landing/search as guest]
    B -->|Yes| D[Load user profile and role]

    C --> E[Search ride]
    D --> E

    E --> F[Enter origin, destination, date, seats]
    F --> G{Google Maps API key available?}
    G -->|Yes| H[Fetch Places and Directions route]
    G -->|No| I[Use mock seeded route]

    H --> J[Decode passenger route polyline]
    I --> J
    J --> K[Find open trips in time window]
    K --> L[Run route overlap algorithm]
    L --> M[Calculate overlap distance]
    M --> N[Calculate cost contribution]
    N --> O[Rank matches by match_score]
    O --> P[Show TripFeed and map previews]

    P --> Q{Passenger wants booking?}
    Q -->|No| R[Continue browsing]
    Q -->|Yes| S[Submit booking request]

    S --> T[Booking status: pending_driver_approval]
    T --> U[Driver sees approval queue]
    U --> V{Driver approves?}
    V -->|Reject| W[Booking status: rejected]
    V -->|Approve| X[Atomic seat lock]

    X --> Y{Seats available?}
    Y -->|No| Z[Booking fails: seats unavailable]
    Y -->|Yes| AA[Booking status: approved_pending_payment]

    AA --> AB[Create Razorpay order]
    AB --> AC[Passenger pays]
    AC --> AD{Payment verified?}
    AD -->|No| AE[Booking status: payment_failed]
    AD -->|Yes| AF[Payment status: captured]
    AF --> AG[Booking status: confirmed]

    AG --> AH[Trip happens]
    AH --> AI[Driver/Admin marks completed]
    AI --> AJ[Booking status: completed]
    AJ --> AK[Ratings unlocked]
    AK --> AL[Users rate each other]
    AL --> AM[Update user rating averages and eco stats]
```

## 5. Booking State Workflow

```mermaid
stateDiagram-v2
    [*] --> pending_driver_approval: passenger requests booking
    pending_driver_approval --> rejected: driver rejects
    pending_driver_approval --> approved_pending_payment: driver approves + seats locked
    pending_driver_approval --> cancelled: passenger cancels

    approved_pending_payment --> confirmed: Razorpay payment verified
    approved_pending_payment --> payment_failed: payment failed
    approved_pending_payment --> cancelled: passenger/driver cancels + seats restored

    payment_failed --> approved_pending_payment: retry payment
    confirmed --> cancelled: allowed cancellation + policy check
    confirmed --> completed: trip completed
    completed --> [*]
    rejected --> [*]
    cancelled --> [*]
```

## 6. Route Matching Workflow

```mermaid
flowchart LR
    A[Passenger search request] --> B[Get passenger route]
    B --> C[Decode passenger polyline]
    C --> D[Load candidate open trips]
    D --> E[Decode driver trip polylines]
    E --> F[Compare points within 50 meters]
    F --> G[Build continuous overlap segments]
    G --> H[Calculate overlap_distance_km]
    H --> I[Calculate cost_estimate]
    I --> J[Calculate time proximity score]
    J --> K[Calculate detour penalty]
    K --> L[match_score calculation]
    L --> M[Sort ranked matches]
    M --> N[Return matches to frontend]
```

## 7. Payment and Confirmation Workflow

```mermaid
sequenceDiagram
    participant Passenger
    participant Web as Frontend
    participant API as Backend API
    participant DB as MongoDB
    participant RZP as Razorpay
    participant Driver

    Passenger->>Web: Request booking
    Web->>API: POST /api/bookings
    API->>DB: Create booking pending_driver_approval
    DB-->>API: Booking created
    API-->>Web: Booking pending

    Driver->>Web: Approve booking
    Web->>API: PATCH /api/bookings/:id/approve
    API->>DB: Atomic decrement seatsAvailable
    DB-->>API: Seats locked
    API->>DB: Booking approved_pending_payment
    API-->>Web: Payment required

    Passenger->>Web: Start payment
    Web->>API: POST /api/payments/razorpay/order
    API->>RZP: Create order
    RZP-->>API: order_id
    API->>DB: Create Payment created
    API-->>Web: Razorpay order details

    Passenger->>RZP: Complete payment
    RZP-->>Web: payment_id + signature
    Web->>API: POST /api/payments/razorpay/verify
    API->>API: Verify signature
    API->>DB: Payment captured
    API->>DB: Booking confirmed
    API-->>Web: Booking confirmed
```

## 8. Admin Moderation Workflow

```mermaid
flowchart TD
    A[Admin logs in] --> B[Admin dashboard]
    B --> C[View users]
    B --> D[View trips]
    B --> E[View bookings/payments]
    B --> F[View audit logs]

    C --> G{User suspicious?}
    G -->|Yes| H[Block user]
    G -->|No| I[Leave active]

    D --> J{Trip unsafe or invalid?}
    J -->|Yes| K[Flag or block trip]
    J -->|No| L[Leave open]

    E --> M{Payment dispute?}
    M -->|Yes| N[Inspect booking and payment history]
    M -->|No| O[No action]

    H --> P[Create AuditLog]
    K --> P
    N --> P
```

## 9. Recommended Indexes

| Collection | Index | Reason |
|---|---|---|
| `users` | `{ email: 1 } unique` | Fast login and duplicate prevention. |
| `users` | `{ role: 1, blockedAt: 1 }` | Admin filtering. |
| `vehicles` | `{ ownerId: 1 }` | Fetch driver vehicles. |
| `trips` | `{ status: 1, departureTime: 1 }` | Search open trips by date/time. |
| `trips` | `{ driverId: 1, departureTime: -1 }` | Driver trip history. |
| `trips` | `{ startCoords: "2dsphere" }` | Origin geospatial search. |
| `trips` | `{ endCoords: "2dsphere" }` | Destination geospatial search. |
| `bookings` | `{ tripId: 1, status: 1 }` | Driver approval queue. |
| `bookings` | `{ passengerId: 1, createdAt: -1 }` | Passenger booking history. |
| `payments` | `{ bookingId: 1 } unique` | One active settlement per booking. |
| `payments` | `{ providerOrderId: 1 }` | Payment verification lookup. |
| `ratings` | `{ raterId: 1, bookingId: 1, rateeId: 1 } unique` | Prevent duplicate ratings. |
| `auditlogs` | `{ targetType: 1, targetId: 1, createdAt: -1 }` | Entity audit history. |

