# QR Code Generator API - Complete Documentation

## 🔌 API Endpoint
```
POST https://pk-toolbox.vercel.app/api/qr-generate
GET  https://pk-toolbox.vercel.app/api/qr-generate
```

---

## 📋 Authentication

The API uses **API Key authentication**. Include your API key in the request body.

### Default API Key
```
apiKey: "poolbox-qr"
```

### Custom API Keys
Custom API keys can be configured via the `QR_API_KEYS` environment variable (comma-separated).

---

## 📤 POST Request Schema

### Required Fields

```typescript
{
  apiKey: string,           // API authentication key
  type: QRDataType,         // Type of data to encode
  data: Record<string, string>,  // Data parameters based on type
  format?: "svg" | "png" | "jpeg" | "webp"  // Output format (default: "png")
}
```

### Supported QR Data Types

#### 1. **text** - Plain Text
```typescript
{
  type: "text",
  data: {
    text: "Your text here"
  }
}
```

#### 2. **url** - Website URL
```typescript
{
  type: "url",
  data: {
    url: "https://example.com"
  }
}
```

#### 3. **phone** - Phone Number
```typescript
{
  type: "phone",
  data: {
    phoneNumber: "+1-800-123-4567"
  }
}
```

#### 4. **email** - Email Address
```typescript
{
  type: "email",
  data: {
    email: "user@example.com",
    subject?: "Optional subject",
    body?: "Optional message"
  }
}
```

#### 5. **sms** - SMS Message
```typescript
{
  type: "sms",
  data: {
    phoneNumber: "+1-800-123-4567",
    message: "Your SMS message here"
  }
}
```

#### 6. **wifi** - WiFi Connection
```typescript
{
  type: "wifi",
  data: {
    ssid: "Network Name",
    password: "Network Password",
    encryption?: "WPA" | "WEP" | "nopass"  // Default: "WPA"
  }
}
```

#### 7. **vcard** - Contact Information
```typescript
{
  type: "vcard",
  data: {
    firstName: "John",
    lastName: "Doe",
    phone?: "+1-800-123-4567",
    email?: "john@example.com",
    organization?: "Company Name",
    jobTitle?: "Job Title",
    url?: "https://example.com",
    address?: "123 Main St, City, State 12345"
  }
}
```

#### 8. **event** - Calendar Event (iCal)
```typescript
{
  type: "event",
  data: {
    title: "Meeting Title",
    description?: "Event details",
    startDate: "2024-12-25",
    startTime?: "14:30",
    endDate?: "2024-12-25",
    endTime?: "15:30",
    location?: "Room 123",
    organizerName?: "John Doe",
    organizerEmail?: "john@example.com"
  }
}
```

#### 9. **location** - Geographic Location
```typescript
{
  type: "location",
  data: {
    latitude: "40.7128",
    longitude: "-74.0060",
    altitude?: "0"
  }
}
```

#### 10. **upi** - UPI Payment (India)
```typescript
{
  type: "upi",
  data: {
    upiId: "user@bank",
    payeeName?: "Merchant Name",
    transactionRef?: "TXN001",
    amount?: "500.00"
  }
}
```

#### 11. **social** - Social Media Profile
```typescript
{
  type: "social",
  data: {
    platform: "twitter" | "facebook" | "instagram" | "linkedin",
    handle: "@username"  // or URL
  }
}
```

#### 12. **appstore** - App Store Link
```typescript
{
  type: "appstore",
  data: {
    appName: "App Name",
    appId: "com.example.app",
    platform: "ios" | "android"
  }
}
```

---

## 🎨 Styling Options

### dotsOptions - QR Code Dots Styling

```typescript
dotsOptions?: {
  color?: string,                    // Hex color (default: "#000000")
  type?: "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded",
  gradient?: {
    type: "linear" | "radial",
    rotation?: number,               // Angle in degrees (0-360)
    colorStops: Array<{
      offset: number,                // 0 to 1
      color: string                  // Hex color
    }>
  }
}
```

### backgroundOptions - Background Styling

```typescript
backgroundOptions?: {
  color?: string,                    // Hex color (default: "#ffffff")
  gradient?: {
    type: "linear" | "radial",
    rotation?: number,
    colorStops: Array<{
      offset: number,
      color: string
    }>
  }
}
```

### cornersSquareOptions - Corner Squares Styling

```typescript
cornersSquareOptions?: {
  color?: string,                    // Hex color
  type?: "dot" | "square" | "extra-rounded",
  gradient?: {                       // Same structure as above
    type: "linear" | "radial",
    rotation?: number,
    colorStops: Array<{
      offset: number,
      color: string
    }>
  }
}
```

