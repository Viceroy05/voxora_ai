# Voxora AI Booking System Documentation

## Overview

The Voxora AI booking system provides a comprehensive backend for managing customer bookings, including AI-powered booking creation, duplicate prevention, and dashboard-ready analytics.

## Features

- ✅ AI-powered booking creation from call analysis
- ✅ Store customer name, phone, service, and time
- ✅ Booking status management (pending/confirmed/completed)
- ✅ Duplicate booking prevention
- ✅ GET bookings API with filtering
- ✅ Dashboard-ready JSON responses
- ✅ Booking statistics and analytics

## Architecture

### Components

1. **Booking Service** - Core booking logic and operations
2. **Booking API** - RESTful endpoints for booking management
3. **AI Integration** - Automatic booking creation from call analysis
4. **Database** - Prisma-based data persistence

### Flow

```
Incoming Call → AI Analysis → Booking Creation (if likely)
                                    ↓
                              Duplicate Check
                                    ↓
                              Booking Record
                                    ↓
                              Dashboard Display
```

## Booking Service

### Functions

#### `createBooking(params)`
Creates a new booking with duplicate prevention.

**Parameters:**
```typescript
{
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  startsAt: Date;
  endsAt?: Date;
  status?: BookingStatus;
  amountCents?: number;
  currency?: string;
  notes?: string;
  callLogId?: string;
  metadata?: any;
}
```

**Returns:**
```typescript
{
  booking: BookingRecord;
  created: boolean;
  duplicate: boolean;
}
```

**Features:**
- Checks for duplicates before creating
- Returns existing booking if duplicate found
- Supports all booking fields
- Optional call log association

#### `createBookingFromAIAnalysis(businessId, callLogId, analysis)`
Creates a booking from AI call analysis.

**Parameters:**
- `businessId`: Business UUID
- `callLogId`: Call log UUID
- `analysis`: AI analysis object with booking likelihood

**Returns:**
```typescript
{
  booking: BookingRecord | null;
  created: boolean;
  duplicate: boolean;
  reason?: string;
}
```

**Features:**
- Only creates if bookingLikely is true
- Extracts customer info from analysis
- Checks for existing bookings
- Stores AI insights in metadata
- Returns reason if not created

#### `updateBookingStatus(bookingId, status)`
Updates booking status.

**Parameters:**
- `bookingId`: Booking UUID
- `status`: New status (PENDING, CONFIRMED, RESCHEDULED, CANCELED, COMPLETED)

**Returns:**
- Updated booking record

#### `getBusinessBookings(businessId, options)`
Gets bookings for a business with filtering.

**Parameters:**
```typescript
{
  status?: BookingStatus;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}
```

**Returns:**
- Array of booking records with call log details

**Features:**
- Filter by status
- Date range filtering
- Pagination support
- Includes related call log

#### `getBookingStats(businessId, days)`
Gets booking statistics for dashboard.

**Parameters:**
- `businessId`: Business UUID
- `days`: Number of days to analyze (default: 30)

**Returns:**
```typescript
{
  total: number;
  byStatus: Record<BookingStatus, number>;
  recent: BookingRecord[];
  period: {
    start: Date;
    end: Date;
    days: number;
  };
}
```

**Features:**
- Total booking count
- Breakdown by status
- Recent bookings list
- Configurable time period

#### `checkDuplicateBooking(businessId, customerPhone, serviceName, startsAt)`
Checks for duplicate booking.

**Parameters:**
- `businessId`: Business UUID
- `customerPhone`: Customer phone number
- `serviceName`: Service name
- `startsAt`: Booking start time

**Returns:**
- Boolean indicating if duplicate exists

## API Endpoints

### List Bookings

**Endpoint:** `GET /api/businesses/{businessId}/bookings`

**Authentication:** Required
**Permission:** `BOOKINGS_READ`

