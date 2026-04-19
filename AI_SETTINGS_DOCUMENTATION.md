# Voxora AI Settings Backend Documentation

## Overview

The Voxora AI Settings backend provides comprehensive configuration options for business owners to customize their AI voice assistant behavior, including business details, voice tone, greeting scripts, booking questions, languages, and working hours.

## Features

- ✅ Business name configuration
- ✅ Industry settings
- ✅ Voice tone selection
- ✅ Custom greeting scripts
- ✅ Booking questions configuration
- ✅ Multi-language support
- ✅ Working hours management
- ✅ Industry presets
- ✅ GET + POST endpoints

## Database Schema

### BusinessAISettings Model

```prisma
model BusinessAISettings {
  id                String   @id @default(uuid()) @db.Uuid
  businessId        String   @unique @db.Uuid
  businessName      String   @default("Voxora AI")
  industry          String?
  voiceTone        String   @default("professional")
  greetingScript    String   @default("Hello, you have reached {businessName}. How can I help you today?")
  bookingQuestions  Json     @default("[]")
  languages         Json     @default("["en"]")
  workingHours      Json     @default("[]")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  business          Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([businessId])
}
```

## API Endpoints

### Get AI Settings

**Endpoint:** `GET /api/businesses/{businessId}/ai-settings`

