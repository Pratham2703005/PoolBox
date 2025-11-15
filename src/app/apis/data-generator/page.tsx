import React from 'react';
import Image from 'next/image';

export default function DataGeneratorAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📋 Data Generator API
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Generate realistic mock data programmatically via REST API
        </p>

        {/* Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoint</h2>
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 mb-4">
            <code className="text-green-400">POST</code>
            <code className="text-gray-300 ml-2">https://pk-toolbox.vercel.app/api/data-generate</code>
          </div>
        </section>

        {/* Request Schema */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Request Schema</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Required Fields</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`{
  "id": number,        // Unique identifier
  "name": string,      // Field name in output
  "type": "string" | "number" | "boolean"
}`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Optional String Properties</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`{
  "stringType"?: "text" | "sentence" | "firstName" | "email" | ...,
  "minWords"?: number,
  "maxWords"?: number,
  "startsWith"?: string,
  "endsWith"?: string,
  "emailDomain"?: string,
  "passwordAlphabets"?: number,
  "passwordNumbers"?: number,
  "passwordSymbols"?: number
}`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Optional Number Properties</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`{
  "min"?: number,
  "max"?: number,
  "decimals"?: number
}`}</code>
            </pre>
          </div>
        </section>

        {/* Example Request */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Example Request</h2>
          
          {/* Screenshot */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/api/data-gen-api-req.png"
              alt="Data Generator API Request Example"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`{
  "fields": [
    {
      "id": 1,
      "name": "name",
      "type": "string",
      "stringType": "fullName"
    },
    {
      "id": 2,
      "name": "email",
      "type": "string",
      "stringType": "email",
      "emailDomain": "@example.com"
    },
    {
      "id": 3,
      "name": "age",
      "type": "number",
      "min": 18,
      "max": 65,
      "decimals": 0
    }
  ],
  "count": 100,
  "format": "json"
}`}</code>
            </pre>
          </div>
        </section>

        {/* Example Response */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Example Response</h2>
          
          {/* Screenshot */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/api/data-gen-api-res.png"
              alt="Data Generator API Response Example"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`[
  {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "age": 45
  },
  {
    "name": "Mary Johnson",
    "email": "mary.johnson@example.com",
    "age": 32
  }
]`}</code>
            </pre>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Code Examples</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">cURL</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`curl -X POST https://pk-toolbox.vercel.app/api/data-generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "fields": [
      {"id": 1, "name": "name", "type": "string", "stringType": "fullName"}
    ],
    "count": 10,
    "format": "json"
  }'`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">JavaScript</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`const response = await fetch('https://pk-toolbox.vercel.app/api/data-generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fields: [
      { id: 1, name: 'name', type: 'string', stringType: 'fullName' }
    ],
    count: 10,
    format: 'json'
  })
});

const data = await response.json();
console.log(data);`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`import requests

response = requests.post(
    'https://pk-toolbox.vercel.app/api/data-generate',
    json={
        'fields': [
            {'id': 1, 'name': 'name', 'type': 'string', 'stringType': 'fullName'}
        ],
        'count': 10,
        'format': 'json'
    }
)

data = response.json()
print(data)`}</code>
            </pre>
          </div>
        </section>

        {/* See Also */}
        <section className="mt-12 p-6">
          <h3 className="text-lg font-semibold mb-2">
            Related Documentation
          </h3>
          <ul className="space-y-1 list-inside list-disc">
            <li>
              <a href="/docs/data-generator" className="text-blue-600  hover:underline">
                Data Generator Documentation
              </a>
            </li>
            <li>
              <a href="/tools/files/data-generator" className="text-blue-600  hover:underline">
                Try the Data Generator Tool
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

