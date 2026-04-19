# Voxora AI Backend API Documentation

## Overview

This document describes the Voxora AI backend API endpoints for business signup, workspace management, subscription handling, and onboarding.

## Authentication

All API endpoints (except public ones) require authentication via Supabase. Include the Supabase session token in the Authorization header:

```
Authorization: Bearer <your-supabase-token>
```

## Base URL

```
https://api.voxora.ai/api
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": {
    "code": "error_code",
    "message": "User-friendly error message",
    "details": { ... } // Optional
  }
}
```

## Endpoints

### Authentication

#### Bootstrap Auth
Get current user and their business memberships.

**Endpoint:** `GET /api/auth/bootstrap`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "memberships": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "business": {
        "id": "uuid",
        "slug": "business-slug",
        "name": "Business Name",
        "industry": "Technology",
        "timezone": "UTC",
        "websiteUrl": "https://...",
        "twilioPhoneNumber": "+1234567890",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Business Management

#### List Businesses
Get all businesses the authenticated user is a member of.

**Endpoint:** `GET /api/businesses`

**Authentication:** Required

**Response:**
```json
{
  "businesses": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "business": {
        "id": "uuid",
        "slug": "business-slug",
        "name": "Business Name",
        "industry": "Technology",
        "timezone": "UTC",
        "websiteUrl": "https://...",
        "twilioPhoneNumber": "+1234567890",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "subscriptions": [
          {
            "id": "uuid",
            "businessId": "uuid",
            "provider": "RAZORPAY",
            "plan": "FREE",
            "status": "ACTIVE",
            "amountCents": 0,
            "currency": "INR",
            "seats": 1,
            "currentPeriodStart": "2024-01-01T00:00:00Z",
            "currentPeriodEnd": "2024-01-31T00:00:00Z",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
          }
        ]
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Business
Create a new business workspace.

**Endpoint:** `POST /api/businesses`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Business Name",
  "slug": "business-slug",
  "industry": "Technology",
  "timezone": "UTC",
  "websiteUrl": "https://example.com",
  "twilioPhoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "business": {
    "id": "uuid",
    "slug": "business-slug",
    "name": "Business Name",
    "industry": "Technology",
    "timezone": "UTC",
    "websiteUrl": "https://example.com",
    "twilioPhoneNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00Z",
    "membership": {
      "id": "uuid",
      "businessId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "subscription": {
      "id": "uuid",
      "businessId": "uuid",
      "provider": "RAZORPAY",
      "plan": "FREE",
      "status": "ACTIVE",
      "amountCents": 0,
      "currency": "INR",
      "seats": 1,
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-01-31T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "onboarding": {
      "id": "uuid",
      "businessId": "uuid",
      "profileComplete": false,
      "billingComplete": false,
      "teamComplete": false,
      "completedAt": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### Business Signup
Create a new business with subscription and onboarding (comprehensive signup flow).

**Endpoint:** `POST /api/businesses/signup`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Business Name",
  "slug": "business-slug",
  "industry": "Technology",
  "timezone": "UTC",
  "websiteUrl": "https://example.com",
  "twilioPhoneNumber": "+1234567890"
}
```

**Response:** Same as Create Business

### Business Details

#### Get Business Details
Get details of a specific business.

**Endpoint:** `GET /api/businesses/{businessId}`

**Authentication:** Required
**Permission:** `VIEW_BUSINESS`

**Response:**
```json
{
  "business": {
    "id": "uuid",
    "slug": "business-slug",
    "name": "Business Name",
    "industry": "Technology",
    "timezone": "UTC",
    "websiteUrl": "https://example.com",
    "twilioPhoneNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Onboarding

#### Get Onboarding Status
Get the onboarding status for a business.

**Endpoint:** `GET /api/businesses/{businessId}/onboarding`

**Authentication:** Required
**Permission:** `VIEW_BUSINESS`

**Response:**
```json
{
  "onboarding": {
    "id": "uuid",
    "businessId": "uuid",
    "profileComplete": false,
    "billingComplete": false,
    "teamComplete": false,
    "completedAt": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "isComplete": false
  }
}
```

#### Update Onboarding Status
Update the onboarding status for a business.

**Endpoint:** `PATCH /api/businesses/{businessId}/onboarding`

**Authentication:** Required
**Permission:** `MANAGE_BUSINESS`

**Request Body:**
```json
{
  "profileComplete": true,
  "billingComplete": true,
  "teamComplete": false
}
```

**Response:** Same as Get Onboarding Status

### Subscription Management

#### Get Subscription
Get the current subscription for a business.

**Endpoint:** `GET /api/businesses/{businessId}/subscription`

**Authentication:** Required
**Permission:** `VIEW_BUSINESS`

**Response:**
```json
{
  "subscription": {
    "id": "uuid",
    "businessId": "uuid",
    "provider": "RAZORPAY",
    "plan": "STARTER",
    "status": "ACTIVE",
    "providerCustomerId": "cust_...",
    "providerOrderId": "order_...",
    "providerPaymentId": "pay_...",
    "providerSubscriptionId": "sub_...",
    "amountCents": 49900,
    "currency": "INR",
    "seats": 5,
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Subscription
Update or change the subscription for a business.

**Endpoint:** `POST /api/businesses/{businessId}/subscription`

**Authentication:** Required
**Permission:** `MANAGE_BUSINESS`

**Request Body:**
```json
{
  "plan": "GROWTH",
  "seats": 10,
  "amountCents": 99900,
  "currency": "INR",
  "providerCustomerId": "cust_...",
  "providerOrderId": "order_...",
  "providerPaymentId": "pay_...",
  "providerSubscriptionId": "sub_...",
  "currentPeriodStart": "2024-02-01T00:00:00Z",
  "currentPeriodEnd": "2024-03-01T00:00:00Z"
}
```

**Response:** Same as Get Subscription

### Team Management

#### List Members
Get all members of a business.

**Endpoint:** `GET /api/businesses/{businessId}/members`

**Authentication:** Required
**Permission:** `VIEW_BUSINESS`

**Response:**
```json
{
  "members": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "avatarUrl": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Invite Member
Invite a new member to the business.

**Endpoint:** `POST /api/businesses/{businessId}/members/manage`

**Authentication:** Required
**Permission:** `MANAGE_TEAM`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "membership": {
    "id": "uuid",
    "businessId": "uuid",
    "userId": "uuid",
    "role": "ADMIN",
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "fullName": null,
      "avatarUrl": null
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Member Role
Update the role of a business member.

**Endpoint:** `PATCH /api/businesses/{businessId}/members/manage?memberId={membershipId}`

**Authentication:** Required
**Permission:** `MANAGE_TEAM`

**Request Body:**
```json
{
  "role": "MANAGER"
}
```

**Response:** Same as Invite Member

#### Remove Member
Remove a member from the business.

**Endpoint:** `DELETE /api/businesses/{businessId}/members/manage?memberId={membershipId}`

**Authentication:** Required
**Permission:** `MANAGE_TEAM`

**Response:**
```json
{
  "success": true
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `authentication_required` | 401 | User must be authenticated |
| `unauthorized` | 401 | Invalid or expired authentication |
| `forbidden` | 403 | User lacks required permissions |
| `not_found` | 404 | Resource not found |
| `business_not_found` | 404 | Business not found or inaccessible |
| `validation_error` | 400 | Request validation failed |
| `conflict` | 409 | Resource conflict (e.g., duplicate slug) |
| `slug_taken` | 409 | Business slug already exists |
| `already_member` | 409 | User is already a business member |
| `internal_error` | 500 | Internal server error |
| `rate_limit_exceeded` | 429 | Too many requests |

## Permissions

| Permission | Description |
|------------|-------------|
| `VIEW_BUSINESS` | View business details |
| `MANAGE_BUSINESS` | Manage business settings |
| `MANAGE_TEAM` | Manage team members |
| `VIEW_ANALYTICS` | View business analytics |
| `MANAGE_CALLS` | Manage call logs |
| `MANAGE_BOOKINGS` | Manage bookings |

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Default limits:
- 100 requests per minute per user
- 1000 requests per hour per user

Exceeding these limits will result in a `429 Too Many Requests` response.

## Webhooks

### Twilio Webhooks

#### Voice Webhook
Handle incoming voice calls from Twilio.

**Endpoint:** `POST /api/webhooks/twilio/voice`

**Authentication:** None (Twilio signature validation)

#### Status Webhook
Handle call status updates from Twilio.

**Endpoint:** `POST /api/webhooks/twilio/status`

**Authentication:** None (Twilio signature validation)

#### Recording Webhook
Handle call recordings from Twilio.

**Endpoint:** `POST /api/webhooks/twilio/recording`

**Authentication:** None (Twilio signature validation)

### Razorpay Webhooks

#### Payment Webhook
Handle payment events from Razorpay.

**Endpoint:** `POST /api/webhooks/razorpay`

**Authentication:** None (Razorpay signature validation)

## Support

For API support, contact support@voxora.ai
