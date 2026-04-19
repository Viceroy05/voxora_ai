# Voxora AI Dashboard APIs Documentation

## Overview

The Voxora AI dashboard APIs provide real-time analytics and metrics for business dashboards, using live Prisma data from calls, bookings, and AI processing.

## Features

- ✅ Calls today metrics
- ✅ Total calls statistics
- ✅ Missed calls recovered tracking
- ✅ Bookings today metrics
- ✅ Revenue estimates
- ✅ Recent activity feed
- ✅ Conversion rate calculations
- ✅ Live Prisma data (no mocks)

## Base URL

```
/api/businesses/{businessId}/dashboard
```

## Authentication

All endpoints require authentication and business permissions:
- `ANALYTICS_READ` - For overview, analytics, and activity endpoints
- `CALLS_READ` - For calls endpoint
- `BOOKINGS_READ` - For bookings endpoint

## Endpoints

### 1. Dashboard Overview

**Endpoint:** `GET /api/businesses/{businessId}/dashboard/overview`

**Permission:** `ANALYTICS_READ`

**Query Parameters:**
- `days` (optional): Number of days for metrics (default: 30, max: 365)
- `trendDays` (optional): Number of days for trend data (default: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "callsToday": 42,
      "totalCalls": 1248,
      "missedCallsRecovered": 23,
      "bookingsToday": 18,
      "revenueEstimate": {
        "cents": 84500,
        "formatted": "$845.00"
      },
      "conversionRate": {
        "value": 34.8,
        "formatted": "34.8%"
      }
    },
    "trend": [
      {
        "label": "Mon",
        "value": 82,
        "secondary": 44
      },
      {
        "label": "Tue",
        "value": 95,
        "secondary": 49
      }
    ],
    "activity": [
      {
        "id": "call-abc123",
        "type": "call",
        "title": "Call from +1234567890",
        "description": "Customer requested consultation",
        "time": "2 min ago",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "success",
        "metadata": {
          "callSid": "CA...",
          "duration": 180,
          "sentiment": "POSITIVE",
          "disposition": "BOOKED",
          "bookingCreated": true
        }
      }
    ],
    "breakdown": {
      "booked": 46,
      "qualified": 24,
      "resolved": 18,
      "followUp": 12,
      "total": 100
    },
    "period": {
      "days": 30,
      "trendDays": 7
    }
  }
}
```

**Metrics Explained:**
- `callsToday`: Number of calls received today
- `totalCalls`: Total calls in the period
- `missedCallsRecovered`: Missed calls that resulted in bookings
- `bookingsToday`: Number of bookings created today
- `revenueEstimate`: Estimated revenue from bookings
- `conversionRate`: Percentage of calls converted to bookings

### 2. Dashboard Calls

**Endpoint:** `GET /api/businesses/{businessId}/dashboard/calls`

**Permission:** `CALLS_READ`

**Query Parameters:**
- `days` (optional): Number of days for metrics (default: 30, max: 365)
- `limit` (optional): Number of recent calls to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "callsToday": 42,
      "totalCalls": 1248,
      "completedCalls": 1156,
      "missedCalls": 92,
      "missedCallsRecovered": 23,
      "avgDuration": "3:24"
    },
    "calls": [
      {
        "id": "uuid",
        "callSid": "CA...",
        "caller": "+1234567890",
        "customerName": "John Doe",
        "channel": "Voice",
        "intent": "Schedule consultation",
        "duration": "3:24",
        "result": "Booked",
        "sentiment": "POSITIVE",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00Z",
        "summary": "Customer wants to schedule appointment"
      }
    ],
    "breakdown": {
      "byStatus": {
        "COMPLETED": 1156,
        "NO_ANSWER": 92,
        "RINGING": 0,
        "IN_PROGRESS": 0,
        "FAILED": 0,
        "CANCELED": 0
      },
      "total": 1248
    },
    "period": {
      "days": 30,
      "startDate": "2023-12-16T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    }
  }
}
```

### 3. Dashboard Bookings

**Endpoint:** `GET /api/businesses/{businessId}/dashboard/bookings`

**Permission:** `BOOKINGS_READ`