### cornersDotOptions - Corner Dots Styling

```typescript
cornersDotOptions?: {
  color?: string,                    // Hex color
  type?: "dot" | "square",
  gradient?: {                       // Same structure as above
    type: "linear" | "radial",
    rotation?: number,
    colorStops: Array<{
      offset: number,
      color: string
    }>
  }
}
```

### imageOptions - Embedded Image Configuration

```typescript
imageOptions?: {
  hideBackgroundDots?: boolean,      // Hide dots behind image (default: true)
  imageSize?: number,                // Image size ratio 0-1 (default: 0.4)
  margin?: number,                   // Margin around image in pixels (default: 3)
  image?: string                     // Base64 or URL of image
}
```

---

## 📊 Dimension & Quality Options

```typescript
options?: {
  width?: number,                    // QR code width in pixels (default: 300)
  height?: number,                   // QR code height in pixels (default: 300)
  margin?: number,                   // Margin around QR code (default: 10)
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"  // Error correction level (default: "M")
}
```

### Error Correction Levels

| Level | Recovery Capacity | Max Data Length |
|-------|-------------------|-----------------|
| **L** (Low) | ~7% | 2,953 characters |
| **M** (Medium) | ~15% | 2,331 characters |
| **Q** (Quartile) | ~25% | 1,663 characters |
| **H** (High) | ~30% | 1,273 characters |

---

## 📥 GET Request

### Response (API Information)

```json
{
  "name": "QR Code Generator API",
  "version": "1.0.0",
  "description": "Generate customizable QR codes with various styles and options",
  "documentation": "/docs/qr-generator-api.md",
  "endpoint": "/api/qr-generate",
  "method": "POST",
  "authentication": "API Key required",
  "supportedFormats": ["png", "svg", "jpeg", "webp"],
  "supportedTypes": [
    "text", "url", "phone", "email", "sms", "wifi", 
    "vcard", "event", "location", "upi", "social", "appstore"
  ]
}
```

---

## ✅ Successful Response (200 OK)

Returns a binary image file with headers:

```
Content-Type: image/png (or image/svg+xml, image/jpeg, image/webp)
Content-Length: <size-in-bytes>
Cache-Control: public, max-age=3600
X-QR-Data-Length: <character-count>
X-QR-Type: <qr-type>
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid or missing API key",
  "message": "Please provide a valid API key in the request body"
}
```

### 400 Bad Request - Missing Fields
```json
{
  "error": "Missing required fields",
  "message": "Please provide \"type\" and \"data\" fields"
}
```

### 400 Bad Request - Invalid Data
```json
{
  "error": "Invalid data",
  "message": "Could not generate QR code data from the provided input"
}
```

### 400 Bad Request - Data Too Long
```json
{
  "error": "Data too long",
  "message": "Data length (2500 chars) exceeds maximum for M error correction (2331 chars)",
  "suggestion": "Try reducing the data or increasing error correction level"
}
```

### 500 Internal Server Error
```json
{
  "error": "QR code generation failed",
  "message": "Error details here"
}
```

---

## 📚 Complete Examples

### Example 1: Simple URL QR Code

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://github.com"
  },
  "format": "png"
}
```

**Response:** PNG image file (binary data)

---

### Example 2: Styled QR Code with Custom Colors

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://example.com"
  },
  "options": {
    "width": 400,
    "height": 400,
    "margin": 15,
    "errorCorrectionLevel": "H",
    "dotsOptions": {
      "color": "#1e40af",
      "type": "rounded"
    },
    "backgroundOptions": {
      "color": "#f3f4f6"
    },
    "cornersSquareOptions": {
      "color": "#1e40af",
      "type": "extra-rounded"
    }
  },
  "format": "png"
}
```

---

### Example 3: WiFi Connection QR Code

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "wifi",
  "data": {
    "ssid": "MyHomeWiFi",
    "password": "SecurePassword123",
    "encryption": "WPA"
  },
  "options": {
    "width": 300,
    "height": 300
  },
  "format": "svg"
}
```

---

### Example 4: Contact Card (vCard)

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "vcard",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-800-123-4567",
    "email": "john.doe@example.com",
    "organization": "Acme Corp",
    "jobTitle": "Software Engineer",
    "url": "https://johndoe.com",
    "address": "123 Tech Street, San Francisco, CA 94102"
  },
  "format": "png"
}
```

---

