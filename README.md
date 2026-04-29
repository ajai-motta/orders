# Orders Service

An event-driven microservice for managing ticket reservations and orders in the mini-microservices-boilerplate project. This service handles order creation, retrieval, and cancellation while maintaining consistency through NATS event streaming and distributed transactions.

## Overview

The Orders Service is a core component of a ticket booking system that manages customer orders and ticket reservations. It communicates asynchronously with other microservices (Tickets, Payments, and Expiration services) using NATS Streaming for a loosely-coupled, scalable architecture.

**Technology Stack:**
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB
- **Message Queue:** NATS Streaming
- **Authentication:** JWT (JSON Web Tokens)
- **Version Control:** Mongoose Update-If-Current plugin
- **Testing:** Jest & Supertest
- **Container:** Docker

## Features

- 📦 **Order Management** - Create, retrieve, and cancel orders with full state management
- 🎫 **Ticket Reservation** - Reserve tickets with automatic expiration (15-minute window)
- 📡 **Event-Driven Architecture** - Publish and subscribe to events via NATS Streaming
- 🔐 **JWT Authentication** - Secure endpoints with token-based authorization
- 👤 **Multi-Tenant** - Orders scoped to individual users
- 🔄 **Version Tracking** - Prevent race conditions with optimistic locking
- ✅ **Comprehensive Testing** - Unit and integration tests
- 🐳 **Docker Support** - Containerized deployment
- 🔄 **Kubernetes Ready** - Orchestration-ready manifests

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB instance (local or cloud)
- NATS Streaming server
- Docker (optional, for containerization)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
export JWT_KEY="your-secret-jwt-key"
export MONGO_URI="mongodb://localhost:27017/orders"
export NATS_CLIENT_ID="orders-service"
export NATS_CLUSTER_ID="ticketing"
export NATS_URL="http://localhost:4222"
export NODE_ENV="development"
```

### Development

```bash
# Start the development server with auto-reload
npm run dev

# Run tests in watch mode
npm run test

# Build TypeScript
npm run build

# Start the production server
npm start
```

The service will start on `http://localhost:3000`

## API Endpoints

### 1. Create Order

Create a new order for a specific ticket with automatic 15-minute expiration.

```http
POST /api/orders/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "ticketId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "id": "507f191e810c19729de860ea",
  "userId": "507f1f77bcf86cd799439011",
  "status": "created",
  "expiresAt": "2026-04-29T10:45:00.000Z",
  "ticket": "507f1f77bcf86cd799439012",
  "version": 0
}
```

**Validation Rules:**
- `ticketId` must be provided and a valid MongoDB ObjectId
- Ticket must exist and not already be reserved
- User must be authenticated

**Error Responses:**
- `400 Bad Request` - Invalid ticket ID or ticket already reserved
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Ticket not found

**Side Effects:**
- Order status set to `Created`
- Expiration time calculated as current time + 15 minutes
- `OrderCreated` event published to NATS
- Ticket becomes reserved

### 2. Get All Orders

Retrieve all orders for the authenticated user.

```http
GET /api/orders/
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "507f191e810c19729de860ea",
    "userId": "507f1f77bcf86cd799439011",
    "status": "created",
    "expiresAt": "2026-04-29T10:45:00.000Z",
    "ticket": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Concert Ticket",
      "price": 25.99,
      "version": 2
    },
    "version": 0
  },
  {
    "id": "507f191e810c19729de860eb",
    "userId": "507f1f77bcf86cd799439011",
    "status": "complete",
    "expiresAt": "2026-04-29T11:45:00.000Z",
    "ticket": {
      "id": "507f1f77bcf86cd799439013",
      "title": "Movie Ticket",
      "price": 15.99,
      "version": 1
    },
    "version": 1
  }
]
```

**Authorization:**
- User must be authenticated
- Returns only orders belonging to the current user

### 3. Get Order by ID

Retrieve a specific order by ID (with ticket details populated).

```http
GET /api/orders/:orderId
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "507f191e810c19729de860ea",
  "userId": "507f1f77bcf86cd799439011",
  "status": "created",
  "expiresAt": "2026-04-29T10:45:00.000Z",
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Concert Ticket",
    "price": 25.99,
    "version": 2
  },
  "version": 0
}
```

**Authorization:**
- User must be authenticated
- User can only view their own orders

**Error Responses:**
- `400 Bad Request` - Invalid order ID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User trying to access another user's order
- `404 Not Found` - Order not found

### 4. Cancel Order

