# QR Code Generator - Complete Guide

## 🎯 Overview

A powerful QR code generator with advanced styling options and REST API access. Create beautiful, customizable QR codes with gradients, logos, and multiple export formats.

**Features:**
- 12 QR code types (URL, WiFi, vCard, Email, etc.)
- Advanced styling (gradients, custom dots, corners)
- Logo/image overlay support
- Multiple formats (PNG, SVG, JPEG, WebP)
- REST API with authentication
- Real-time preview

---

## 📱 Web Interface

### Getting Started

1. Navigate to **Tools → Dev Utils → QR Generator**
2. Select your QR type
3. Fill in the required data
4. Customize styling (optional)
5. Click "Generate QR Code"
6. Download as PNG or SVG

### Customization Options

#### **Main Options**
- **Size**: 200-600px
- **Margin**: 0-40px padding around QR
- **Error Correction**: L (7%), M (15%), Q (25%), H (30%)
  - Use **H** when adding logos for better scanning

#### **Dots Options**
Choose from 6 styles:
- **Rounded** - Smooth corners (recommended)
- **Dots** - Circular dots
- **Classy** - Elegant style
- **Classy Rounded** - Elegant with smooth corners
- **Square** - Sharp corners
- **Extra Rounded** - Very smooth

**Colors:**
- Solid color picker
- Or enable **gradient** (linear/radial) with custom colors

#### **Corner Squares** (3 large corner markers)
- **Styles**: Dot, Square, Extra Rounded
- **Colors**: Solid or gradient

#### **Corner Dots** (inner corner elements)
- **Styles**: Dot, Square
- **Colors**: Solid or gradient

#### **Background**
- Solid color or gradient background

#### **Logo/Image**
- Upload any image (PNG, JPG, SVG)
- **Auto dot removal** - Dots behind logo are removed
- **Size control**: 10-60% of QR size
- **Margin**: Space around logo
- **Tip**: Use error correction H with logos

---

## 🔌 API Access

### Quick Start

**Endpoint:** `POST /api/qr-generate`  
**API Key:** `poolbox-qr` (demo)

```bash
curl -X POST https://your-domain.com/api/qr-generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "poolbox-qr",
    "type": "url",
    "data": {"url": "https://github.com"},
    "format": "png"
  }' \
  --output qr.png
```

### Request Structure

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
    "margin": 10,
    "errorCorrectionLevel": "H"
  },
  "format": "png"
}
```

### Supported QR Types

| Type | Required Fields | Example |
|------|----------------|---------|
| `text` | `text` | `{"text": "Hello World"}` |
| `url` | `url` | `{"url": "https://example.com"}` |
| `phone` | `phone` | `{"phone": "+1234567890"}` |
| `email` | `email` | `{"email": "test@example.com", "subject": "Hi", "body": "Message"}` |
| `sms` | `phone`, `message` | `{"phone": "+123", "message": "Hi"}` |
| `wifi` | `ssid`, `password`, `encryption` | `{"ssid": "WiFi", "password": "pass", "encryption": "WPA"}` |
| `vcard` | `firstName`, `lastName` | `{"firstName": "John", "lastName": "Doe", "phone": "+123", "email": "john@example.com"}` |
| `event` | `title`, `startDate` | `{"title": "Meeting", "startDate": "2025-01-01T10:00:00Z", "location": "NYC"}` |
| `location` | `latitude`, `longitude` | `{"latitude": "40.7128", "longitude": "-74.0060"}` |
| `upi` | `upi`, `name` | `{"upi": "user@bank", "name": "Store", "amount": "99.99"}` |
| `social` | `platform`, `username` | `{"platform": "twitter", "username": "user"}` |
| `appstore` | `platform`, `appId` | `{"platform": "ios", "appId": "12345"}` |

---

## 🎨 Styling Options (API)

### Basic Styling

```json
{
  "options": {
    "dotsOptions": {
      "color": "#000000",
      "type": "rounded"
    },
    "backgroundOptions": {
      "color": "#ffffff"
    },
    "cornersSquareOptions": {
      "color": "#000000",
      "type": "extra-rounded"
    },
    "cornersDotOptions": {
      "color": "#000000",
      "type": "dot"
    }
  }
}
```

### With Gradients

```json
{
  "options": {
    "dotsOptions": {
      "type": "rounded",
      "gradient": {
        "type": "linear",
        "rotation": 45,
        "colorStops": [
          {"offset": 0, "color": "#667eea"},
          {"offset": 1, "color": "#764ba2"}
        ]
      }
    }
  }
}
```

### With Logo

```json
{
  "options": {
    "errorCorrectionLevel": "H",
    "imageOptions": {
      "hideBackgroundDots": true,
      "imageSize": 0.4,
      "margin": 5
    },
    "image": "data:image/png;base64,iVBORw0KG..."
  }
}
```

### Available Options

**Dot Types:** `rounded`, `dots`, `classy`, `classy-rounded`, `square`, `extra-rounded`  
**Corner Square Types:** `dot`, `square`, `extra-rounded`  
**Corner Dot Types:** `dot`, `square`  
**Gradient Types:** `linear`, `radial`  
**Output Formats:** `png`, `svg`, `jpeg`, `webp`

---

## 💡 Examples: JavaScript/TypeScript

```typescript
async function generateQR() {
  const response = await fetch('/api/qr-generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      apiKey: 'poolbox-qr',
      type: 'url',
      data: {url: 'https://example.com'},
      options: {
        width: 400,
        dotsOptions: {
          color: '#000000',
          type: 'rounded'
        }
      },
      format: 'png'
    })
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Display or download
    const img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
  } else {
    const error = await response.json();
    console.error(error.message);
  }
}
```

## 🔒 Error Handling

### Common Errors

**401 - Invalid API Key**
```json
{"error": "Invalid or missing API key"}
```
→ Check your API key is correct

**400 - Missing Fields**
```json
{"error": "Missing required fields"}
```
→ Ensure `type` and `data` are provided

**400 - Data Too Long**
```json
{
  "error": "Data too long",
  "message": "Data length (3000) exceeds maximum (2331)"
}
