'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CodeBlockProps {
  code: string;
  language?: string;
  id: string;
  copiedCode: string | null;
  onCopy: (text: string, id: string) => void;
}

const CodeBlock = ({ code, id, copiedCode, onCopy }: CodeBlockProps) => (
  <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
    <button
      onClick={() => onCopy(code, id)}
      className="absolute top-3 right-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
    >
      {copiedCode === id ? '✓ Copied' : 'Copy'}
    </button>
    <pre className="p-4 pt-12 overflow-x-auto">
      <code className="text-green-400 text-sm whitespace-pre">{code}</code>
    </pre>
  </div>
);

type Tab = 'overview' | 'types' | 'styling' | 'examples';

interface TabButtonProps {
  tab: Tab;
  label: string;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
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
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const dataTypes: { name: string; description: string; fields: string[]; example: string }[] = [
    {
      name: 'text',
      description: 'Plain text content.',
      fields: ['text (required)'],
      example: `{
  "type": "text",
  "data": { "text": "Your text here" }
}`,
    },
    {
      name: 'url',
      description: 'Website URL.',
      fields: ['url (required)'],
      example: `{
  "type": "url",
  "data": { "url": "https://example.com" }
}`,
    },
    {
      name: 'phone',
      description: 'Telephone number (tel: URI).',
      fields: ['phone (required) — alias: phoneNumber'],
      example: `{
  "type": "phone",
  "data": { "phone": "+18001234567" }
}`,
    },
    {
      name: 'email',
      description: 'mailto: URI with optional subject and body.',
      fields: ['email (required)', 'subject (optional)', 'body (optional)'],
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
      description: 'SMS URI with optional pre-filled message.',
      fields: ['phone (required) — alias: phoneNumber', 'message (optional)'],
      example: `{
  "type": "sms",
  "data": {
    "phone": "+18001234567",
    "message": "Your message"
  }
}`,
    },
    {
      name: 'wifi',
      description: 'WiFi credentials (auto-join when scanned).',
      fields: [
        'ssid (required)',
        'password (required unless encryption=nopass)',
        'encryption — "WPA" | "WEP" | "nopass" (default WPA)',
        'hidden — "true" | "false" (optional)',
      ],
      example: `{
  "type": "wifi",
  "data": {
    "ssid": "MyHomeWiFi",
    "password": "SecurePass123",
    "encryption": "WPA",
    "hidden": "false"
  }
}`,
    },
    {
      name: 'vcard',
      description: 'Contact card (vCard 3.0). Needs at least firstName or lastName.',
      fields: [
        'firstName, lastName (at least one required)',
        'organization (optional) — alias: org',
        'jobTitle (optional) — alias: title',
        'phone (optional) — alias: phoneNumber',
        'email (optional)',
        'url (optional) — alias: website',
      ],
      example: `{
  "type": "vcard",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "organization": "Acme Corp",
    "jobTitle": "Engineer",
    "phone": "+18001234567",
    "email": "john@example.com",
    "url": "https://johndoe.com"
  }
}`,
    },
    {
      name: 'event',
      description: 'Calendar event (VEVENT). Title required. Dates accept YYYY-MM-DD plus optional HH:MM time.',
      fields: [
        'title (required)',
        'startDate (optional, YYYY-MM-DD)',
        'startTime (optional, HH:MM)',
        'endDate (optional, defaults to startDate)',
        'endTime (optional, HH:MM)',
        'location (optional)',
        'description (optional)',
      ],
      example: `{
  "type": "event",
  "data": {
    "title": "Product Launch",
    "startDate": "2026-12-25",
    "startTime": "09:00",
    "endDate": "2026-12-25",
    "endTime": "17:00",
    "location": "Convention Center",
    "description": "Annual launch event"
  }
}`,
    },
    {
      name: 'location',
      description: 'Geo coordinates (geo: URI).',
      fields: [
        'latitude (required) — alias: lat',
        'longitude (required) — alias: lon, lng',
        'altitude (optional) — alias: alt',
      ],
      example: `{
  "type": "location",
  "data": {
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "altitude": "10"
  }
}`,
    },
    {
      name: 'upi',
      description: 'UPI payment (India).',
      fields: [
        'upiId (required) — alias: vpa',
        'payeeName (optional) — alias: name',
        'amount (optional)',
        'note (optional) — alias: tn',
      ],
      example: `{
  "type": "upi",
  "data": {
    "upiId": "user@bank",
    "payeeName": "Merchant",
    "amount": "500.00",
    "note": "Order #42"
  }
}`,
    },
    {
      name: 'social',
      description: 'Social profile link. Leading "@" is stripped. Full URLs are used as-is.',
      fields: [
        'platform — instagram | twitter | x | linkedin | facebook | youtube | tiktok | github',
        'handle (required) — alias: username',
      ],
      example: `{
  "type": "social",
  "data": {
    "platform": "github",
    "handle": "torvalds"
  }
}`,
    },
    {
      name: 'appstore',
      description: 'App store link.',
      fields: [
        'platform — "ios" | "android" (default "ios") — alias: store',
        'appId (required) — iOS app id or Android package name',
      ],
      example: `{
  "type": "appstore",
  "data": {
    "platform": "android",
    "appId": "com.example.app"
  }
}`,
    },
  ];

