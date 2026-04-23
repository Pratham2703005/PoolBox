'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CodeBlockProps {
  code: string;
  language?: string;
  id: string;
  copiedCode: string | null;
  onCopy: (text: string, id: string) => void;
}

const CodeBlock = ({ code, language = 'json', id, copiedCode, onCopy }: CodeBlockProps) => (
  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
    <button
      onClick={() => onCopy(code, id)}
      className="absolute top-3 right-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
    >
      {copiedCode === id ? '✓ Copied' : 'Copy'}
    </button>
    <pre className="p-4 pt-12 overflow-x-auto">
      <code className="text-green-400 text-sm">{code}</code>
    </pre>
  </div>
);

interface TabButtonProps {
  tab: 'overview' | 'types' | 'styling' | 'examples';
  label: string;
  activeTab: 'overview' | 'types' | 'styling' | 'examples';
  onClick: (tab: 'overview' | 'types' | 'styling' | 'examples') => void;
}

const TabButton = ({ tab, label, activeTab, onClick }: TabButtonProps) => (
  <button
    onClick={() => onClick(tab)}
    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-green-600 text-white'
        : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

export default function QRGeneratorAPIPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'styling' | 'examples'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🔲 QR Code Generator API
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Generate customizable QR codes with various styles and options. Encode URLs, contact information, WiFi credentials, calendar events, and much more.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/docs" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            📚 Full Docs
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors">
            💻 GitHub
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabButton tab="overview" label="Overview" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="types" label="Data Types" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="styling" label="Styling" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="examples" label="Examples" activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Endpoint */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoint</h2>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
              <div className="mb-2">
                <code className="text-blue-400 font-bold">POST</code>
                <code className="text-gray-300 ml-2">https://pk-toolbox.vercel.app/api/qr-generate</code>
              </div>
              <div>
                <code className="text-green-400 font-bold">GET</code>
                <code className="text-gray-300 ml-2">https://pk-toolbox.vercel.app/api/qr-generate</code>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Use POST to generate QR codes, GET to retrieve API information</p>
          </section>

          {/* Authentication */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All requests require an API key included in the request body.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Default API Key:</p>
              <code className="text-gray-900 dark:text-gray-100 font-mono">poolbox-qr</code>
            </div>
          </section>

          {/* Request Schema */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Request Schema</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Required Fields</h3>
                <CodeBlock
                  code={`{
  "apiKey": string,                      // API authentication key
  "type": QRDataType,                    // Type of data to encode
  "data": Record<string, string>,        // Data parameters
  "format"?: "svg" | "png" | "jpeg" | "webp"  // Output format
}`}
                  id="schema-required"
                  copiedCode={copiedCode}
                  onCopy={copyToClipboard}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Optional Styling Options</h3>
                <CodeBlock
                  code={`{
  "options": {
    "width"?: number,                   // Width in pixels (default: 300)
    "height"?: number,                  // Height in pixels (default: 300)
    "margin"?: number,                  // Margin around QR (default: 10)
    "errorCorrectionLevel"?: "L" | "M" | "Q" | "H",  // Error correction
    "dotsOptions"?: { color, type, gradient },
    "backgroundOptions"?: { color, gradient },
    "cornersSquareOptions"?: { color, type, gradient },
    "cornersDotOptions"?: { color, type, gradient },
    "imageOptions"?: { hideBackgroundDots, imageSize, margin },
    "image"?: string                    // Base64 or URL
  }
}`}
                  id="schema-options"
                  copiedCode={copiedCode}
                  onCopy={copyToClipboard}
                />
              </div>
            </div>
          </section>

          {/* Supported Formats */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Output Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { format: 'PNG', mime: 'image/png', best: 'General use, transparency' },
                { format: 'SVG', mime: 'image/svg+xml', best: 'Scalable, smallest size' },
                { format: 'JPEG', mime: 'image/jpeg', best: 'Smaller than PNG' },
                { format: 'WebP', mime: 'image/webp', best: 'Modern, best compression' },
              ].map((fmt) => (
                <div key={fmt.format} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 dark:text-white">{fmt.format}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{fmt.mime}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">✓ {fmt.best}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Error Correction Levels */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Correction Levels</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
                  <tr>
                    <th className="px-4 py-2">Level</th>
                    <th className="px-4 py-2">Recovery</th>
                    <th className="px-4 py-2">Max Length</th>
                    <th className="px-4 py-2">Use Case</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  {[
                    { level: 'L', recovery: '~7%', length: '2,953', use: 'Simple text' },
                    { level: 'M', recovery: '~15%', length: '2,331', use: 'Balanced (default)' },
                    { level: 'Q', recovery: '~25%', length: '1,663', use: 'High durability' },
                    { level: 'H', recovery: '~30%', length: '1,273', use: 'Maximum protection' },
                  ].map((row) => (
                    <tr key={row.level} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 font-semibold">{row.level}</td>
                      <td className="px-4 py-3">{row.recovery}</td>
                      <td className="px-4 py-3">{row.length}</td>
                      <td className="px-4 py-3">{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Response Codes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Response Codes</h2>
            <div className="space-y-3">
              {[
                { code: '200', message: 'QR code generated successfully (binary image)', color: 'green' },
                { code: '400', message: 'Bad request (missing fields, data too long)', color: 'yellow' },
                { code: '401', message: 'Unauthorized (invalid API key)', color: 'red' },
                { code: '500', message: 'Server error (generation failed)', color: 'red' },
              ].map((resp) => (
                <div key={resp.code} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className={`font-bold px-3 py-1 rounded text-white bg-${resp.color}-600`}>
                    {resp.code}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">{resp.message}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Data Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            QR Code Generator supports 12 different data types. Select the type that matches your use case:
          </p>

          {[
            {
              name: 'text',
              description: 'Plain text content',
              example: `{
  "type": "text",
  "data": { "text": "Your text here" }
}`,
            },
            {
              name: 'url',
              description: 'Website URL or web link',
              example: `{
  "type": "url",
  "data": { "url": "https://example.com" }
}`,
            },
            {
              name: 'phone',
              description: 'Telephone number for automatic dialing',
              example: `{
  "type": "phone",
  "data": { "phoneNumber": "+1-800-123-4567" }
}`,
            },
            {
              name: 'email',
              description: 'Email address with optional subject and body',
              example: `{
  "type": "email",
  "data": {
    "email": "user@example.com",
    "subject": "Hello",
    "body": "Message body"
  }
}`,
            },
            {
              name: 'sms',
              description: 'SMS message to phone number',
              example: `{
  "type": "sms",
  "data": {
    "phoneNumber": "+1-800-123-4567",
    "message": "Your message"
  }
}`,
            },
            {
              name: 'wifi',
              description: 'WiFi network credentials',
              example: `{
  "type": "wifi",
  "data": {
    "ssid": "Network Name",
    "password": "Password",
    "encryption": "WPA"
  }
}`,
            },
            {
              name: 'vcard',
              description: 'Contact information / Business card',
              example: `{
  "type": "vcard",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-800-123-4567",
    "email": "john@example.com",
    "organization": "Company",
    "jobTitle": "Developer"
  }
}`,
            },
            {
              name: 'event',
              description: 'Calendar event (iCal format)',
              example: `{
  "type": "event",
  "data": {
    "title": "Meeting",
    "startDate": "2024-12-25",
    "startTime": "14:30",
    "location": "Room 123"
  }
}`,
            },
            {
              name: 'location',
              description: 'Geographic coordinates (latitude/longitude)',
              example: `{
  "type": "location",
  "data": {
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "altitude": "0"
  }
}`,
            },
            {
              name: 'upi',
              description: 'UPI Payment (India payment system)',
              example: `{
  "type": "upi",
  "data": {
    "upiId": "user@bank",
    "payeeName": "Merchant",
    "amount": "500.00"
  }
}`,
            },
            {
              name: 'social',
              description: 'Social media profile link',
              example: `{
  "type": "social",
  "data": {
    "platform": "twitter",
    "handle": "@username"
  }
}`,
            },
            {
              name: 'appstore',
              description: 'App store application link',
              example: `{
  "type": "appstore",
  "data": {
    "appName": "MyApp",
    "appId": "com.example.app",
    "platform": "android"
  }
}`,
            },
          ].map((type) => (
            <div key={type.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">{type.name}</h3>
                <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded">
                  Type
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{type.description}</p>
              <CodeBlock code={type.example} id={`type-${type.name}`} copiedCode={copiedCode} onCopy={copyToClipboard} />
            </div>
          ))}
        </div>
      )}

      {/* Styling Tab */}
      {activeTab === 'styling' && (
        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Customize the appearance of your QR codes with various styling options:
          </p>

          {[
            {
              name: 'dotsOptions',
              description: 'Customize the dots/patterns in the QR code',
              options: ['color - Hex color code', 'type - Pattern style (rounded, dots, classy, etc.)', 'gradient - Linear or radial gradient'],
              example: `{
  "dotsOptions": {
    "color": "#1e40af",
    "type": "rounded",
    "gradient": {
      "type": "linear",
      "rotation": 45,
      "colorStops": [
        { "offset": 0, "color": "#ff0000" },
        { "offset": 1, "color": "#0000ff" }
      ]
    }
  }
}`,
            },
            {
              name: 'backgroundOptions',
              description: 'Customize the background of the QR code',
              options: ['color - Background hex color', 'gradient - Linear or radial gradient'],
              example: `{
  "backgroundOptions": {
    "color": "#f3f4f6",
    "gradient": {
      "type": "radial",
      "colorStops": [
        { "offset": 0, "color": "#ffffff" },
        { "offset": 1, "color": "#e5e7eb" }
      ]
    }
  }
}`,
            },
            {
              name: 'cornersSquareOptions',
              description: 'Customize the corner squares (position markers)',
              options: ['color - Hex color', 'type - Style (dot, square, extra-rounded)', 'gradient - Gradient support'],
              example: `{
  "cornersSquareOptions": {
    "color": "#1e40af",
    "type": "extra-rounded"
  }
}`,
            },
            {
              name: 'cornersDotOptions',
              description: 'Customize the center dots in corner squares',
              options: ['color - Hex color', 'type - Style (dot or square)', 'gradient - Gradient support'],
              example: `{
  "cornersDotOptions": {
    "color": "#1e40af",
    "type": "dot"
  }
}`,
            },
            {
              name: 'imageOptions',
              description: 'Embed an image in the center of the QR code',
              options: ['hideBackgroundDots - Hide dots behind image', 'imageSize - Image size ratio (0-1)', 'margin - Padding around image'],
              example: `{
  "imageOptions": {
    "image": "data:image/png;base64,iVBORw0...",
    "hideBackgroundDots": true,
    "imageSize": 0.35,
    "margin": 5
  }
}`,
            },
          ].map((section) => (
            <div key={section.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-mono">{section.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{section.description}</p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Options:</p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {section.options.map((opt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">▸</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <CodeBlock code={section.example} id={`styling-${section.name}`} copiedCode={copiedCode} onCopy={copyToClipboard} />
            </div>
          ))}
        </div>
      )}

      {/* Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete examples for common use cases:
          </p>

          {[
            {
              title: 'Simple URL',
              description: 'Basic QR code for a website URL',
              code: `{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://github.com"
  },
  "format": "png"
}`,
            },
            {
              title: 'Styled with Custom Colors',
              description: 'QR code with custom styling and colors',
              code: `{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://example.com"
  },
  "options": {
    "width": 400,
    "height": 400,
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
}`,
            },
            {
              title: 'WiFi Connection',
              description: 'QR code to share WiFi credentials',
              code: `{
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
}`,
            },
            {
              title: 'Contact Card',
              description: 'vCard QR code for contact information',
              code: `{
  "apiKey": "poolbox-qr",
  "type": "vcard",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-800-123-4567",
    "email": "john@example.com",
    "organization": "Acme Corp",
    "jobTitle": "Engineer",
    "url": "https://johndoe.com"
  },
  "format": "png"
}`,
            },
            {
              title: 'Calendar Event',
              description: 'iCal event QR code',
              code: `{
  "apiKey": "poolbox-qr",
  "type": "event",
  "data": {
    "title": "Product Launch",
    "startDate": "2024-12-25",
    "startTime": "09:00",
    "endDate": "2024-12-25",
    "endTime": "17:00",
    "location": "Convention Center",
    "organizerName": "Events Team"
  },
  "format": "png"
}`,
            },
            {
              title: 'With Embedded Logo',
              description: 'QR code with image in the center',
              code: `{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": {
    "url": "https://example.com/product"
  },
  "options": {
    "width": 400,
    "height": 400,
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "imageOptions": {
      "hideBackgroundDots": true,
      "imageSize": 0.35,
      "margin": 5
    }
  },
  "format": "png"
}`,
            },
          ].map((example, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{example.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{example.description}</p>
              <CodeBlock code={example.code} id={`example-${idx}`} copiedCode={copiedCode} onCopy={copyToClipboard} />
            </div>
          ))}

          {/* JavaScript Example */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">JavaScript Implementation</h3>
            <CodeBlock
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`const apiKey = 'poolbox-qr';
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

// Usage example
const qrBlob = await generateQRCode(
  'url',
  { url: 'https://github.com' },
  'png'
);

// Display in image element
const url = URL.createObjectURL(qrBlob);
document.querySelector('img').src = url;`}
              language="javascript"
              id="example-js"
            />
          </div>

          {/* cURL Example */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">cURL Example</h3>
            <CodeBlock
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`curl -X POST https://pk-toolbox.vercel.app/api/qr-generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "poolbox-qr",
    "type": "url",
    "data": { "url": "https://github.com" },
    "format": "png"
  }' \\
  --output qr_code.png`}
              language="bash"
              id="example-curl"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          Need more help? Check the{' '}
          <Link href="/docs" className="text-blue-600 dark:text-blue-400 hover:underline">
            complete documentation
          </Link>{' '}
          or visit the{' '}
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            main toolbox
          </Link>
        </p>
      </div>
    </div>
  );
}