**Authentication:** Required
**Permission:** `BUSINESS_WRITE`

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "id": "uuid",
      "businessId": "uuid",
      "businessName": "Medical Reception",
      "industry": "Healthcare",
      "voiceTone": "professional",
      "greetingScript": "Hello, you have reached Medical Reception. How can I help you schedule your appointment today?",
      "bookingQuestions": [
        {
          "text": "What type of appointment do you need?",
          "type": "multiple_choice",
          "options": ["General consultation", "Follow-up visit", "New patient intake", "Emergency"]
        },
        {
          "text": "Do you have insurance?",
          "type": "yes_no"
        }
      ],
      "languages": ["en", "es"],
      "workingHours": [
        {
          "day": "monday",
          "start": "09:00",
          "end": "17:00",
          "enabled": true
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "defaults": {
      "businessName": "Voxora AI",
      "voiceTone": "professional",
      "greetingScript": "Hello, you have reached {businessName}. How can I help you today?",
      "bookingQuestions": [],
      "languages": ["en"],
      "workingHours": []
    }
  }
}
```

### Update AI Settings

**Endpoint:** `POST /api/businesses/{businessId}/ai-settings`

**Authentication:** Required
**Permission:** `BUSINESS_WRITE`

**Request Body:**
```json
{
  "businessName": "Medical Reception",
  "industry": "Healthcare",
  "voiceTone": "professional",
  "greetingScript": "Hello, you have reached {businessName}. How can I help you schedule your appointment today?",
  "bookingQuestions": [
    {
      "text": "What type of appointment do you need?",
      "type": "multiple_choice",
      "options": ["General consultation", "Follow-up visit", "New patient intake", "Emergency"]
    },
    {
      "text": "Do you have insurance?",
      "type": "yes_no"
    }
  ],
  "languages": ["en", "es"],
  "workingHours": [
    {
      "day": "monday",
      "start": "09:00",
      "end": "17:00",
      "enabled": true
    },
    {
      "day": "tuesday",
      "start": "09:00",
      "end": "17:00",
      "enabled": true
    },
    {
      "day": "wednesday",
      "start": "09:00",
      "end": "17:00",
      "enabled": true
    },
    {
      "day": "thursday",
      "start": "09:00",
      "end": "17:00",
      "enabled": true
    },
    {
      "day": "friday",
      "start": "09:00",
      "end": "17:00",
      "enabled": true
    },
    {
      "day": "saturday",
      "start": "10:00",
      "end": "14:00",
      "enabled": true
    },
    {
      "day": "sunday",
      "start": "10:00",
      "end": "14:00",
      "enabled": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": { ... },
    "created": true
  }
}
```

**Validation Rules:**
- `businessName`: 2-120 characters
- `voiceTone`: Must be one of ["professional", "friendly", "casual", "formal", "warm"]
- `greetingScript`: 10-500 characters
- `bookingQuestions`: Array with valid question objects
  - `text`: 5-200 characters
  - `type`: Must be "text", "multiple_choice", or "yes_no"
  - `options`: Array of strings (required for "multiple_choice")
- `languages`: Array of valid language codes ["en", "es", "hi", "ar", "fr", "de", "zh", "ja", "ko"]
- `workingHours`: Array with valid day objects
  - `day`: Must be one of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  - `start`: Valid time format HH:MM
  - `end`: Valid time format HH:MM, must be after start
  - `enabled`: Boolean (optional)

### Get Industry Presets

**Endpoint:** `GET /api/businesses/{businessId}/ai-settings/presets`

**Authentication:** Required
**Permission:** `BUSINESS_WRITE`

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": {
      "healthcare": {
        "businessName": "Medical Reception",
        "industry": "Healthcare",
        "voiceTone": "professional",
        "greetingScript": "Hello, you have reached {businessName}. How can I help you schedule your appointment today?",
        "bookingQuestions": [ ... ],
        "languages": ["en", "es"],
        "workingHours": [ ... ]
      },
      "dental": { ... },
      "realty": { ... },
      "spa": { ... },
      "automotive": { ... }
    },
    "availableIndustries": ["healthcare", "dental", "realty", "spa", "automotive"]
  }
}
```

### Apply Industry Preset

**Endpoint:** `POST /api/businesses/{businessId}/ai-settings/presets?industry={industry}`

**Authentication:** Required
**Permission:** `BUSINESS_WRITE`

**Query Parameters:**
- `industry` (required): Industry preset to apply

**Response:**
```json
{
  "success": true,
  "data": {
    "preset": {
      "businessName": "Medical Reception",
      "industry": "Healthcare",
      "voiceTone": "professional",
      "greetingScript": "Hello, you have reached {businessName}. How can I help you schedule your appointment today?",
      "bookingQuestions": [ ... ],
      "languages": ["en", "es"],
      "workingHours": [ ... ]
    },
    "industry": "healthcare"
  }
}
```

## Settings Fields

### Business Name
- **Description**: Name displayed to callers
- **Type**: String
- **Constraints**: 2-120 characters
- **Default**: "Voxora AI"
- **Placeholder**: `{businessName}` in greeting script

### Industry
- **Description**: Business industry type
- **Type**: String
- **Constraints**: 2-120 characters
- **Used For**: Industry-specific presets and AI training

### Voice Tone
- **Description**: AI voice personality
- **Type**: Enum
- **Options**:
  - `professional`: Formal and business-like
  - `friendly`: Warm and approachable
  - `casual`: Relaxed and informal
  - `formal`: Very professional and serious
  - `warm`: Caring and empathetic
- **Default**: "professional"

### Greeting Script
- **Description**: Custom greeting message
- **Type**: String
- **Constraints**: 10-500 characters
- **Placeholders**:
  - `{businessName}`: Replaced with business name
- **Default**: "Hello, you have reached {businessName}. How can I help you today?"

### Booking Questions
- **Description**: Questions asked during booking flow
- **Type**: Array of objects
- **Question Types**:
  - `text`: Open-ended text response
  - `multiple_choice`: Select from predefined options
  - `yes_no`: Yes/No response
- **Question Structure**:
```json
{
  "text": "Question text",
  "type": "multiple_choice",
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

### Languages
- **Description**: Supported languages for AI
- **Type**: Array of language codes
- **Supported Codes**:
  - `en`: English
  - `es`: Spanish
  - `hi`: Hindi
  - `ar`: Arabic
  - `fr`: French
  - `de`: German
  - `zh`: Chinese
  - `ja`: Japanese
  - `ko`: Korean
- **Default**: ["en"]

### Working Hours
- **Description**: Business operating hours
- **Type**: Array of day objects
- **Day Structure**:
```json
{
  "day": "monday",
  "start": "09:00",
  "end": "17:00",
  "enabled": true
}
```
- **Days**: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- **Time Format**: HH:MM (24-hour format)
- **Enabled**: Boolean to indicate if business is open

## Industry Presets

### Healthcare
- Professional tone
- Medical-focused questions
- English + Spanish support
- Mon-Sat: 9AM-5PM, Sun: 10AM-2PM

### Dental
- Warm tone
- Dental service questions
- English support
- Mon-Fri: 8AM-6PM, Sat: 9AM-3PM, Sun: Closed

### Real Estate
- Professional tone
- Property-focused questions
- English + Spanish support
- Mon-Fri: 9AM-7PM, Sat-Sun: 10AM-5PM

### Spa & Wellness
- Warm tone
- Wellness-focused questions
- English support
- Mon-Fri: 10AM-8PM, Sat: 9AM-6PM, Sun: 10AM-5PM

### Automotive
- Friendly tone
- Vehicle service questions
- English + Spanish support
- Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: 10AM-3PM

## Error Handling

### Validation Errors

**Invalid Business Name**
```json
{
  "error": {
    "code": "validation_error",
    "message": "AI settings validation failed.",
    "details": {
      "errors": ["Business name must be between 2 and 120 characters"]
    }
  }
}
```

**Invalid Voice Tone**
```json
{
  "error": {
    "code": "validation_error",
    "message": "AI settings validation failed.",
    "details": {
      "errors": ["Invalid voice tone. Must be one of: professional, friendly, casual, formal, warm"]
    }
  }
}
```

**Invalid Working Hours**
```json
{
  "error": {
    "code": "validation_error",
    "message": "AI settings validation failed.",
    "details": {
      "errors": ["Working hours entry 1: Start time must be before end time"]
    }
  }
}
```

**Missing Industry Parameter**
```json
{
  "error": {
    "code": "missing_industry",
    "message": "Industry parameter is required.",
    "details": null
  }
}
```

**Preset Not Found**
```json
{
  "error": {
    "code": "preset_not_found",
    "message": "No preset found for industry: unknown",
    "details": null
  }
}
```

## Best Practices

1. **Use Industry Presets**
   - Start with preset for your industry
   - Customize questions and hours as needed
   - Test greeting script before going live

2. **Greeting Script Tips**
   - Keep it concise (10-50 words)
   - Use {businessName} placeholder
   - Include clear call-to-action
   - Test with different voice tones

3. **Booking Questions**
   - Limit to 3-5 questions
   - Start with most important
   - Use multiple choice for common options
   - Keep questions simple and clear

4. **Language Selection**
   - Start with primary language
   - Add secondary languages as needed
   - Ensure questions work in all languages
   - Consider regional variations

5. **Working Hours**
   - Set accurate hours for each day
   - Use enabled flag for closed days
   - Consider holiday schedules
   - Update promptly when hours change

6. **Voice Tone Selection**
   - Match tone to brand personality
   - Consider customer demographics
   - Test with real calls
   - Adjust based on feedback

## Integration Examples

### Fetch Settings
```typescript
const response = await fetch(
  `/api/businesses/${businessId}/ai-settings`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { data } = await response.json();
const settings = data.settings;
```

### Update Settings
```typescript
const response = await fetch(
  `/api/businesses/${businessId}/ai-settings`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessName: "My Business",
      voiceTone: "professional",
      greetingScript: "Hello, you have reached My Business. How can I help?",
      bookingQuestions: [
        {
          text: "What service do you need?",
          type: "multiple_choice",
          options: ["Service A", "Service B", "Service C"],
        },
      ],
      languages: ["en", "es"],
      workingHours: [
        { day: "monday", start: "09:00", end: "17:00", enabled: true },
        // ... other days
      ],
    }),
  }
);

const { data } = await response.json();
```

### Apply Preset
```typescript
const response = await fetch(
  `/api/businesses/${businessId}/ai-settings/presets?industry=healthcare`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { data } = await response.json();
const preset = data.preset;

// Then update settings with preset
await fetch(`/api/businesses/${businessId}/ai-settings`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(preset),
});
```

## Support

For issues or questions, contact support@voxora.ai
