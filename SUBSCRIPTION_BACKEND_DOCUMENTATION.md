# Voxora AI Subscription Backend Documentation

## Overview

The Voxora AI subscription backend provides complete subscription management using Razorpay, including subscription creation, upgrades, cancellations, and webhook processing.

## Features

- ✅ Start subscription
- ✅ Upgrade plan
- ✅ Cancel subscription
- ✅ Webhook payment success
- ✅ Store ACTIVE / FAILED / CANCELED status
- ✅ Block premium features if unpaid

## Architecture

### Components

1. **Subscription Service** - Core subscription logic
2. **Razorpay Integration** - Payment processing
3. **Webhook Handler** - Payment event processing
4. **Subscription API** - RESTful endpoints
5. **Feature Blocking** - Premium access control

## Subscription Plans

### Available Plans

| Plan | Name | Price/Seat | Seats | Call Limit | Features |
|-------|--------|-------------|-------|------------|----------|
| FREE | Free | ₹0 | 1 | 100 | Basic dashboards, Single location, Email support |
| STARTER | Starter | ₹149 | 3 | 500 | AI call answering, Booking capture, Missed call recovery |
| GROWTH | Growth | ₹349 | 10 | 2000 | CRM sync, Advanced analytics, Role permissions |
| SCALE | Scale | ₹999 | 50 | Unlimited | Unlimited locations, Priority support, Custom integrations |

## API Endpoints

### Get Subscription Status

**Endpoint:** `GET /api/businesses/{businessId}/subscription/manage`

**Authentication:** Required
**Permission:** `BILLING_READ`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "hasSubscription": true,
      "status": "ACTIVE",
      "plan": "GROWTH",
      "planName": "Growth",
      "amountCents": 34900,
      "currency": "INR",
      "seats": 10,
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "features": [
        "CRM sync",
        "Advanced analytics",
        "Role permissions"
      ],
      "isActive": true,
      "isTrialing": false,
      "isPastDue": false,
      "isCanceled": false,
      "isExpired": false
    }
  }
}
```

### Create Subscription

**Endpoint:** `POST /api/businesses/{businessId}/subscription/manage`

**Authentication:** Required
**Permission:** `BILLING_WRITE`

**Request Body:**
```json
{
  "plan": "STARTER",
  "seats": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "businessId": "uuid",
      "provider": "RAZORPAY",
      "plan": "STARTER",
      "status": "PENDING",
      "providerCustomerId": "cust_...",
      "providerOrderId": "order_...",
      "providerSubscriptionId": "sub_...",
      "amountCents": 44700,
      "currency": "INR",
      "seats": 3,
      "currentPeriodStart": "2024-01-15T10:30:00Z",
      "currentPeriodEnd": "2024-02-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "shortUrl": "https://rzp.io/...",
    "message": "Subscription created successfully. Complete payment to activate."
  }
}
```

### Upgrade Subscription

**Endpoint:** `PATCH /api/businesses/{businessId}/subscription/manage`

**Authentication:** Required
**Permission:** `BILLING_WRITE`

**Request Body:**
```json
{
  "plan": "GROWTH",
  "seats": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "businessId": "uuid",
      "provider": "RAZORPAY",
      "plan": "GROWTH",
      "status": "PENDING",
      "providerCustomerId": "cust_...",
      "providerOrderId": "order_...",
      "providerSubscriptionId": "sub_...",
      "amountCents": 349000,
      "currency": "INR",
      "seats": 10,
      "currentPeriodStart": "2024-02-01T00:00:00Z",
      "currentPeriodEnd": "2024-03-01T00:00:00Z",
      "createdAt": "2024-01-20T14:30:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    },
    "shortUrl": "https://rzp.io/...",
    "message": "Subscription upgrade initiated. Complete payment to activate new plan."
  }
}
```

### Cancel Subscription

**Endpoint:** `DELETE /api/businesses/{businessId}/subscription/manage?reason={reason}`

**Authentication:** Required
**Permission:** `BILLING_WRITE`

**Query Parameters:**
- `reason` (optional): Cancellation reason

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "businessId": "uuid",
      "provider": "RAZORPAY",
      "plan": "GROWTH",
      "status": "CANCELED",
      "providerCustomerId": "cust_...",
      "providerSubscriptionId": "sub_...",
      "amountCents": 349000,
      "currency": "INR",
      "seats": 10,
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    },
    "canceledAt": "2024-01-20T14:30:00Z",
    "message": "Subscription canceled successfully. Access continues until end of billing period."
  }
}
```