Cancel an existing order and free up the ticket reservation.

```http
DELETE /api/orders/:orderId
Authorization: Bearer <jwt_token>
```

**Response (204):** No content

**Authorization:**
- User must be authenticated
- User can only cancel their own orders

**Side Effects:**
- Order status changed to `Cancelled`
- `OrderCancelled` event published to NATS
- Ticket reservation released (can be reserved by another user)

**Error Responses:**
- `400 Bad Request` - Invalid order ID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User trying to cancel another user's order
- `404 Not Found` - Order not found

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `JWT_KEY` | Secret key for JWT token verification | Yes | `your-secret-key` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/orders` |
| `NATS_CLIENT_ID` | Unique client identifier for NATS | Yes | `orders-service` |
| `NATS_CLUSTER_ID` | NATS cluster identifier | Yes | `ticketing` |
| `NATS_URL` | NATS server URL | Yes | `http://localhost:4222` |
| `NODE_ENV` | Environment mode | No | `development`, `production`, `test` |

## Project Structure

```
orders/
├── src/
│   ├── index.ts                         # Application entry point
│   ├── app.ts                           # Express app configuration
│   ├── nats-class-wrapper.ts            # NATS client wrapper
│   ├── models/
│   │   ├── orders.ts                    # Order schema and model
│   │   └── tickets.ts                   # Ticket replica schema
│   ├── routes/
│   │   ├── new.ts                       # POST /api/orders/
│   │   ├── index.ts                     # GET /api/orders/
│   │   ├── show.ts                      # GET /api/orders/:orderId
│   │   └── delete.ts                    # DELETE /api/orders/:orderId
│   └── events/
│       ├── publishers/
│       │   ├── order-created-publisher.ts
│       │   ├── order-updated-publisher.ts
│       │   └── order-cancelled-publisher.ts
│       └── listeners/
│           ├── ticket-created-listener.ts
│           ├── ticket-updated-event.ts
│           ├── payment-created-listener.ts
│           ├── expiration-complete-listener.ts
│           └── que-group-name.ts
├── k8s/                                 # Kubernetes manifests
├── dist/                                # Compiled JavaScript
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── jest.config.cjs                      # Testing configuration
├── Dockerfile                           # Container image
└── README.md                            # This file
```

## Data Models

### Order

Represents a customer's reservation of a ticket.

```json
{
  "_id": ObjectId,
  "userId": "String - Foreign key to User",
  "status": "String - Enum(created, awaiting_payment, complete, cancelled)",
  "expiresAt": "Date - When the reservation expires",
  "ticket": "ObjectId - Reference to Ticket",
  "version": "Number - For optimistic locking"
}
```

**Order Statuses:**
- `Created` - Initial state after order creation
- `AwaitingPayment` - Payment is being processed
- `Complete` - Order and payment complete
- `Cancelled` - Order was cancelled

### Ticket (Local Replica)

The Orders service maintains a local copy of ticket data replicated from the Tickets service via events. This enables:
- Fast lookups without network calls
- Reservation checking
- Order fulfillment with current ticket info

```json
{
  "_id": "String - Matches Ticket ID from Tickets service",
  "title": "String - Event or ticket name",
  "price": "Number - Ticket price in dollars",
  "version": "Number - Incremented when ticket updated"
}
```

## Event-Driven Architecture

### Events Published

The Orders Service publishes events to NATS for other services to consume:

**OrderCreated Event**
```typescript
{
  id: order.id,
  status: order.status,
  userId: order.userId,
  expiresAt: expiration.toISOString(),
  version: order.version,
  ticket: {
    id: ticket.id,
    price: ticket.price
  }
}
```

**OrderCancelled Event**
```typescript
{
  id: order.userId,
  version: order.version,
  ticket: {
    id: ticket.id
  }
}
```

**OrderUpdated Event**
```typescript
{
  id: order.id,
  status: order.status,
  userId: order.userId,
  expiresAt: order.expiresAt.toISOString(),
  version: order.version,
  ticket: {
    id: ticket.id,
    price: ticket.price
  }
}
```

### Events Consumed

The Orders Service listens for events from other services:

**TicketCreated & TicketUpdated**
- Source: Tickets Service
- Action: Create or update local ticket replica

**PaymentCreated**
- Source: Payments Service
- Action: Update order status to `Complete`

**ExpirationComplete**
- Source: Expiration Service
- Action: Cancel expired orders (if not already complete)

## Distributed Transaction Flow

1. **Order Creation**
   - User creates order → Status: `Created`
   - OrderCreated event published

