# Voxora AI Demo Mode Documentation

## Overview

Demo mode allows you to run Voxora AI without authentication, making it perfect for:
- Development and testing
- Client demonstrations
- Sales presentations
- UI/UX development
- Feature validation

## How to Enable Demo Mode

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Enable demo mode
DEMO_MODE="true"

# Optional: Specify demo business ID
DEMO_BUSINESS_ID="demo-voxora-ai"
```

### 2. Seed Demo Data

Run the demo data seeding script:

```bash
npm run seed:demo
```

This creates:
- Demo business with active GROWTH subscription
- 50 call logs (mix of answered/missed)
- 20 bookings with ₹45,000 revenue
- 30 AI processing jobs
- 40 webhook events
- Indian customer names
- Realistic call transcripts and AI analysis

### 3. Start Development Server

```bash
npm run dev
```

## What Demo Mode Does

### Authentication Bypass

When `DEMO_MODE="true"`:
- No Supabase authentication required
- Automatic demo user creation
- Automatic demo business access
- Full permissions granted

### Demo User

- **ID**: demo-user-id
- **Email**: demo@voxora.ai
- **Name**: Demo User
- **Role**: Owner

### Demo Business

- **Slug**: demo-voxora-ai
- **Name**: Voxora AI Demo
- **Industry**: Healthcare
- **Subscription**: GROWTH (₹349/month, 10 seats)
- **Status**: Active

## Dashboard Features in Demo Mode

### Overview Page
- ✅ Calls today metrics
- ✅ Total calls statistics
- ✅ Missed calls recovered
- ✅ Bookings today
- ✅ Revenue estimate (₹45,000)
- ✅ Conversion rate
- ✅ Recent activity timeline
- ✅ Call trend data
- ✅ Outcome breakdown

### Calls Page
- ✅ Live call list
- ✅ Call status tracking
- ✅ Duration metrics
- ✅ Sentiment analysis
- ✅ Booking indicators
- ✅ AI dispositions

### Bookings Page
- ✅ Booking list
- ✅ Customer details
- ✅ Service information
- ✅ Status tracking
- ✅ Revenue totals
- ✅ Conversion metrics

### Analytics Page
- ✅ Call analytics
- ✅ Booking analytics
- ✅ Revenue analytics
- ✅ AI job metrics
- ✅ Conversion tracking

### AI Settings Page
- ✅ Business name
- ✅ Industry selection
- ✅ Voice tone
- ✅ Greeting script
- ✅ Booking questions
- ✅ Languages
- ✅ Working hours

### Billing Page
- ✅ Subscription status
- ✅ Plan details
- ✅ Payment history
- ✅ Invoice management
- ✅ Upgrade options

## Demo Data Characteristics

### Call Logs (50 records)
- 35 answered calls (70%)
- 15 missed calls (30%)
- Indian customer names
- Indian phone numbers (+91...)
- Realistic durations (30-600 seconds)
- AI analysis with varied dispositions
- Booking likelihood tracking

### Bookings (20 records)
- ₹45,000 total revenue
- Average ₹2,250 per booking
- Mix of statuses (PENDING, CONFIRMED, COMPLETED)
- Various service types
- Indian customer data
- Future dates (0-14 days)

### AI Jobs (30 records)
- 20 completed jobs
- 5 running jobs
- 5 pending jobs
- Realistic processing times
- Transcript-based analysis
- Structured notes

### Webhook Events (40 records)
- Voice incoming events
- Voice status events
- Voice recording events
- Subscription charged events
- Realistic timestamps

## Use Cases

### 1. Development

```bash
# Enable demo mode
echo 'DEMO_MODE="true"' >> .env

# Seed demo data
npm run seed:demo

# Start development
npm run dev
```

### 2. Client Demo

```bash
# Enable demo mode
echo 'DEMO_MODE="true"' >> .env

# Seed demo data
npm run seed:demo

# Build for production
npm run build

# Start production server
npm start
```

### 3. Sales Presentation

```bash
# Enable demo mode
echo 'DEMO_MODE="true"' >> .env

# Seed demo data
npm run seed:demo

# Deploy to staging
npm run deploy:staging
```

## Limitations

### Demo Mode Restrictions
- ❌ No real authentication
- ❌ No real payments
- ❌ No real webhooks
- ❌ No real Twilio calls
- ❌ No real OpenAI API calls
- ❌ Data resets on reseed

### Production Mode
To use production features:
1. Remove `DEMO_MODE="true"` from `.env`
2. Configure Supabase authentication
3. Set up real payment providers
4. Configure real Twilio integration
5. Configure real OpenAI API

## Troubleshooting

### "Demo business not found" Error

**Solution**: Run seed script first
```bash
npm run seed:demo
```

### "Unauthorized" Error

**Solution**: Check demo mode is enabled
```bash
# Verify .env has:
DEMO_MODE="true"
```

### Dashboard Shows No Data

**Solution**: Reseed demo data
```bash
npm run seed:demo
```

### Session Expired Error

**Solution**: Demo mode bypasses this, ensure it's enabled
```bash
# Verify .env has:
DEMO_MODE="true"
```

## Best Practices

### Development
1. Always use demo mode for local development
2. Reseed data when testing new features
3. Test with realistic data volumes
4. Verify all dashboard metrics
5. Check premium feature access

### Demo Preparation
1. Seed fresh demo data before demo
2. Verify all metrics display correctly
3. Test all interactive features
4. Check error handling
5. Prepare demo script/talking points

### Data Management
1. Document any custom demo data changes
2. Keep seed script version controlled
3. Test with different data volumes
4. Verify referential integrity
5. Monitor database size

## Security Notes

⚠️ **Important**: Demo mode should never be enabled in production!

- Only for development/testing
- Bypasses all authentication
- Grants full permissions
- No real data security
- Remove before deployment

## Support

For issues with demo mode:
1. Check `.env` configuration
2. Verify demo data seeded
3. Check console for errors
4. Review `DEMO_MODE_DOCUMENTATION.md`
5. Check `DEMO_DATA_DOCUMENTATION.md`

## Summary

Demo mode provides a complete, realistic Voxora AI experience without authentication:
- ✅ 50 call logs with mixed statuses
- ✅ 20 bookings with ₹45,000 revenue
- ✅ 30 AI processing jobs
- ✅ 40 webhook events
- ✅ Active GROWTH subscription
- ✅ Indian customer names
- ✅ Recent activity timeline
- ✅ Premium features enabled
- ✅ Full dashboard functionality

Perfect for development, testing, and demonstrations!