### Get Billing Plans

**Endpoint:** `GET /api/billing/plans`

**Query Parameters:**
- `includeFeatures` (optional): Include feature lists (true/false)
- `plan` (optional): Filter by specific plan

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "plan": "FREE",
        "name": "Free",
        "amountMinor": 0,
        "currency": "INR",
        "amountMajor": 0,
        "seatsIncluded": 1,
        "callLimit": 100,
        "features": [
          "Basic dashboards",
          "Single location",
          "Email support"
        ]
      },
      {
        "plan": "STARTER",
        "name": "Starter",
        "amountMinor": 14900,
        "currency": "INR",
        "amountMajor": 149,
        "seatsIncluded": 3,
        "callLimit": 500,
        "features": [
          "AI call answering",
          "Booking capture",
          "Missed call recovery"
        ]
      },
      {
        "plan": "GROWTH",
        "name": "Growth",
        "amountMinor": 34900,
        "currency": "INR",
        "amountMajor": 349,
        "seatsIncluded": 10,
        "callLimit": 2000,
        "features": [
          "CRM sync",
          "Advanced analytics",
          "Role permissions"
        ]
      },
      {
        "plan": "SCALE",
        "name": "Scale",
        "amountMinor": 99900,
        "currency": "INR",
        "amountMajor": 999,
        "seatsIncluded": 50,
        "callLimit": null,
        "features": [
          "Unlimited locations",
          "Priority support",
          "Custom integrations"
        ]
      }
    ],
    "currency": "INR"
  }
}
```

## Webhook Events

### Payment Success

**Event:** `payment.captured`

**Payload:**
```json
{
  "id": "pay_...",
  "entity": "payment",
  "amount": 14900,
  "currency": "INR",
  "status": "captured",
  "order_id": "order_...",
  "invoice_id": "inv_...",
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": true,
  "description": "Starter Plan - 3 seats",
  "card_id": "card_...",
  "bank": "",
  "wallet": "",
  "vpa": "",
  "email": "user@example.com",
  "contact": "9876543210",
  "notes": "{"businessId":"uuid","plan":"STARTER","seats":3}",
  "fee": 0,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "error_source": null,
  "error_step": null,
  "created_at": 1705310400
}
```

**Processing:**
- Update subscription status to ACTIVE
- Store payment ID
- Record payment timestamp

### Payment Failed

**Event:** `payment.failed`

**Payload:**
```json
{
  "id": "pay_...",
  "entity": "payment",
  "amount": 14900,
  "currency": "INR",
  "status": "failed",
  "order_id": "order_...",
  "error_code": "CARD_DECLINED",
  "error_description": "Your card was declined",
  "notes": "{"businessId":"uuid","plan":"STARTER","seats":3}"
}
```

**Processing:**
- Update subscription status to PENDING
- Record failure reason
- Store error details

### Subscription Charged

**Event:** `subscription.charged`

**Payload:**
```json
{
  "id": "sub_...",
  "entity": "subscription",
  "plan_id": "plan_STARTER_001",
  "status": "active",
  "current_start": 1705310400,
  "current_end": 1707986400,
  "customer_id": "cust_...",
  "created_at": 1705310400,
  "started_at": 1705310400,
  "ended_at": null,
  "quantity": 3,
  "notes": "{"businessId":"uuid","plan":"STARTER","seats":3}",
  "payment_source": "razorpay",
  "customer_notified": true
}
```

**Processing:**
- Update subscription status to ACTIVE
- Set billing period dates
- Record subscription details

### Subscription Cancelled

**Event:** `subscription.cancelled`

**Payload:**
```json
{
  "id": "sub_...",
  "entity": "subscription",
  "plan_id": "plan_GROWTH_001",
  "status": "cancelled",
  "customer_id": "cust_...",
  "created_at": 1705310400,
  "started_at": 1705310400,
  "ended_at": 1707986400,
  "quantity": 10,
  "cancel_at_cycle_end": 1,
  "cancellation_reason": "Requested by customer",
  "notes": "{"businessId":"uuid","plan":"GROWTH","seats":10}"
}
```

**Processing:**
- Update subscription status to CANCELED
- Record cancellation reason
- Store cancellation timestamp

## Subscription Status

### Status Values

| Status | Description | Premium Access |
|---------|-------------|----------------|
| PENDING | Payment in progress | Blocked |
| TRIALING | Trial period | Allowed |
| ACTIVE | Fully paid | Allowed |
| PAST_DUE | Payment overdue | Blocked |
| CANCELED | User cancelled | Blocked (after period end) |
| EXPIRED | Period ended | Blocked |

### Status Transitions

```
PENDING → TRIALING → ACTIVE → PAST_DUE → CANCELED
                ↓
              EXPIRED
