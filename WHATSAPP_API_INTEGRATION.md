# WhatsApp API Integration Guide

## Current Status
The WhatsApp OTP system is implemented but currently **logs OTP codes to the console** for development purposes. To enable real WhatsApp messaging, you need to integrate with a WhatsApp API service.

## Recommended WhatsApp API Providers

### 1. Twilio WhatsApp API (Recommended)
**Pros:** Reliable, well-documented, official WhatsApp Business API partner
**Cons:** Requires business verification for production

```javascript
// Add to supabase/functions/send-whatsapp-otp/index.ts
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., 'whatsapp:+14155238886'

async function sendWhatsAppOTP(to: string, otp: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_NUMBER,
    To: `whatsapp:${to}`,
    Body: `Your PIN reset code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`
  });

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Twilio API error: ${response.statusText}`);
  }

  return await response.json();
}
```

### 2. Meta WhatsApp Business API
**Pros:** Direct from Meta, comprehensive features
**Cons:** More complex setup, requires Facebook Business account

### 3. Alternative Services
- **360Dialog**: European WhatsApp Business API provider
- **Messagebird**: Multi-channel messaging platform
- **Infobip**: Global communications platform

## Implementation Steps

### Step 1: Choose Provider and Get Credentials
1. Sign up with your chosen provider (Twilio recommended)
2. Get your API credentials
3. Set up WhatsApp Business account if required

### Step 2: Add Environment Variables
Add these to your Supabase Edge Functions environment:

```bash
# For Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Or for other providers, add their respective credentials
```

### Step 3: Update the send-whatsapp-otp Function
Replace the console.log line in `supabase/functions/send-whatsapp-otp/index.ts`:

```javascript
// Replace this line:
console.log(`WhatsApp OTP for ${whatsappNumber}: ${otp}`)

// With actual WhatsApp sending:
try {
  await sendWhatsAppOTP(whatsappNumber, otp);
  console.log(`WhatsApp OTP sent successfully to ${whatsappNumber}`);
} catch (error) {
  console.error(`Failed to send WhatsApp OTP to ${whatsappNumber}:`, error);
  return new Response(
    JSON.stringify({ error: 'Failed to send WhatsApp message' }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

## Testing

### Development Testing
1. Use your own WhatsApp number for testing
2. Ensure you're opted into WhatsApp Business API with your provider
3. Test with the formatted phone number (+234xxxxxxxxxx)

### Production Considerations
1. **Rate Limiting**: Implement rate limiting to prevent spam
2. **Message Templates**: Use approved message templates for production
3. **Error Handling**: Handle network failures and API errors gracefully
4. **Compliance**: Ensure compliance with WhatsApp Business API policies
5. **Cost Management**: Monitor usage to manage costs

## Security Best Practices
1. Store API credentials as Supabase secrets
2. Validate phone numbers before sending
3. Implement retry logic with exponential backoff
4. Log all messaging attempts for audit purposes
5. Never log OTP codes in production

## Cost Estimation
- **Twilio**: ~$0.005-0.01 per message
- **Meta**: Varies by region, typically $0.005-0.02 per message
- Consider your expected volume for budgeting

## Support
- Test with sandbox numbers first
- Use provider-specific testing tools
- Monitor delivery rates and failed messages
- Implement fallback to SMS if WhatsApp fails