# Voxora AI Demo Data Documentation

## Overview

This document describes the demo data seeding system for Voxora AI, which creates realistic test data to make the dashboard look active and premium.

## Features

- ✅ 50 call logs with mixed statuses
- ✅ 20 bookings with ₹45,000 revenue
- ✅ 30 AI processing jobs
- ✅ 40 webhook events
- ✅ Mix of answered/missed calls
- ✅ Indian customer names
- ✅ Recent activity timeline
- ✅ Active premium subscription

## Running the Seed Script

### Prerequisites

1. Ensure database is running
2. Set up environment variables
3. Run Prisma migrations

### Execute Seed

```bash
# Run the seed script
npx tsx scripts/seed-demo-data.ts

# Or using Node
node -r ts-node/register
npx ts-node scripts/seed-demo-data.ts
```

## Seeded Data

### Business

- **Name**: Voxora AI Demo
- **Industry**: Healthcare
- **Phone**: +91987654321
- **Slug**: demo-voxora-ai
- **Subscription**: GROWTH (₹349/month, 10 seats)
- **Status**: Active with all features enabled

### Call Logs (50 records)

**Distribution:**
- Answered: ~70% (35 calls)
- Missed: ~30% (15 calls)
- Mixed statuses: COMPLETED, IN_PROGRESS, RINGING, NO_ANSWER

**Features:**
- Real Indian customer names
- Indian phone numbers (+91...)
- Mixed call directions (INBOUND/OUTBOUND)
- Realistic durations (30-600 seconds)
- AI analysis with varied dispositions
- Booking likelihood tracking
- Recording URLs
- Transcript text

**Status Breakdown:**
- COMPLETED: 35 calls (with bookings)
- IN_PROGRESS: 8 calls
- RINGING: 4 calls
- NO_ANSWER: 15 calls (missed)

### Bookings (20 records)

**Distribution:**
- Total Revenue: ₹45,000
- Average per booking: ₹2,250
- Status mix: PENDING, CONFIRMED, COMPLETED

**Features:**
- Indian customer names
- Indian phone numbers
- Realistic service names
- Varying amounts (₹2,000 - ₹5,000)
- Future dates (0-14 days)
- Email addresses
- Booking notes
- AI analysis metadata

**Service Types:**
- Consultation, Follow-up visit, New patient intake
- Emergency service, Property viewing, Listing inquiry
- Rental application, Maintenance request
- Massage, Facial treatment, Body treatment, Package booking
- Oil change, Brake service, Engine repair, Tire service, General maintenance

### AI Jobs (30 records)

**Distribution:**
- COMPLETED: 20 jobs (with analysis)
- RUNNING: 5 jobs
- PENDING: 5 jobs

**Features:**
- Realistic transcripts
- AI analysis with varied dispositions
- Booking likelihood tracking
- Sentiment analysis
- Structured notes
- Processing times
- Error handling

**Analysis Types:**
- BOOKED: 8 calls (converted to bookings)
- QUALIFIED: 6 calls (passed to staff)
- FOLLOW_UP: 10 calls (needs follow-up)
- INFO_ONLY: 6 calls (informational only)

### Webhook Events (40 records)

**Distribution:**
- Voice incoming events
- Voice status events
- Voice recording events
- Subscription charged events

**Features:**
- Mix of event types
- Realistic timestamps
- Signature verification
- Processing status tracking
- Error handling

## Data Characteristics

### Customer Names

Indian names reflecting local demographics:
- Sharma, Patel, Kumar, Singh, Verma, Gupta
- Reddy, Iyer, Nair, Joshi, Das, Rao, Kapoor
- Agarwal, Menon, Yadav, Krishnan, Devi, Verma
- Realistic distribution across calls and bookings

### Phone Numbers

Indian format (+91...):
- Random 10-digit numbers
- Valid Indian mobile ranges
- Used consistently across records

### Call Data

**Statuses:**
- COMPLETED: Successful calls with AI analysis
- NO_ANSWER: Missed calls (some recovered via bookings)
- RINGING: Calls in progress
- IN_PROGRESS: Active conversations

**Dispositions:**
- BOOKED: Call resulted in booking
- QUALIFIED: High-value lead passed to staff
- FOLLOW_UP: Requires follow-up action
- INFO_ONLY: Informational call
- ESCALATE: Needs human intervention