```

## Feature Blocking

### Premium Features

- AI call answering
- Booking capture
- Missed call recovery
- CRM sync
- Advanced analytics
- Role permissions
- Unlimited locations
- Priority support
- Custom integrations

### Access Control

```typescript
const { hasPremium, canUseAI, canUseAdvancedAnalytics } = await hasPremiumFeatures(businessId);

if (!hasPremium || !isActive) {
  // Block premium features
  return error("Premium subscription required");
}
```

## Error Handling

### Common Errors

**Subscription Exists**
```json
{
  "error": {
    "code": "subscription_exists",
    "message": "Business already has an active subscription. Use upgrade endpoint to change plans.",
    "details": null
  }
}
```

**No Active Subscription**
```json
{
  "error": {
    "code": "no_active_subscription",
    "message": "No active subscription found.",
    "details": null
  }
}
```

**Invalid Plan**
```json
{
  "error": {
    "code": "invalid_plan",
    "message": "Invalid plan: UNKNOWN",
    "details": null
  }
}
```

## Best Practices

1. **Subscription Creation**
   - Check for existing active subscriptions
   - Create Razorpay customer if needed
   - Store customer ID for future use
   - Set initial status to PENDING

2. **Plan Upgrades**
   - Cancel current subscription
   - Create new subscription
   - Maintain access during transition
   - Update billing period dates

3. **Cancellations**
   - Cancel at end of billing cycle
   - Allow access until period end
   - Record cancellation reason
   - Update status immediately

4. **Webhook Processing**
   - Verify Razorpay signature
   - Use idempotency keys
   - Process events in order
   - Update subscription status
   - Record all metadata

5. **Feature Blocking**
   - Check subscription status before allowing features
   - Block premium features for unpaid accounts
   - Show upgrade prompts for free users
   - Graceful degradation

## Security

### Razorpay Signature Verification

All webhooks verify Razorpay signatures:

```typescript
if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
  return new Response("Invalid Razorpay signature", { status: 403 });
}
```

### Idempotency

Use event IDs to prevent duplicate processing:

```typescript
const existing = await prisma.webhookEvent.findUnique({
  where: {
    provider_externalEventId: {
      provider: "RAZORPAY",
      externalEventId: eventId,
    },
  },
});

if (existing?.status === "PROCESSED") {
  return new Response("OK", { status: 200 });
}
```

## Testing

### Test Scenarios

1. **New Subscription**
   - Create subscription with FREE plan
   - Verify PENDING status
   - Check customer creation

2. **Plan Upgrade**
   - Upgrade from STARTER to GROWTH
   - Verify old subscription marked CANCELED
   - Verify new subscription created

3. **Subscription Cancellation**
   - Cancel active subscription
   - Verify CANCELED status
   - Check access continues until period end

4. **Payment Webhook**
   - Send payment.captured event
   - Verify ACTIVE status
   - Check premium features enabled

5. **Feature Blocking**
   - Access premium feature with FREE plan
   - Verify access denied
   - Upgrade to STARTER
   - Verify access granted

## Support

For subscription issues, contact support@voxora.ai