**Query Parameters:**
- `status` (optional): Filter by booking status
- `limit` (optional): Number of results (default: 25, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `startDate` (optional): Filter bookings after this date
- `endDate` (optional): Filter bookings before this date
- `includeStats` (optional): Include statistics (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "businessId": "uuid",
        "callLogId": "uuid",
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "customerEmail": "john@example.com",
        "serviceName": "Consultation",
        "startsAt": "2024-01-15T10:00:00Z",
        "endsAt": "2024-01-15T11:00:00Z",
        "status": "CONFIRMED",
        "amountCents": 5000,
        "currency": "INR",
        "notes": "Customer requested morning slot",
        "metadata": {
          "disposition": "BOOKED",
          "sentiment": "POSITIVE",
          "callerIntent": "Schedule appointment",
          "nextAction": "Send confirmation"
        },
        "createdAt": "2024-01-10T00:00:00Z",
        "updatedAt": "2024-01-10T00:00:00Z",
        "callLog": {
          "id": "uuid",
          "callSid": "CA...",
          "status": "COMPLETED",
          "durationSeconds": 180
        }
      }
    ],
    "stats": {
      "total": 45,
      "byStatus": {
        "PENDING": 12,
        "CONFIRMED": 28,
        "RESCHEDULED": 3,
        "CANCELED": 2,
        "COMPLETED": 0
      },
      "recent": [...],
      "period": {
        "start": "2023-12-11T00:00:00Z",
        "end": "2024-01-10T00:00:00Z",
        "days": 30
      }
    },
    "pagination": {
      "limit": 25,
      "offset": 0,
      "total": 45
    }
  }
}
```

### Create Booking

**Endpoint:** `POST /api/businesses/{businessId}/bookings`

**Authentication:** Required
**Permission:** `BOOKINGS_WRITE`

**Request Body:**
```json
{
  "callLogId": "uuid",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "serviceName": "Consultation",
  "startsAt": "2024-01-15T10:00:00Z",
  "endsAt": "2024-01-15T11:00:00Z",
  "status": "PENDING",
  "amountCents": 5000,
  "currency": "INR",
  "notes": "Customer requested morning slot"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": { ... },
    "created": true,
    "duplicate": false
  }
}
```

**Error Response (Duplicate):**
```json
{
  "error": {
    "code": "duplicate_booking",
    "message": "A booking with the same details already exists.",
    "details": null
  }
}
```

### Get Booking Details

**Endpoint:** `GET /api/businesses/{businessId}/bookings/{bookingId}`

**Authentication:** Required
**Permission:** `BOOKINGS_READ`

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "businessId": "uuid",
      "callLogId": "uuid",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "customerEmail": "john@example.com",
      "serviceName": "Consultation",
      "startsAt": "2024-01-15T10:00:00Z",
      "endsAt": "2024-01-15T11:00:00Z",
      "status": "CONFIRMED",
      "amountCents": 5000,
      "currency": "INR",
      "notes": "Customer requested morning slot",
      "metadata": { ... },
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-10T00:00:00Z",
      "callLog": {
        "id": "uuid",
        "callSid": "CA...",
        "status": "COMPLETED",
        "durationSeconds": 180,
        "recordingUrl": "https://...",
        "transcriptText": "Hello, I'd like to book...",
        "summaryText": "Customer wants to schedule...",
        "aiAnalysis": { ... }
      }
    }
  }
}
```

### Update Booking

**Endpoint:** `PATCH /api/businesses/{businessId}/bookings/{bookingId}`

**Authentication:** Required
**Permission:** `BOOKINGS_WRITE`

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "customerName": "Jane Doe",
  "startsAt": "2024-01-16T14:00:00Z",
  "notes": "Rescheduled per customer request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": { ... }
  }
}
```

### Delete Booking

**Endpoint:** `DELETE /api/businesses/{businessId}/bookings/{bookingId}`

**Authentication:** Required
**Permission:** `BOOKINGS_WRITE`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Booking deleted successfully."
  }
}
```

### Get Booking Statistics

**Endpoint:** `GET /api/businesses/{businessId}/bookings/stats`