**Sentiments:**
- POSITIVE: Happy/enthusiastic customers
- NEUTRAL: Standard inquiries
- NEGATIVE: Complaints or issues
- URGENT: Emergency situations

### Booking Data

**Revenue:**
- Total: ₹45,000
- Average: ₹2,250 per booking
- Range: ₹2,000 - ₹5,000
- Realistic for healthcare industry

**Services:**
- Consultations (most common)
- Follow-up visits
- Emergency services
- Routine checkups
- Specialized treatments

**Statuses:**
- PENDING: Awaiting confirmation
- CONFIRMED: Scheduled and confirmed
- COMPLETED: Service provided

### AI Analysis

**Caller Intents:**
- Schedule appointment
- Inquire about services
- Emergency assistance
- Reschedule appointment
- Membership inquiry
- Pricing information
- Book consultation
- General inquiry
- Property viewing
- Service request
- Technical support

**Next Actions:**
- Schedule callback
- Send confirmation SMS
- Transfer to specialist
- Send pricing information
- Create booking
- Update CRM
- Send email confirmation
- Schedule follow-up call
- Escalate to manager
- Request payment
- Send documentation
- Schedule demo
- Update customer profile

**Structured Notes:**
3-5 relevant notes per call
- Randomly selected from predefined set
- Covers various business scenarios
- Helps with follow-up actions

## Dashboard Impact

### Metrics Displayed

**Calls Today:**
- Shows 35+ calls from today
- Mix of answered/missed
- Real-time activity

**Total Calls:**
- 50 calls in database
- Shows growth over time
- Status breakdown available

**Missed Calls Recovered:**
- 15 missed calls have bookings
- Shows recovery effectiveness
- Demonstrates AI value

**Bookings Today:**
- 20 bookings across various dates
- Shows active booking pipeline
- Revenue tracking visible

**Revenue Estimate:**
- ₹45,000 total revenue
- Shows business value
- Demonstrates premium features

**Conversion Rate:**
- Calculated from bookings/completed calls
- Shows AI effectiveness
- Demonstrates booking capture

**Recent Activity:**
- 100+ activities (calls + bookings + AI jobs)
- Shows real-time updates
- Mixed activity types
- Timeline view available

### Premium Features

**AI Call Answering:**
- Enabled via active subscription
- All 50 calls show AI analysis
- Disposition tracking visible
- Sentiment analysis available

**Booking Capture:**
- 20 bookings in database
- Shows conversion capability
- Revenue tracking active
- Customer management visible

**Advanced Analytics:**
- Call status breakdown
- Booking status breakdown
- AI job metrics
- Revenue analytics

## Usage

### Development

Run seed script to populate demo data:
```bash
npm run seed:demo
```

### Reset Demo Data

To reset and reseed:
```bash
# Delete demo business
npx prisma db execute --stdin

# Then run seed again
npm run seed:demo
```

### Customization

Modify `prisma/seed-demo-data-complete.ts` to:
- Change business details
- Adjust call distribution
- Modify booking amounts
- Add more services
- Customize AI responses

## Data Validation

All seeded data includes:
- ✅ Valid Indian phone numbers
- ✅ Realistic timestamps
- ✅ Consistent customer data
- ✅ Valid business logic
- ✅ Proper status transitions
- ✅ Realistic AI analysis
- ✅ Accurate revenue calculations

## Best Practices

1. **Development Environment**
   - Use demo data for development
   - Don't use in production
   - Reset before major changes
   - Keep data realistic

2. **Dashboard Testing**
   - Test with various time ranges
   - Verify metric calculations
   - Check activity timeline
   - Test premium feature blocking

3. **Data Consistency**
   - Maintain referential integrity
   - Use realistic timestamps
   - Keep phone formats consistent
   - Validate revenue calculations

4. **Performance**
   - Seed data in batches for large datasets
   - Use transactions for related records
   - Index frequently queried fields
   - Consider database size

## Support

For issues or questions about demo data:
- Check `DEMO_DATA_DOCUMENTATION.md`
- Review `prisma/seed-demo-data-complete.ts`
- Run seed script with verbose logging
- Check database state after seeding

## Notes

- Demo data is for development/testing only
- Production should use real customer data
- All phone numbers are fictional
- All customer data is randomly generated
- Revenue figures are for demonstration purposes
