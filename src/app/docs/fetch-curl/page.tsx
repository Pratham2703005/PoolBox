import React from 'react';
import Image from 'next/image';

export default async function FetchCurlDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🔄 cURL ⇄ Fetch Converter Documentation
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Convert between cURL commands and JavaScript fetch requests seamlessly
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The cURL ⇄ Fetch Converter is a bidirectional tool that converts between cURL commands and JavaScript fetch API requests. 
            Perfect for developers who need to quickly switch between command-line testing and browser-based code, or vice versa.
          </p>

          {/* Screenshot - Main Interface */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/fetch-curl/Screenshot 2025-11-10 163752.png"
              alt="cURL Fetch Converter Main Interface"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ Bidirectional conversion (cURL ↔ Fetch)</li>
            <li>✓ Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)</li>
            <li>✓ Custom headers conversion</li>
            <li>✓ JSON request body handling</li>
            <li>✓ FormData/Multipart form support</li>
            <li>✓ File upload handling in FormData</li>
            <li>✓ Query parameters preservation</li>
            <li>✓ Bearer token authentication</li>
            <li>✓ Content-Type auto-detection</li>
            <li>✓ One-click copy to clipboard</li>
            <li>✓ Pre-loaded examples for quick testing</li>
            <li>✓ Real-time conversion</li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Converting cURL to Fetch</h3>
          <ol className="space-y-3 text-gray-600 dark:text-gray-400 mb-6">
            <li>1. Select <strong>&quot;cURL → Fetch&quot;</strong> mode</li>
            <li>2. Paste your cURL command in the input box</li>
            <li>3. The JavaScript fetch code appears instantly in the output box</li>
            <li>4. Click the <strong>Copy</strong> button to copy the fetch code</li>
            <li>5. Use the code in your JavaScript/TypeScript project</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Converting Fetch to cURL</h3>
          <ol className="space-y-3 text-gray-600 dark:text-gray-400 mb-6">
            <li>1. Select <strong>&quot;Fetch → cURL&quot;</strong> mode</li>
            <li>2. Paste your JavaScript fetch code in the input box</li>
            <li>3. The equivalent cURL command appears in the output box</li>
            <li>4. Click the <strong>Copy</strong> button to copy the cURL command</li>
            <li>5. Run the command in your terminal</li>
          </ol>

          {/* Screenshot - Conversion Example */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/fetch-curl/Screenshot 2025-11-10 164017.png"
              alt="Conversion Example"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Supported Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Features</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">HTTP Methods</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All standard HTTP methods are supported:
          </p>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400 mb-6">
            <li>• GET - Retrieve data</li>
            <li>• POST - Submit data</li>
            <li>• PUT - Update/replace data</li>
            <li>• PATCH - Partially update data</li>
            <li>• DELETE - Remove data</li>
            <li>• HEAD - Get headers only</li>
            <li>• OPTIONS - Get supported methods</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Headers</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Automatically converts all custom headers between formats:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`-H 'Content-Type: application/json'
-H 'Authorization: Bearer token123'
-H 'X-Custom-Header: value'`}</code>
                </pre>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123',
  'X-Custom-Header': 'value'
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Request Body (JSON)</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Converts JSON payloads between cURL and fetch formats:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`-d '{"name":"John","age":30}'`}</code>
                </pre>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`body: JSON.stringify({
  name: 'John',
  age: 30
})`}</code>
                </pre>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">FormData / Multipart</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Handles multipart form data including file uploads:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`-F 'file=@photo.jpg'
-F 'name=John'
-F 'email=john@example.com'`}</code>
                </pre>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch Format:</p>
                <pre className="text-xs overflow-x-auto">
                  <code>{`const formData = new FormData();
formData.append('file', file);
formData.append('name', 'John');
formData.append('email', 'john@example.com');