**Query Parameters:**
- `days` (optional): Number of days for metrics (default: 30, max: 365)
- `limit` (optional): Number of recent bookings to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "bookingsToday": 18,
      "totalBookings": 432,
      "totalRevenue": {
        "cents": 84500,
        "formatted": "$845.00"
      },
      "avgRevenue": {
        "cents": 19560,
        "formatted": "$195.60"
      },
      "conversionRate": {
        "value": 34.8,
        "formatted": "34.8%"
      }
    },
    "bookings": [
      {
        "id": "uuid",
        "customer": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com",
        "service": "Consultation",
        "time": "2024-01-16T14:00:00Z",
        "status": "CONFIRMED",
        "amount": {
          "cents": 20000,
          "formatted": "$200.00"
        },
        "notes": "Customer requested afternoon slot",
        "metadata": {
          "disposition": "BOOKED",
          "sentiment": "POSITIVE"
        },
        "callLog": {
          "id": "uuid",
          "callSid": "CA...",
          "status": "COMPLETED",
          "duration": 204
        }
      }
    ],
    "breakdown": {
      "byStatus": {
        "PENDING": 45,
        "CONFIRMED": 312,
        "RESCHEDULED": 32,
        "CANCELED": 28,
        "COMPLETED": 15
      },
      "total": 432
    },
    "period": {
      "days": 30,
      "startDate": "2023-12-16T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    }
  }
}
```

### 4. Dashboard Analytics

**Endpoint:** `GET /api/businesses/{businessId}/dashboard/analytics`

**Permission:** `ANALYTICS_READ`

**Query Parameters:**
- `days` (optional): Number of days for analytics (default: 30, max: 365)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCalls": 1248,
      "completedCalls": 1156,
      "missedCalls": 92,
      "totalBookings": 432,
      "conversionRate": {
        "value": 34.8,
        "formatted": "34.8%"
      },
      "totalRevenue": {
        "cents": 84500,
        "formatted": "$845.00"
      },
      "avgRevenuePerBooking": {
        "cents": 19560,
        "formatted": "$195.60"
      }
    },
    "calls": {
      "total": 1248,
      "completed": 1156,
      "missed": 92,
      "byStatus": { ... },
      "byDay": {
        "2024-01-01": { "total": 42, "completed": 38 },
        "2024-01-02": { "total": 45, "completed": 41 }
      }
    },
    "bookings": {
      "total": 432,
      "byStatus": { ... },
      "byDay": { ... },
      "totalRevenue": 84500
    },
    "ai": {
      "total": 1156,
      "completed": 1124,
      "failed": 32,
      "byStatus": { ... },
      "avgProcessingTime": {
        "ms": 2340,
        "seconds": 2.34,
        "formatted": "2s 340ms"
      },
      "successRate": 97.2
    },
    "revenue": {
      "total": 84500,
      "average": 19560,
      "count": 432,
      "byDay": { ... }
    },
    "period": {
      "days": 30,
      "startDate": "2023-12-16T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    }
  }
}
```

### 5. Dashboard Activity

**Endpoint:** `GET /api/businesses/{businessId}/dashboard/activity`