### Example 5: Calendar Event with Gradient

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "event",
  "data": {
    "title": "Product Launch",
    "description": "Annual product launch event",
    "startDate": "2024-12-25",
    "startTime": "09:00",
    "endDate": "2024-12-25",
    "endTime": "17:00",
    "location": "Convention Center, Room A",
    "organizerName": "Tech Events Team",
    "organizerEmail": "events@example.com"
  },
  "options": {
    "width": 350,
    "height": 350,
    "errorCorrectionLevel": "M",
    "dotsOptions": {
      "color": "#000000",
      "type": "dots",
      "gradient": {
        "type": "linear",
        "rotation": 45,
        "colorStops": [
          { "offset": 0, "color": "#ff0000" },
          { "offset": 1, "color": "#0000ff" }
        ]
      }
    }
  },
  "format": "png"
}
```

---

### Example 6: QR Code with Embedded Logo

**Request:**
```json
{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://example.com/product/abc123"
  },
  "options": {
    "width": 400,
    "height": 400,
    "image": "data:image/png;base64,iVBORw0KGgoAAAANS...", // Base64 encoded image
    "imageOptions": {
      "hideBackgroundDots": true,
      "imageSize": 0.35,
      "margin": 5
    },
    "dotsOptions": {
      "color": "#333333",
      "type": "rounded"
    }
  },
  "format": "png"
}
```

---

## 🔧 Implementation Examples

### JavaScript/Node.js

```javascript
const apiKey = 'poolbox-qr';
const baseUrl = 'https://pk-toolbox.vercel.app/api/qr-generate';

async function generateQRCode(type, data, format = 'png') {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apiKey,
      type,
      data,
      format
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.blob();
}

// Usage
const qrBlob = await generateQRCode('url', { url: 'https://github.com' }, 'png');
const url = URL.createObjectURL(qrBlob);
document.querySelector('img').src = url;
```

### Python

```python
import requests
import json

API_KEY = 'poolbox-qr'
BASE_URL = 'https://pk-toolbox.vercel.app/api/qr-generate'

def generate_qr_code(qr_type, data, format='png'):
    payload = {
        'apiKey': API_KEY,
        'type': qr_type,
        'data': data,
        'format': format
    }
    
    response = requests.post(BASE_URL, json=payload)
    response.raise_for_status()
    
    return response.content

# Usage
qr_image = generate_qr_code('url', {'url': 'https://github.com'}, 'png')
with open('qr_code.png', 'wb') as f:
    f.write(qr_image)
```

### cURL

```bash
curl -X POST https://pk-toolbox.vercel.app/api/qr-generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "poolbox-qr",
    "type": "url",
    "data": { "url": "https://github.com" },
    "format": "png"
  }' \
  --output qr_code.png
```

---

## 📋 Supported Output Formats

| Format | MIME Type | Best For |
|--------|-----------|----------|
| **PNG** | image/png | General use, transparency support |
| **SVG** | image/svg+xml | Scalable, smallest file size |
| **JPEG** | image/jpeg | Smaller file size than PNG |
| **WebP** | image/webp | Modern format, best compression |

---

## ⚡ Rate Limiting & Performance

- No built-in rate limiting
- Average response time: 100-300ms
- Cache-Control: public, max-age=3600 (1 hour caching)
- Response size varies by format and QR code complexity

---

## 🔒 Security Considerations

1. **API Key Protection**: Keep your API key secret; use environment variables
2. **Data Encryption**: Use HTTPS for all requests
3. **Input Validation**: All inputs are validated server-side
4. **CORS**: Cross-Origin Resource Sharing enabled for all origins
5. **Data Privacy**: QR code generation is stateless; no data is stored

---

## 🆘 Troubleshooting

### "Data too long" Error
- **Cause**: The encoded data exceeds the maximum capacity for the error correction level
- **Solution**: 
  - Use a lower error correction level (L < M < Q < H)
  - Reduce the input data length
  - Use a shorter URL shortener for URL QR codes

### "Invalid or missing API key"
- **Cause**: API key was not provided or is incorrect
- **Solution**: Ensure the `apiKey` field is included in the request body

### Blurry QR Code
- **Cause**: Size too small or format compression issues
- **Solution**: Increase `width` and `height` options; try PNG or SVG format

### Image Embedding Issues
- **Cause**: Invalid base64 image or format not supported
- **Solution**: Ensure image is valid PNG, JPG, or WebP; use proper base64 encoding

---

## 📞 Support

For issues or feature requests, please refer to the main documentation or contact support.

---

## 📜 License & Terms

This API is provided as part of the PK Toolbox suite. Usage is subject to the terms and conditions of the service.