body: formData`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Examples</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Example 1: Simple GET Request</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL:</p>
            <pre className="text-sm overflow-x-auto mb-4">
              <code>{`curl -X GET 'https://api.example.com/users' \\
  -H 'Authorization: Bearer your-token-here'`}</code>
            </pre>
            
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch:</p>
            <pre className="text-sm overflow-x-auto">
              <code>{`fetch('https://api.example.com/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
})`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Example 2: POST with JSON Body</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL:</p>
            <pre className="text-sm overflow-x-auto mb-4">
              <code>{`curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your-token' \\
  -d '{"name":"John Doe","email":"john@example.com","age":30}'`}</code>
            </pre>
            
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch:</p>
            <pre className="text-sm overflow-x-auto">
              <code>{`fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  })
})`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Example 3: Multipart Form with File Upload</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">cURL:</p>
            <pre className="text-sm overflow-x-auto mb-4">
              <code>{`curl -X POST 'https://api.example.com/upload' \\
  -H 'Authorization: Bearer your-token' \\
  -F 'file=@document.pdf' \\
  -F 'title=My Document' \\
  -F 'description=Important file'`}</code>
            </pre>
            
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fetch:</p>
            <pre className="text-sm overflow-x-auto">
              <code>{`const formData = new FormData();
formData.append('file', fileInput.files[0]); // File object
formData.append('title', 'My Document');
formData.append('description', 'Important file');

fetch('https://api.example.com/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token'
  },
  body: formData
})`}</code>
            </pre>
          </div>

          {/* Screenshot - FormData Example */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/fetch-curl/Screenshot 2025-11-10 164102.png"
              alt="FormData Example"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Use Cases</h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li>
              <strong className="text-gray-900 dark:text-white">Testing APIs:</strong> Convert documentation cURL examples to fetch for use in your frontend code
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Debugging:</strong> Convert fetch requests to cURL for testing in terminal/Postman
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Documentation:</strong> Provide both cURL and JavaScript examples for API users
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Learning:</strong> Understand the relationship between cURL commands and fetch API
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Quick Prototyping:</strong> Test API endpoints in browser DevTools
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">CI/CD Scripts:</strong> Convert fetch requests to cURL for automation scripts
            </li>
          </ul>
        </section>

        {/* Tips & Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tips & Best Practices</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>Line Continuations:</strong> cURL supports backslash <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">\</code> for multi-line commands</li>
            <li>• <strong>Quote Handling:</strong> Use single quotes in cURL to avoid shell interpretation</li>
            <li>• <strong>JSON Formatting:</strong> The tool pretty-prints JSON for better readability</li>
            <li>• <strong>FormData Files:</strong> In fetch, use <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">fileInput.files[0]</code> for file uploads</li>
            <li>• <strong>Content-Type:</strong> FormData automatically sets the correct Content-Type with boundary</li>
            <li>• <strong>Authentication:</strong> Bearer tokens are preserved in both directions</li>
            <li>• <strong>Error Handling:</strong> Add error handling when using the generated fetch code in production</li>
          </ul>
        </section>

        {/* Fetch Response Handling */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Handling Fetch Responses</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The converter generates the fetch request, but you&apos;ll need to handle the response. Here&apos;s a complete example:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`// Generated fetch request
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
})
// Add response handling
.then(response => {
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return response.json();
})
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error);
});

// Or with async/await
try {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'John' })
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error);
}`}</code>
            </pre>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitations</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>File References:</strong> cURL file paths (e.g., <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">@file.jpg</code>) are converted to placeholder comments in fetch</li>
            <li>• <strong>Advanced cURL Options:</strong> Some advanced cURL flags (e.g., <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">--compressed</code>, <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">--insecure</code>) may not have direct fetch equivalents</li>
            <li>• <strong>Cookie Handling:</strong> Complex cookie scenarios may require additional handling</li>
            <li>• <strong>Proxy Settings:</strong> Proxy configurations in cURL are not converted</li>
          </ul>
        </section>

        {/* See Also */}
        <section className="mt-12 p-6 ">
          <h3 className="text-lg font-semibold text-blue-100 mb-2">
            📚 Related Tools
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <a href="/tools/code/fetch-curl" className="text-blue-600 dark:text-blue-400 hover:underline">
                Try the cURL ⇄ Fetch Converter
              </a>
            </li>
            <li>
              <a href="/tools/code/prettifier" className="text-blue-600 dark:text-blue-400 hover:underline">
                Code Prettifier (Format JSON, XML, HTML)
              </a>
            </li>
            <li>
              <a href="/tools/dev-utils/postman" className="text-blue-600 dark:text-blue-400 hover:underline">
                Mini Postman (Test HTTP Requests)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
