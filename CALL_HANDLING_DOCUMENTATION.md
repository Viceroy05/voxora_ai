# Voxora AI Call Handling Backend Documentation

## Overview

This document describes the Voxora AI call handling backend system, which processes incoming phone calls through Twilio, records conversations, transcribes audio, and uses AI to analyze call content.

## Architecture

### Components

1. **Twilio Webhooks** - Receive call events from Twilio
2. **Call Handling Service** - Process and manage call logs
3. **AI Processing Service** - Analyze call transcripts with OpenAI
4. **Database** - Store call logs, recordings, and AI analysis

### Flow

```
Incoming Call → Twilio → Voice Webhook → CallLog Creation
                    ↓
               Recording Webhook → Transcript → AI Processing
                    ↓
               Status Webhook → Update Call Status
```

## Webhook Endpoints

### 1. Voice Webhook

**Endpoint:** `POST /api/webhooks/twilio/voice`

**Purpose:** Handle incoming voice calls

**Request:**
- Twilio signature verification required
- Call parameters (CallSid, From, To, Direction, etc.)

**Response:**
- TwiML XML with greeting and recording instructions

**Features:**
- Retry-safe processing (checks if already processed)
- Creates CallLog record
- Assigns business by phone number
- Records call start time
- Error handling with fallback TwiML

### 2. Status Webhook

**Endpoint:** `POST /api/webhooks/twilio/status`

**Purpose:** Handle call status updates

**Request:**
- Twilio signature verification required
- Status parameters (CallSid, CallStatus, CallDuration, etc.)

**Response:**
- HTTP 200 OK

**Features:**
- Retry-safe processing
- Updates call status (RINGING → IN_PROGRESS → COMPLETED)
- Records call duration
- Sets answered and completed timestamps
- Maps Twilio statuses to internal enum

### 3. Recording Webhook

**Endpoint:** `POST /api/webhooks/twilio/recording`

**Purpose:** Handle call recordings and transcripts

**Request:**
- Twilio signature verification required
- Recording parameters (RecordingUrl, TranscriptionText, etc.)

**Response:**
- HTTP 200 OK

**Features:**
- Retry-safe processing
- Stores recording URL
- Stores transcript text
- Triggers AI processing if transcript available
- Creates AI processing job

## Call Handling Service

### Functions

#### `processIncomingVoiceWebhook(params)`
Processes incoming voice webhook events.

**Parameters:**
- `params`: Twilio voice parameters

**Returns:**
- `business`: Business record
- `callLog`: Created/updated call log

**Features:**
- Finds business by phone number
- Creates/updates call log
- Sets initial status to RINGING

#### `processCallStatusWebhook(params)`
Processes call status updates.

**Parameters:**
- `params`: Twilio status parameters

**Returns:**
- `business`: Business record
- `callLog`: Updated call log

**Features:**
- Maps Twilio status to internal enum
- Updates call duration
- Sets timestamps based on status

#### `processRecordingWebhook(params)`
Processes recording and transcript events.

**Parameters:**
- `params`: Twilio recording parameters

**Returns:**
- `business`: Business record
- `callLog`: Updated call log
- `hasTranscript`: Boolean indicating transcript availability

**Features:**
- Stores recording URL
- Stores transcript text
- Updates call status

#### `triggerAIProcessing(businessId, callLogId, transcriptText)`
Triggers AI processing for a call.

**Parameters:**
- `businessId`: Business UUID
- `callLogId`: Call log UUID
- `transcriptText`: Optional transcript text

**Returns:**
- `job`: AI processing job
- `created`: Boolean indicating if job was created

**Features:**
- Checks for existing jobs
- Creates PENDING job
- Includes transcript and recording URL

#### `upsertCallLog(callSid, data, businessId)`
Creates or updates call log with retry-safe logic.

**Parameters:**
- `callSid`: Twilio call SID
- `data`: Partial call log data
- `businessId`: Business UUID

**Returns:**
- Call log record

**Features:**
- Upsert operation (create or update)
- Retry-safe (idempotent)

## AI Processing Service

### Functions

#### `processAIJob(jobId)`
Processes a single AI job.

**Parameters:**
- `jobId`: AI job UUID

**Returns:**
- `job`: Updated AI job
- `callLog`: Updated call log

**Features:**
- Updates job status to RUNNING
- Analyzes transcript with OpenAI
- Stores results in job and call log
- Creates booking if analysis indicates
- Handles errors gracefully

#### `processPendingJobs(limit)`
Processes multiple pending AI jobs.

**Parameters:**
- `limit`: Maximum number of jobs to process (default: 10)

**Returns:**
- Array of processing results

**Features:**
- Processes jobs in order
- Handles errors individually
- Returns comprehensive results

#### `getJobStatus(jobId)`
Gets the status of an AI job.

**Parameters:**
- `jobId`: AI job UUID

**Returns:**
- Job status object

**Features:**
- Returns job details
- Includes completion status

## API Endpoints

### AI Job Management

#### Get Job Status
**Endpoint:** `GET /api/ai/jobs/{jobId}`

