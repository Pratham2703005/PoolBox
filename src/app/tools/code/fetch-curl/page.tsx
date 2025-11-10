'use client';
import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body: string | null;
  url: string;
  formData?: Array<{ key: string; value: string; isFile?: boolean; contentType?: string }>;
  isMultipart?: boolean;
}

export default function CurlFetchConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'curl-to-fetch' | 'fetch-to-curl'>('curl-to-fetch');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [exampleType, setExampleType] = useState<'json' | 'multipart'>('json');
  const isMounted = useIsMounted();

  // Helper function to extract content between quotes, handling escaped quotes
  const extractQuotedContent = (str: string, startPos: number): { content: string; endPos: number } | null => {
    const quoteChar = str[startPos];
    if (quoteChar !== '"' && quoteChar !== "'") return null;
    
    let content = '';
    let i = startPos + 1;
    let escaped = false;
    
    while (i < str.length) {
      const char = str[i];
      
      if (escaped) {
        content += char;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quoteChar) {
        return { content, endPos: i };
      } else {
        content += char;
      }
      i++;
    }
    
    return null;
  };

  const parseCurl = (curlCommand: string): RequestConfig => {
    try {
      const config: RequestConfig = {
        method: 'GET',
        headers: {},
        body: null,
        url: '',
        formData: [],
        isMultipart: false
      };

      // Remove line continuation characters but preserve the structure
      const normalized = curlCommand.replace(/\\\s*[\r\n]+\s*/g, ' ').trim();

      // Extract URL - handle multiple formats
      let urlMatch = normalized.match(/curl\s+(?:-X\s+\w+\s+)?["']?(https?:\/\/[^\s"'\\\)]+)/i);
      
      // Try --url format
      if (!urlMatch) {
        urlMatch = normalized.match(/--url\s+["']?([^\s"']+)["']?/i);
      }
      
      // Try to find any http:// or https:// URL
      if (!urlMatch) {
        urlMatch = normalized.match(/(https?:\/\/[^\s"'\\\)]+)/i);
      }
      
      if (urlMatch) {
        config.url = urlMatch[1].replace(/["']/g, '');
      }

      // Extract method - handle both -X and --request
      let methodMatch = normalized.match(/-X\s+(\w+)/i);
      if (!methodMatch) {
        methodMatch = normalized.match(/--request\s+(\w+)/i);
      }
      
      if (methodMatch) {
        config.method = methodMatch[1].toUpperCase();
      } else {
        // Infer method from presence of data
        if (normalized.includes('-d ') || normalized.includes('--data') || normalized.includes('-F ') || normalized.includes('--form')) {
          config.method = 'POST';
        }
      }

      // Extract headers - handle both -H and --header
      let pos = 0;
      while (pos < normalized.length) {
        const headerMatch = normalized.substring(pos).match(/\s(?:-H|--header)\s+/);
        if (!headerMatch || headerMatch.index === undefined) break;
        
        const headerStart = pos + headerMatch.index + headerMatch[0].length;
        
        // Try to extract quoted header
        const extracted = extractQuotedContent(normalized, headerStart);
        
        if (extracted) {
          const [key, ...valueParts] = extracted.content.split(':');
          config.headers[key.trim()] = valueParts.join(':').trim();
          pos = extracted.endPos + 1;
        } else {
          // Try unquoted header (space-delimited)
          const unquotedMatch = normalized.substring(headerStart).match(/^([^\s\\]+)/);
          if (unquotedMatch) {
            const [key, ...valueParts] = unquotedMatch[1].split(':');
            config.headers[key.trim()] = valueParts.join(':').trim();
            pos = headerStart + unquotedMatch[0].length;
          } else {
            break;
          }
        }
      }

      // Extract form data (-F, --form, --form-string flags)
      pos = 0;
      const formFields: Array<{ key: string; value: string; isFile?: boolean; contentType?: string }> = [];
      
      while (pos < normalized.length) {
        const formMatch = normalized.substring(pos).match(/\s(?:-F|--form|--form-string)\s+/);
        if (!formMatch || formMatch.index === undefined) break;
        
        const formStart = pos + formMatch.index + formMatch[0].length;
        const extracted = extractQuotedContent(normalized, formStart);
        
        if (extracted) {
          const formField = extracted.content;
          
          // Check if it's a file upload (contains =@)
          if (formField.includes('=@')) {
            const [fieldName, filePath] = formField.split('=@');
            const fileName = filePath.split('/').pop() || 'file';
            formFields.push({
              key: fieldName.trim(),
              value: fileName,
              isFile: true
            });
          } else if (formField.includes('=')) {
            // Regular form field or JSON metadata
            const equalIndex = formField.indexOf('=');
            const fieldName = formField.substring(0, equalIndex).trim();
            let fieldValue = formField.substring(equalIndex + 1);
            
            // Check if it has content type specification
            let contentType: string | undefined;
            const typeMatch = fieldValue.match(/;type=(.+)$/);
            if (typeMatch) {
              contentType = typeMatch[1];
              fieldValue = fieldValue.substring(0, fieldValue.indexOf(';type='));
            }
            
            formFields.push({
              key: fieldName,
              value: fieldValue,
              isFile: false,
              contentType
            });
          }
          
          pos = extracted.endPos + 1;
        } else {
          break;
        }
      }
      
      if (formFields.length > 0) {
        config.isMultipart = true;
        config.formData = formFields;
      } else {
        // Extract regular data/body - handle -d, --data, --data-raw, --data-binary
        pos = 0;
        const dataMatch = normalized.match(/\s(?:-d|--data|--data-raw|--data-binary)\s+/);
        if (dataMatch && dataMatch.index !== undefined) {
          const dataStart = dataMatch.index + dataMatch[0].length;
          const extracted = extractQuotedContent(normalized, dataStart);
          
          if (extracted) {
            config.body = extracted.content;
            if (!config.headers['Content-Type'] && !config.headers['content-type']) {
              config.headers['Content-Type'] = 'application/json';
            }
          } else {
            // Try unquoted data
            const unquotedMatch = normalized.substring(dataStart).match(/^([^\s\\]+)/);
            if (unquotedMatch) {
              config.body = unquotedMatch[1];
              if (!config.headers['Content-Type'] && !config.headers['content-type']) {
                config.headers['Content-Type'] = 'application/json';
              }
            }
          }
        }
      }

      return config;
    } catch {
      throw new Error('Invalid cURL command format');
    }
  };

  const curlToFetch = (curlCommand: string): string => {
    const config = parseCurl(curlCommand);
    
    if (!config.url) {
      throw new Error('No URL found in cURL command');
    }

    // Handle simple GET request (like curl -O)
    const isSimpleGet = config.method === 'GET' && 
                        Object.keys(config.headers).length === 0 && 
                        !config.body && 
                        !config.isMultipart;
    
    if (isSimpleGet) {
      return `fetch("${config.url}")\n  .then(response => response.blob())\n  .then(blob => {\n    // Download or process the blob\n    const url = window.URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = '${config.url.split('/').pop() || 'download'}';\n    document.body.appendChild(a);\n    a.click();\n    a.remove();\n  })\n  .catch(error => console.error("Error:", error));`;
    }

    // Handle multipart/form-data
    if (config.isMultipart && config.formData && config.formData.length > 0) {
      let fetchCode = `const formData = new FormData();\n`;
      
      // Add form fields
      config.formData.forEach(field => {
        if (field.isFile) {
          fetchCode += `formData.append("${field.key}", myFile); // Replace 'myFile' with your actual File object\n`;
        } else {
          // Try to parse as JSON to format it nicely
          try {
            const parsed = JSON.parse(field.value);
            const formatted = JSON.stringify(parsed, null, 2)
              .split('\n')
              .map((line, idx) => idx === 0 ? line : '  ' + line)
              .join('\n');
            fetchCode += `formData.append("${field.key}", JSON.stringify(${formatted}));\n`;
          } catch {
            // Not valid JSON, treat as regular string
            fetchCode += `formData.append("${field.key}", "${field.value}");\n`;
          }
        }
      });
      
      fetchCode += `\nfetch("${config.url}", {\n`;
      fetchCode += `  method: "${config.method}"`;
      
      // Add headers, but exclude Content-Type for multipart (browser sets it automatically)
      const filteredHeaders = { ...config.headers };
      delete filteredHeaders['Content-Type'];
      delete filteredHeaders['content-type'];
      
      if (Object.keys(filteredHeaders).length > 0) {
        fetchCode += `,\n  headers: {\n`;
        Object.entries(filteredHeaders).forEach(([key, value], idx, arr) => {
          fetchCode += `    "${key}": "${value}"`;
          if (idx < arr.length - 1) fetchCode += ',';
          fetchCode += '\n';
        });
        fetchCode += `  }`;
      }
      
      fetchCode += `,\n  body: formData\n`;
      fetchCode += `})\n  .then(res => res.json())\n  .then(data => console.log("Upload success:", data))\n  .catch(err => console.error("Error:", err));`;
      
      return fetchCode;
    }

    // Regular fetch (non-multipart)
    let fetchCode = `fetch("${config.url}", {\n`;
    fetchCode += `  method: "${config.method}"`;

    if (Object.keys(config.headers).length > 0) {
      fetchCode += `,\n  headers: {\n`;
      Object.entries(config.headers).forEach(([key, value], idx, arr) => {
        fetchCode += `    "${key}": "${value}"`;
        if (idx < arr.length - 1) fetchCode += ',';
        fetchCode += '\n';
      });
      fetchCode += `  }`;
    }

    if (config.body) {
      // Try to parse and format JSON nicely
      try {
        const parsed = JSON.parse(config.body);
        const formatted = JSON.stringify(parsed, null, 2)
          .split('\n')
          .map((line, idx) => idx === 0 ? line : '  ' + line)
          .join('\n');
        fetchCode += `,\n  body: JSON.stringify(${formatted})`;
      } catch {
        // Not valid JSON, escape and use as string
        const escapedBody = config.body.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        fetchCode += `,\n  body: "${escapedBody}"`;
      }
    }

    fetchCode += `\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error("Error:", error));`;

    return fetchCode;
  };

  const parseFetch = (fetchCode: string): RequestConfig => {
    try {
      const config: RequestConfig = {
        method: 'GET',
        headers: {},
        body: null,
        url: '',
        formData: [],
        isMultipart: false
      };

      // Check if it's a FormData request
      if (fetchCode.includes('new FormData()') || fetchCode.includes('formData.append')) {
        config.isMultipart = true;
        
        // Extract FormData appends
        // Extract FormData appends
        const appendMatches = fetchCode.matchAll(/formData\.append\s*\(\s*["']([^"']+)["']\s*,\s*(.+?)\s*\);/g);
        for (const match of appendMatches) {
          const key = match[1];
          const valueExpr = match[2].trim();
          
          // Check if it's a file reference (variable name without quotes)
          if (valueExpr.match(/^[a-zA-Z_]\w*$/) && !valueExpr.startsWith('JSON')) {
            config.formData?.push({
              key,
              value: valueExpr,
              isFile: true
            });
          } else if (valueExpr.startsWith('JSON.stringify(')) {
            // Extract JSON content - need to match balanced parentheses
            let parenCount = 0;
            const startIdx = valueExpr.indexOf('(') + 1;
            let endIdx = startIdx;
            
            for (let i = startIdx; i < valueExpr.length; i++) {
              if (valueExpr[i] === '(') parenCount++;
              else if (valueExpr[i] === ')') {
                if (parenCount === 0) {
                  endIdx = i;
                  break;
                }
                parenCount--;
              }
            }
            
            const jsonContent = valueExpr.substring(startIdx, endIdx).trim();
            config.formData?.push({
              key,
              value: jsonContent,
              isFile: false,
              contentType: 'application/json'
            });
          } else {
            // Regular string - remove quotes
            const stringMatch = valueExpr.match(/^["'](.+?)["']$/);
            config.formData?.push({
              key,
              value: stringMatch ? stringMatch[1] : valueExpr,
              isFile: false
            });
          }
        }
      }

      // Extract URL
      const urlMatch = fetchCode.match(/fetch\s*\(\s*["']([^"']+)["']/);
      if (urlMatch) {
        config.url = urlMatch[1];
      }

      // Extract method
      const methodMatch = fetchCode.match(/method\s*:\s*["'](\w+)["']/i);
      if (methodMatch) {
        config.method = methodMatch[1].toUpperCase();
      }

      // Extract headers object
      const headersMatch = fetchCode.match(/headers\s*:\s*\{([^}]+)\}/);
      if (headersMatch) {
        const headersStr = headersMatch[1];
        const headerPairs = headersStr.matchAll(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/g);
        for (const match of headerPairs) {
          config.headers[match[1]] = match[2];
        }
      }

      // Extract body (only if not multipart)
      if (!config.isMultipart) {
        const bodyMatch = fetchCode.match(/body\s*:\s*(.+?)(?:,\s*\n\s*\}|\n\})/);
        if (bodyMatch) {
          const bodyValue = bodyMatch[1].trim();
          
          // Check for JSON.stringify
          const jsonStringifyMatch = bodyValue.match(/^JSON\.stringify\((.+)\)\s*$/);
          if (jsonStringifyMatch) {
            config.body = jsonStringifyMatch[1].trim();
          } else {
            // Remove outer quotes if present
            const quoteMatch = bodyValue.match(/^["'`](.+)["'`]\s*$/);
            if (quoteMatch) {
              config.body = quoteMatch[1];
            } else {
              config.body = bodyValue;
            }
          }
        }
      }
    

      return config;
    } catch{
      throw new Error('Invalid fetch code format');
    }
  };

  const fetchToCurl = (fetchCode: string): string => {
    const config = parseFetch(fetchCode);
    
    if (!config.url) {
      throw new Error('No URL found in fetch request');
    }

    let curlCommand = `curl -X ${config.method} "${config.url}"`;

    // Handle multipart form data
    if (config.isMultipart && config.formData && config.formData.length > 0) {
      // Add Content-Type header for multipart
      curlCommand += ` \\\n  -H "Content-Type: multipart/form-data"`;
      
      // Add other headers
      Object.entries(config.headers).forEach(([key, value]) => {
        curlCommand += ` \\\n  -H "${key}: ${value}"`;
      });
      
      // Add form fields
      config.formData.forEach(field => {
        if (field.isFile) {
          curlCommand += ` \\\n  -F "${field.key}=@/path/to/${field.value}"`;
        } else {
          let fieldValue = field.value;
          // Escape quotes in the value
          fieldValue = fieldValue.replace(/"/g, '\\"');
          
          if (field.contentType) {
            curlCommand += ` \\\n  -F "${field.key}=${fieldValue};type=${field.contentType}"`;
          } else {
            curlCommand += ` \\\n  -F "${field.key}=${fieldValue}"`;
          }
        }
      });
    } else {
      // Regular request
      Object.entries(config.headers).forEach(([key, value]) => {
        curlCommand += ` \\\n  -H "${key}: ${value}"`;
      });

      if (config.body) {
        // Escape quotes in body
        const escapedBody = config.body.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        curlCommand += ` \\\n  -d "${escapedBody}"`;
      }
    }

    return curlCommand;
  };

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'curl-to-fetch') {
        const result = curlToFetch(input);
        setOutput(result);
      } else {
        const result = fetchToCurl(input);
        setOutput(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutput('');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'curl-to-fetch' ? 'fetch-to-curl' : 'curl-to-fetch');
    setInput(output);
    setOutput(input);
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleCurlJson = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d "{\\"name\\":\\"John\\",\\"email\\":\\"john@example.com\\"}"`;

  const exampleCurlMultipart = `curl -X POST "https://api.example.com/v2/upload?userId=42&type=image" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" \\
  -H "Content-Type: multipart/form-data" \\
  -H "Accept: application/json" \\
  -F "metadata={\\"title\\":\\"Sunset Shot\\",\\"tags\\":[\\"nature\\",\\"photography\\"]};type=application/json" \\
  -F "file=@/Users/pratham/Pictures/sunset.jpg"`;

  const exampleFetchJson = `fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  body: "{"name":"John","email":"john@example.com"}"
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));`;

  const exampleFetchMultipart = `const formData = new FormData();
formData.append("metadata", JSON.stringify({
  "title": "Sunset Shot",
  "tags": ["nature", "photography"]
}));
formData.append("file", myFile);

fetch("https://api.example.com/v2/upload?userId=42&type=image", {
  method: "POST",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    "Accept": "application/json"
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log("Upload success:", data))
  .catch(err => console.error("Error:", err));`;

  const loadExample = () => {
    if (mode === 'curl-to-fetch') {
      setInput(exampleType === 'json' ? exampleCurlJson : exampleCurlMultipart);
    } else {
      setInput(exampleType === 'json' ? exampleFetchJson : exampleFetchMultipart);
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            cURL ⇄ Fetch Converter
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Convert between cURL commands and JavaScript fetch requests
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-700">
          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-white font-medium text-lg">
              {mode === 'curl-to-fetch' ? 'cURL → Fetch' : 'Fetch → cURL'}
            </span>
            <button
              onClick={toggleMode}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="Switch direction"
            >
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-white font-semibold text-sm">
                  Input {mode === 'curl-to-fetch' ? '(cURL)' : '(Fetch)'}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={exampleType}
                    onChange={(e) => setExampleType(e.target.value as 'json' | 'multipart')}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="json">JSON</option>
                    <option value="multipart">FormData</option>
                  </select>
                  <button
                    onClick={loadExample}
                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    Load example
                  </button>
                </div>
              </div>
              {isMounted && (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'curl-to-fetch' 
                  ? "Paste your cURL command here..."
                  : "Paste your fetch code here..."}
                className="w-full h-64 sm:h-80 bg-gray-900/80 text-gray-100 p-4 rounded-xl font-mono text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 placeholder-gray-500"
              />)}
              
              <button
                onClick={handleConvert}
                disabled={!input.trim()}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Convert
              </button>
            </div>

            {/* Output Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold text-sm">
                  Output {mode === 'curl-to-fetch' ? '(Fetch)' : '(cURL)'}
                </label>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="relative">
                {isMounted && (
                <textarea
                  value={output}
                  readOnly
                  placeholder="Converted output will appear here..."
                  className="w-full h-64 sm:h-80 bg-gray-900/80 text-green-400 p-4 rounded-xl font-mono text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 placeholder-gray-500"
                />)}
                {error && (
                  <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center p-4">
                    <div className="bg-red-600/95 text-white px-4 py-3 rounded-lg shadow-lg max-w-md text-center">
                      <p className="font-semibold mb-1">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}