2. **Payment Processing**
   - Payments service receives OrderCreated event
   - User completes payment → PaymentCreated event published
   - Orders service receives PaymentCreated → Status: `Complete`

3. **Expiration Handling**
   - Expiration service monitors OrderCreated events
   - If order not completed within 15 minutes → ExpirationComplete event
   - Orders service cancels order → Status: `Cancelled`

## Optimistic Locking

The service uses the `mongoose-update-if-current` plugin to prevent race conditions:

- Each document has a `version` field
- When updating, the version must match
- If version mismatch occurs, the update fails
- Enables safe concurrent updates across distributed services

## Authentication & Authorization

- **Authentication:** JWT tokens in session cookies (set by Auth Service)
- **Authorization:** Orders are scoped to users; users can only access their own orders
- **Middleware:** `currentUser` middleware from `@ajaisgtickets/common` extracts user info from JWT

## Testing

Comprehensive test suite with Jest and Supertest.

```bash
# Run all tests
npm run test

# Run tests once
npm run test -- --watchAll=false

# Run specific test file
npm run test -- --testPathPattern="new.test"
```

**Test Coverage:**
- Order creation with ticket validation
- Duplicate order prevention
- Order retrieval (list and by ID)
- Authorization checks
- Order cancellation
- Event publishing
- NATS listener integration

## Docker Deployment

### Build Image

```bash
docker build -t orders-service:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e JWT_KEY="your-secret-key" \
  -e MONGO_URI="mongodb://host.docker.internal:27017/orders" \
  -e NATS_CLIENT_ID="orders-service" \
  -e NATS_CLUSTER_ID="ticketing" \
  -e NATS_URL="http://host.docker.internal:4222" \
  -e NODE_ENV="production" \
  orders-service:latest
```

## Kubernetes Deployment

Kubernetes manifests are located in `k8s/` directory.

```bash
kubectl apply -f k8s/
```

## Dependencies

### Core Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **mongoose-update-if-current** - Optimistic locking for distributed transactions
- **node-nats-streaming** - NATS Streaming client
- **jsonwebtoken** - JWT verification
- **cookie-session** - Session middleware

### Shared Dependencies
- **@ajaisgtickets/common** - Shared utilities, error handling, middleware

### Dev Dependencies
- **typescript** - Type system
- **ts-node** - TypeScript execution
- **jest** - Testing framework
- **ts-jest** - Jest TypeScript support
- **supertest** - HTTP assertion library
- **nodemon** - Development auto-reload
- **mongodb-memory-server** - In-memory MongoDB for testing

## Troubleshooting

### "No env variable" Error
Ensure `JWT_KEY` is set before starting.

### "No mongo env" Error
Ensure `MONGO_URI` environment variable is configured.

### "Some nats env missing" Error
Ensure all NATS environment variables are set:
- `NATS_CLUSTER_ID`
- `NATS_CLIENT_ID`
- `NATS_URL`

### NATS Connection Refused
- Verify NATS Streaming server is running
- Check `NATS_URL` points to correct server
- Ensure network connectivity if using remote NATS

### MongoDB Connection Issues
- Verify MongoDB is running
- Check `MONGO_URI` credentials and host
- Ensure database user has appropriate permissions

### Order Creation Fails with "Ticket is reserved"
- Ticket already has an active order (not cancelled)
- Cancellation events may be delayed in processing
- Verify event listeners are running

### Tests Failing
- Clear node_modules: `rm -rf node_modules && npm install`
- Ensure MongoDB Memory Server can download binaries
- Check Node.js version (16+ recommended)

## Performance Considerations

- **Ticket Replica:** Local ticket copy reduces calls to Tickets service
- **Event-Driven:** Async events prevent blocking operations
- **Version Tracking:** Optimistic locking allows concurrent order processing
- **Indexing:** Add indexes on `userId` and `ticket` fields for faster queries
- **NATS Queue Groups:** Ensure queue group names are consistent for load balancing

## Contributing

When contributing to this service:
1. Follow the existing code structure
2. Add tests for new endpoints
3. Document event contracts in this README
4. Ensure all tests pass before submitting changes
5. Consider distributed transaction implications

## Related Services

- **Tickets Service** - Creates and updates tickets; publishes ticket events
- **Payments Service** - Processes payments; listens for OrderCreated events
- **Expiration Service** - Monitors order expiration; publishes ExpirationComplete events
- **Auth Service** - Issues JWT tokens used for authentication

## License

ISC