**Permission:** `ANALYTICS_READ`

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20, max: 100)
- `type` (optional): Filter by activity type (call, booking, ai_job)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "call-abc123",
        "type": "call",
        "title": "Call from +1234567890",
        "description": "Customer requested consultation",
        "time": "2 min ago",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "success",
        "metadata": {
          "callSid": "CA...",
          "duration": 180,
          "sentiment": "POSITIVE",
          "disposition": "BOOKED",
          "bookingCreated": true
        }
      },
      {
        "id": "booking-def456",
        "type": "booking",
        "title": "New booking: John Doe",
        "description": "Consultation - CONFIRMED",
        "time": "5 min ago",
        "timestamp": "2024-01-15T10:27:00Z",
        "status": "success",
        "metadata": {
          "serviceName": "Consultation",
          "customerPhone": "+1234567890",
          "customerEmail": "john@example.com",
          "amount": 20000,
          "currency": "USD",
          "notes": "Afternoon slot"
        }
      },
      {
        "id": "ai-job-ghi789",
        "type": "ai_job",
        "title": "AI Analysis completed",
        "description": "Call CA... - gpt-4.1-mini",
        "time": "8 min ago",
        "timestamp": "2024-01-15T10:24:00Z",
        "status": "success",
        "metadata": {
          "jobId": "uuid",
          "model": "gpt-4.1-mini",
          "jobType": "CALL_ANALYSIS",
          "callerPhone": "+1234567890"
        }
      }
    ],
    "total": 30,
    "filtered": 30,
    "filter": {
      "type": null,
      "limit": 20
    }
  }
}
```

## Activity Types

### Call Activity
- `type`: "call"
- `status`: "success" (completed), "warning" (no answer), "danger" (failed), "secondary" (in progress)
- Includes call details, sentiment, and booking status

### Booking Activity
- `type`: "booking"
- `status`: "success" (confirmed/completed), "warning" (pending), "danger" (canceled), "secondary" (rescheduled)
- Includes customer info, service details, and amount

### AI Job Activity
- `type`: "ai_job"
- `status`: "success" (completed), "secondary" (running), "warning" (pending), "danger" (failed)
- Includes job details, model info, and processing time

## Metrics Calculations

### Conversion Rate
```
Conversion Rate = (Total Bookings / Completed Calls) × 100
```

### Revenue Estimate
```
Revenue = Sum of all booking amounts in period
Average Revenue = Total Revenue / Number of Bookings
```

### Missed Calls Recovered
```
Recovered = Count of NO_ANSWER calls with associated bookings
```

### AI Success Rate
```
Success Rate = (Completed AI Jobs / Total AI Jobs) × 100
```

## Time Formatting

### Relative Time
- `< 1 min`: "Just now"
- `< 1 hour`: "X min ago"
- `< 1 day`: "Xh ago"
- `< 1 week`: "Xd ago"
- `< 1 month`: "Xw ago"
- `≥ 1 month`: "Xmo ago"

### Duration
- Seconds: "Xs"
- Minutes: "Xm Ys"
- Hours: "Xh Ym Zs"

## Currency Formatting

All currency values are formatted using:
- Style: currency
- Currency: USD
- Locale: en-US

Example: `$1,234.56`

## Error Handling

### Common Errors

**Invalid Days**
```json
{
  "error": {
    "code": "invalid_days",
    "message": "Days must be between 1 and 365.",
    "details": null
  }
}
```

**Invalid Limit**
```json
{
  "error": {
    "code": "invalid_limit",
    "message": "Limit must be between 1 and 100.",
    "details": null
  }
}
```

**Unauthorized**
```json
{
  "error": {
    "code": "forbidden",
    "message": "You don't have permission to perform this action.",
    "details": null
  }
}
```

## Best Practices

1. **Use Appropriate Time Ranges**
   - Overview: 7-30 days for trends
   - Analytics: 30-90 days for insights
   - Activity: No time filter needed

2. **Implement Caching**
   - Cache metrics for 5-15 minutes
   - Invalidate on new calls/bookings

3. **Handle Pagination**
   - Use limit parameter for large datasets
   - Implement client-side pagination

4. **Real-Time Updates**
   - Poll activity endpoint every 30-60 seconds
   - Use WebSocket for live dashboards

5. **Error Boundaries**
   - Handle API errors gracefully
   - Show user-friendly messages
   - Implement retry logic

## Dashboard Integration

### Example Dashboard Component

```typescript
import { useEffect, useState } from 'react';

export function DashboardOverview({ businessId }: { businessId: string }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(
          `/api/businesses/${businessId}/dashboard/overview?days=30`
        );
        const data = await response.json();
        setMetrics(data.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 300000);
    return () => clearInterval(interval);
  }, [businessId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <MetricCard 
        label="Calls Today" 
        value={metrics.metrics.callsToday}
      />
      <MetricCard 
        label="Bookings Today" 
        value={metrics.metrics.bookingsToday}
      />
      <MetricCard 
        label="Revenue" 
        value={metrics.metrics.revenueEstimate.formatted}
      />
      <MetricCard 
        label="Conversion Rate" 
        value={metrics.metrics.conversionRate.formatted}
      />
    </div>
  );
}
```

## Support

For issues or questions, contact support@voxora.ai