  const examples: { title: string; description: string; code: string }[] = [
    {
      title: 'Simple URL (PNG)',
      description: 'Basic QR code for a website.',
      code: `{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": { "url": "https://github.com" },
  "format": "png"
}`,
    },
    {
      title: 'Custom colors + high error correction',
      description: 'Colored foreground/background, H-level error correction.',
      code: `{
  "apiKey": "poolbox-qr",
  "type": "url",
  "data": { "url": "https://example.com" },
  "options": {
    "width": 400,
    "margin": 2,
    "errorCorrectionLevel": "H",
    "color": "#1e40af",
    "backgroundColor": "#f3f4f6"
  },
  "format": "png"
}`,
    },
    {
      title: 'WiFi credentials (SVG)',
      description: 'Scalable vector output.',
      code: `{
  "apiKey": "poolbox-qr",
  "type": "wifi",
  "data": {
    "ssid": "MyHomeWiFi",
    "password": "SecurePassword123",
    "encryption": "WPA"
  },
  "format": "svg"
}`,
    },
    {
      title: 'Contact card (vCard)',
      description: 'Scannable business card.',
      code: `{
  "apiKey": "poolbox-qr",
  "type": "vcard",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+18001234567",
    "email": "john@example.com",
    "organization": "Acme Corp",
    "jobTitle": "Engineer",
    "url": "https://johndoe.com"
  },
  "format": "png"
}`,
    },
    {
      title: 'Calendar event',
      description: 'VEVENT with a time range.',
      code: `{
  "apiKey": "poolbox-qr",
  "type": "event",
  "data": {
    "title": "Product Launch",
    "startDate": "2026-12-25",
    "startTime": "09:00",
    "endDate": "2026-12-25",
    "endTime": "17:00",
    "location": "Convention Center"
  },
  "format": "png"
}`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Generator API
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Generate QR codes as PNG, JPEG, WebP, or SVG. Encode URLs, contact cards, WiFi
          credentials, calendar events, UPI payments, and more.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/docs"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Full Docs
          </Link>
          <Link
            href="/tools/dev-utils/qr-generator"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Try the In-Browser Generator
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabButton tab="overview" label="Overview" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="types" label="Data Types" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="styling" label="Styling" activeTab={activeTab} onClick={setActiveTab} />
        <TabButton tab="examples" label="Examples" activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoint</h2>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 space-y-1">
              <div>
                <code className="text-blue-400 font-bold">POST</code>
                <code className="text-gray-300 ml-2">/api/qr-generate</code>
                <span className="text-gray-500 ml-2 text-sm">— generate a QR image</span>
              </div>
              <div>
                <code className="text-green-400 font-bold">GET</code>
                <code className="text-gray-300 ml-2">/api/qr-generate</code>
                <span className="text-gray-500 ml-2 text-sm">— API info as JSON</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Every POST request requires a valid <code>apiKey</code> in the JSON body. Keys are
              compared in constant time on the server. On self-hosted deployments, set the
              <code className="mx-1">QR_API_KEYS</code> environment variable (comma-separated) to
              override the demo default.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo key:</p>
              <code className="text-gray-900 dark:text-gray-100 font-mono">poolbox-qr</code>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Request Schema</h2>
            <CodeBlock
              id="schema"
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`{
  "apiKey":   string,                         // required
  "type":     "text" | "url" | "phone" | "email" | "sms" | "wifi"
            | "vcard" | "event" | "location" | "upi" | "social" | "appstore",
  "data":     { [field: string]: string },    // type-specific — see Data Types tab
  "format":   "png" | "svg" | "jpeg" | "webp",// default "png"
  "options":  {
    "width":                number,  // 64–2000, default 300 (pixels, raster only)
    "margin":               number,  // 0–50,   default 2 (quiet-zone modules)
    "errorCorrectionLevel": "L" | "M" | "Q" | "H", // default "M"
    "color":                string,  // #RGB | #RRGGBB | #RRGGBBAA, default #000000
    "backgroundColor":      string   // same format, default #ffffff
  }
}`}
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Response</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              On success (HTTP 200), the body is the raw image bytes. Content-Type matches the
              requested format. Errors return JSON.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { format: 'PNG', mime: 'image/png', note: 'Default, good general purpose' },
                { format: 'SVG', mime: 'image/svg+xml', note: 'Vector, infinitely scalable' },
                { format: 'JPEG', mime: 'image/jpeg', note: 'Flattened against background color' },
                { format: 'WebP', mime: 'image/webp', note: 'Modern, smaller files' },
              ].map((fmt) => (
                <div key={fmt.format} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 dark:text-white">{fmt.format}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{fmt.mime}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">{fmt.note}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Correction</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
                  <tr>
                    <th className="px-4 py-2">Level</th>
                    <th className="px-4 py-2">Recovery</th>
                    <th className="px-4 py-2">Max bytes</th>
                    <th className="px-4 py-2">When to use</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  {[
                    { level: 'L', recovery: '~7%', length: '2,953', use: 'Longest payload, clean environment' },
                    { level: 'M', recovery: '~15%', length: '2,331', use: 'Balanced — the default' },
                    { level: 'Q', recovery: '~25%', length: '1,663', use: 'Printed QR that may be scuffed' },
                    { level: 'H', recovery: '~30%', length: '1,273', use: 'Logo overlay / harsh conditions' },
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
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Max bytes refers to the encoded UTF-8 payload after the library builds vCard/WiFi/etc
              strings — not the length of individual fields.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">HTTP Status Codes</h2>
            <div className="space-y-3">
              {[
                { code: '200', message: 'Success — body is the QR image bytes' },
                { code: '400', message: 'Invalid request (missing/malformed fields, data too long)' },
                { code: '401', message: 'Missing or invalid apiKey' },
                { code: '413', message: 'Request body exceeds 512 KB' },
                { code: '500', message: 'Server error during generation' },
              ].map((resp) => (
                <div
                  key={resp.code}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="font-bold px-3 py-1 rounded text-white bg-gray-700">
                    {resp.code}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">{resp.message}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Data Types */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Twelve data types are supported. Unknown fields in <code>data</code> are ignored;
            aliases let you use either the canonical name or a synonym.
          </p>

          {dataTypes.map((t) => (
            <div
              key={t.name}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  {t.name}
                </h3>
                <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded">
                  type
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{t.description}</p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fields:</p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {t.fields.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <CodeBlock
                code={t.example}
                id={`type-${t.name}`}
                copiedCode={copiedCode}
                onCopy={copyToClipboard}
              />
            </div>
          ))}
        </div>
      )}

      {/* Styling */}
      {activeTab === 'styling' && (
        <div className="space-y-6">
          <div className="rounded-lg p-4 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100">
            <strong>API scope:</strong> the HTTP API supports width, margin, error-correction level,
            foreground <code>color</code>, and <code>backgroundColor</code>. Advanced customisations
            (gradients, rounded dot patterns, custom corner shapes, embedded logos) run in a browser
            canvas and are available in the{' '}
            <Link href="/tools/dev-utils/qr-generator" className="underline">
              in-browser QR generator
            </Link>{' '}
            — not over the API.
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
              options
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All styling is set inside a single <code>options</code> object. All fields are
              optional.
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <li>▸ <code>width</code> — output pixels, 64–2000 (raster only), default 300</li>
              <li>▸ <code>margin</code> — quiet-zone modules, 0–50, default 2</li>
              <li>▸ <code>errorCorrectionLevel</code> — "L" | "M" | "Q" | "H", default "M"</li>
              <li>▸ <code>color</code> — foreground hex (#RGB / #RRGGBB / #RRGGBBAA), default #000000</li>
              <li>▸ <code>backgroundColor</code> — background hex, default #ffffff (use #0000 for transparent PNG)</li>
            </ul>
            <CodeBlock
              id="styling-example"
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`{
  "options": {
    "width": 400,
    "margin": 2,
    "errorCorrectionLevel": "H",
    "color": "#1e40af",
    "backgroundColor": "#ffffff"
  }
}`}
            />
          </div>
        </div>
      )}

      {/* Examples */}
      {activeTab === 'examples' && (
        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">Copy-and-paste JSON bodies:</p>

          {examples.map((example, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {example.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{example.description}</p>
              <CodeBlock
                code={example.code}
                id={`example-${idx}`}
                copiedCode={copiedCode}
                onCopy={copyToClipboard}
              />
            </div>
          ))}

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              cURL
            </h3>
            <CodeBlock
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`curl -X POST https://pk-toolbox.vercel.app/api/qr-generate \\
  -H "Content-Type: application/json" \\
  -o qr.png \\
  -d '{
    "apiKey": "poolbox-qr",
    "type": "url",
    "data": { "url": "https://example.com" },
    "format": "png"
  }'`}
              language="bash"
              id="example-curl"
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              JavaScript (fetch)
            </h3>
            <CodeBlock
              copiedCode={copiedCode}
              onCopy={copyToClipboard}
              code={`async function generateQR(type, data, options = {}, format = 'png') {
  const res = await fetch('/api/qr-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: 'poolbox-qr',
      type,
      data,
      options,
      format,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return await res.blob();
}

const blob = await generateQR('url', { url: 'https://github.com' });
document.querySelector('img').src = URL.createObjectURL(blob);`}
              language="javascript"
              id="example-js"
            />
          </div>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Need fancier styling? Use the{' '}
          <Link
            href="/tools/dev-utils/qr-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            in-browser QR generator
          </Link>{' '}
          for gradients, custom dot shapes, and embedded logos.
        </p>
      </div>
    </div>
  );
}