**Response:**
```json
{
  "job": {
    "id": "uuid",
    "businessId": "uuid",
    "callLogId": "uuid",
    "status": "COMPLETED",
    "createdAt": "2024-01-01T00:00:00Z",
    "startedAt": "2024-01-01T00:00:01Z",
    "completedAt": "2024-01-01T00:00:05Z",
    "errorMessage": null,
    "hasOutput": true
  }
}
```

#### Process Job
**Endpoint:** `POST /api/ai/jobs/{jobId}`

**Response:**
```json
{
  "job": { ... },
  "callLog": { ... }
}
```

#### Process Pending Jobs
**Endpoint:** `POST /api/ai/jobs/process-pending`

**Request:**
```json
{
  "limit": 10
}
```

**Response:**
```json
{
  "processed": 5,
  "results": [
    {
      "jobId": "uuid",
      "status": "COMPLETED",
      "result": { ... }
    }
  ]
}
```

## Data Models

### CallLog

```typescript
{
  id: string;
  businessId: string;
  callSid: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "QUEUED" | "RINGING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "NO_ANSWER" | "CANCELED";
  callerPhone: string;
  recipientPhone: string;
  customerName?: string;
  durationSeconds?: number;
  recordingUrl?: string;
  transcriptText?: string;
  summaryText?: string;
  aiAnalysis?: any;
  rawPayload?: any;
  startedAt: Date;
  answeredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### AIProcessingJob

```typescript
{
  id: string;
  businessId: string;
  callLogId: string;
  jobType: "CALL_ANALYSIS";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  model: string;
  promptVersion: string;
  inputPayload: {
    transcriptText: string;
    recordingUrl?: string;
  };
  outputPayload?: {
    summary: string;
    disposition: "BOOKED" | "QUALIFIED" | "FOLLOW_UP" | "ESCALATE" | "INFO_ONLY";
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT";
    callerIntent: string;
    nextAction: string;
    bookingLikely: boolean;
    extractedContact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    structuredNotes: string[];
  };
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

### WebhookEvent

```typescript
{
  id: string;
  businessId?: string;
  provider: "TWILIO" | "RAZORPAY";
  eventType: string;
  externalEventId: string;
  signature?: string;
  payload: any;
  status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
  errorMessage?: string;
  receivedAt: Date;
  processedAt?: Date;
}
```

## Error Handling

### Webhook Errors

All webhooks implement comprehensive error handling:

1. **Signature Verification** - Returns 403 if invalid
2. **Business Lookup** - Returns error if business not found
3. **Processing Errors** - Logs error and returns 500
4. **Retry Safety** - Checks if already processed before proceeding

### AI Processing Errors

AI processing includes error handling:

1. **Job Status Updates** - Jobs marked as FAILED on error
2. **Error Messages** - Detailed error messages stored
3. **Graceful Degradation** - Recording webhook succeeds even if AI fails
4. **Individual Job Failure** - One failed job doesn't stop others

## Retry-Safe Logic

All webhooks implement retry-safe processing:

1. **Unique Event IDs** - Each webhook has unique externalEventId
2. **Status Checking** - Checks if event already processed
3. **Idempotent Operations** - Upsert operations for all records
4. **Duplicate Prevention** - AI jobs checked before creation

## Security

### Twilio Signature Verification

All webhooks verify Twilio signatures:

```typescript
if (!verifyTwilioRequest(request.url, signature, params)) {
  return new Response("Invalid Twilio signature", { status: 403 });
}
```

### Authentication

Internal API endpoints require authentication:

```typescript
await requireAuthContext();
```

## Monitoring

### Logging

All operations include comprehensive logging:

```typescript
console.error("[Voice Webhook Error]", error);
console.log(`[Recording Webhook] AI processing job created: ${job.id}`);
```

### Webhook Event Tracking

All webhooks create event records:

- Status tracking (RECEIVED, PROCESSED, FAILED)
- Timestamps for received and processed
- Error messages for failures

## Best Practices

1. **Always verify Twilio signatures** - Prevents webhook spoofing
2. **Use retry-safe logic** - Handles duplicate webhooks gracefully
3. **Log all errors** - Enables debugging and monitoring
4. **Handle AI failures gracefully** - Don't fail webhooks if AI fails
5. **Process jobs in batches** - Limits resource usage
6. **Monitor job status** - Track AI processing progress
7. **Store raw payloads** - Enables debugging and replay

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check Twilio webhook URL configuration
   - Verify server is accessible from internet
   - Check firewall rules

2. **Signature Verification Failed**
   - Verify AUTH_TOKEN environment variable
   - Check URL matches Twilio configuration
   - Ensure request body is not modified

3. **Business Not Found**
   - Verify twilioPhoneNumber in database
   - Check phone number format (E.164)
   - Ensure business is active

4. **AI Processing Failed**
   - Check OpenAI API key
   - Verify transcript text is available
   - Check AI job status for error details

5. **Duplicate Webhooks**
   - System handles duplicates gracefully
   - Check webhook event records for status
   - Verify retry-safe logic is working

## Support

For issues or questions, contact support@voxora.ai