**Authentication:** Required
**Permission:** `BOOKINGS_READ`

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30, max: 365)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "PENDING": 12,
      "CONFIRMED": 28,
      "RESCHEDULED": 3,
      "CANCELED": 2,
      "COMPLETED": 0
    },
    "recent": [
      {
        "id": "uuid",
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "serviceName": "Consultation",
        "startsAt": "2024-01-15T10:00:00Z",
        "status": "CONFIRMED",
        "createdAt": "2024-01-10T00:00:00Z",
        "callLog": {
          "id": "uuid",
          "callSid": "CA...",
          "status": "COMPLETED"
        }
      }
    ],
    "period": {
      "start": "2023-12-11T00:00:00Z",
      "end": "2024-01-10T00:00:00Z",
      "days": 30
    }
  }
}
```

## Booking Status

### Status Values

- `PENDING` - Booking created but not yet confirmed
- `CONFIRMED` - Booking confirmed with customer
- `RESCHEDULED` - Booking rescheduled to new time
- `CANCELED` - Booking canceled by customer or business
- `COMPLETED` - Booking service completed

### Status Transitions

```
PENDING → CONFIRMED → COMPLETED
   ↓           ↓
CANCELED    RESCHEDULED → CONFIRMED
```

## AI Integration

### Automatic Booking Creation

When AI analysis indicates a high likelihood of booking:

1. AI processor receives call analysis
2. Checks `bookingLikely` flag
3. Extracts customer contact information
4. Creates booking with default values
5. Stores AI insights in metadata
6. Logs creation result

### AI Metadata

Bookings created by AI include:

```json
{
  "disposition": "BOOKED",
  "sentiment": "POSITIVE",
  "callerIntent": "Schedule appointment",
  "nextAction": "Send confirmation",
  "summary": "Customer wants to schedule consultation for next week"
}
```

### Duplicate Prevention

AI checks for existing bookings:

1. Checks if booking already exists for call log
2. Only creates if no existing booking
3. Returns reason if not created
4. Logs all booking attempts

## Dashboard Integration

### Recommended Dashboard Components

1. **Upcoming Bookings**
   - Use GET with status=CONFIRMED
   - Sort by startsAt ascending
   - Show next 7 days

2. **Booking Statistics**
   - Use GET /stats endpoint
   - Display total and by status
   - Show trend over time

3. **Recent Activity**
   - Use GET with limit=10
   - Show all recent bookings
   - Include status badges

4. **Pending Actions**
   - Use GET with status=PENDING
   - Show bookings needing confirmation
   - Quick action buttons

### Example Dashboard Query

```typescript
// Get upcoming confirmed bookings for next 7 days
const upcoming = await fetch(
  `/api/businesses/${businessId}/bookings?status=CONFIRMED&startDate=${today}&endDate=${weekFromNow}&limit=20`
);

// Get booking statistics
const stats = await fetch(
  `/api/businesses/${businessId}/bookings/stats?days=30`
);

// Get pending bookings
const pending = await fetch(
  `/api/businesses/${businessId}/bookings?status=PENDING&limit=10`
);
```

## Error Handling

### Common Errors

**Duplicate Booking**
```json
{
  "error": {
    "code": "duplicate_booking",
    "message": "A booking with the same details already exists.",
    "details": null
  }
}
```

**Booking Not Found**
```json
{
  "error": {
    "code": "booking_not_found",
    "message": "Booking not found.",
    "details": null
  }
}
```

**Invalid Status**
```json
{
  "error": {
    "code": "invalid_status",
    "message": "Unsupported booking status filter.",
    "details": null
  }
}
```

## Best Practices

1. **Always check for duplicates** - Before creating new bookings
2. **Use appropriate status** - Follow status transition rules
3. **Include metadata** - Store AI insights for reference
4. **Filter by date range** - Optimize dashboard queries
5. **Use pagination** - Handle large booking lists
6. **Cache statistics** - Reduce database load
7. **Handle duplicates gracefully** - Show existing booking to user
8. **Validate phone numbers** - Ensure proper format
9. **Include call log ID** - Link bookings to calls
10. **Use timezone-aware dates** - Avoid confusion

## Support

For issues or questions, contact support@voxora.ai
