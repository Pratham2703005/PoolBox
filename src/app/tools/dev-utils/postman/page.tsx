// 'use client';
// import React, { useState } from 'react';
// import { Send, Plus, X, Copy, Check } from 'lucide-react';

// export default function MiniPostman() {
//   const [method, setMethod] = useState('GET');
//   const [url, setUrl] = useState('');
//   const [activeTab, setActiveTab] = useState('params');
//   const [params, setParams] = useState([{ key: '', value: '', enabled: true }]);
//   const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
//   const [cookies, setCookies] = useState([{ key: '', value: '', enabled: true }]);
//   const [body, setBody] = useState('');
//   const [bodyType, setBodyType] = useState('json');
//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [copied, setCopied] = useState(false);

//   const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

//   const addRow = (setter, items) => {
//     setter([...items, { key: '', value: '', enabled: true }]);
//   };

//   const updateRow = (setter, items, index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] = value;
//     setter(newItems);
//   };

//   const removeRow = (setter, items, index) => {
//     setter(items.filter((_, i) => i !== index));
//   };

//   const buildUrl = () => {
//     let finalUrl = url;
//     const enabledParams = params.filter(p => p.enabled && p.key);
    
//     if (enabledParams.length > 0) {
//       const queryString = enabledParams
//         .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
//         .join('&');
//       finalUrl += (url.includes('?') ? '&' : '?') + queryString;
//     }
    
//     return finalUrl;
//   };

//   const sendRequest = async () => {
//     setLoading(true);
//     setResponse(null);
    
//     const startTime = performance.now();
    
//     try {
//       const enabledHeaders = headers.filter(h => h.enabled && h.key);
//       const headerObj = {};
//       enabledHeaders.forEach(h => {
//         headerObj[h.key] = h.value;
//       });

//       // Add cookies to headers
//       const enabledCookies = cookies.filter(c => c.enabled && c.key);
//       if (enabledCookies.length > 0) {
//         const cookieString = enabledCookies
//           .map(c => `${c.key}=${c.value}`)
//           .join('; ');
//         headerObj['Cookie'] = cookieString;
//       }

//       // Add content-type for body
//       if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
//         if (bodyType === 'json' && !headerObj['Content-Type']) {
//           headerObj['Content-Type'] = 'application/json';
//         }
//       }

//       const options = {
//         method,
//         headers: headerObj,
//       };

//       if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
//         options.body = body;
//       }

//       const res = await fetch(buildUrl(), options);
//       const endTime = performance.now();
      
//       let responseData;
//       const contentType = res.headers.get('content-type');
      
//       if (contentType && contentType.includes('application/json')) {
//         responseData = await res.json();
//       } else {
//         responseData = await res.text();
//       }

//       const responseHeaders = {};
//       res.headers.forEach((value, key) => {
//         responseHeaders[key] = value;
//       });

//       setResponse({
//         status: res.status,
//         statusText: res.statusText,
//         time: Math.round(endTime - startTime),
//         size: new Blob([JSON.stringify(responseData)]).size,
//         headers: responseHeaders,
//         data: responseData,
//       });
//     } catch (error) {
//       setResponse({
//         error: true,
//         message: error.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyResponse = () => {
//     if (response && response.data) {
//       navigator.clipboard.writeText(
//         typeof response.data === 'string' 
//           ? response.data 
//           : JSON.stringify(response.data, null, 2)
//       );
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const KeyValueTable = ({ items, setItems, placeholder = 'Key' }) => (
//     <div className="space-y-2">
//       {items.map((item, idx) => (
//         <div key={idx} className="flex gap-2 items-center">
//           <input
//             type="checkbox"
//             checked={item.enabled}
//             onChange={(e) => updateRow(setItems, items, idx, 'enabled', e.target.checked)}
//             className="w-4 h-4"
//           />
//           <input
//             type="text"
//             placeholder={placeholder}
//             value={item.key}
//             onChange={(e) => updateRow(setItems, items, idx, 'key', e.target.value)}
//             className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Value"
//             value={item.value}
//             onChange={(e) => updateRow(setItems, items, idx, 'value', e.target.value)}
//             className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={() => removeRow(setItems, items, idx)}
//             className="p-2 text-red-500 hover:bg-red-50 rounded"
//           >
//             <X size={18} />
//           </button>
//         </div>
//       ))}
//       <button
//         onClick={() => addRow(setItems, items)}
//         className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
//       >
//         <Plus size={16} /> Add {placeholder}
//       </button>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Mini Postman</h1>
        
//         {/* Request Builder */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex gap-2 mb-4">
//             <select
//               value={method}
//               onChange={(e) => setMethod(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               {methods.map(m => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//             <input
//               type="text"
//               placeholder="Enter request URL"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={sendRequest}
//               disabled={!url || loading}
//               className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               <Send size={18} />
//               {loading ? 'Sending...' : 'Send'}
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 mb-4">
//             <div className="flex gap-4">
//               {['params', 'headers', 'cookies', 'body'].map(tab => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-4 py-2 font-medium capitalize ${
//                     activeTab === tab
//                       ? 'text-blue-600 border-b-2 border-blue-600'
//                       : 'text-gray-600 hover:text-gray-900'
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="mt-4">
//             {activeTab === 'params' && (
//               <KeyValueTable items={params} setItems={setParams} placeholder="Parameter" />
//             )}
            
//             {activeTab === 'headers' && (
//               <KeyValueTable items={headers} setItems={setHeaders} placeholder="Header" />
//             )}
            
//             {activeTab === 'cookies' && (
//               <KeyValueTable items={cookies} setItems={setCookies} placeholder="Cookie Name" />
//             )}
            
//             {activeTab === 'body' && (
//               <div className="space-y-2">
//                 <select
//                   value={bodyType}
//                   onChange={(e) => setBodyType(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="json">JSON</option>
//                   <option value="text">Text</option>
//                   <option value="xml">XML</option>
//                 </select>
//                 <textarea
//                   value={body}
//                   onChange={(e) => setBody(e.target.value)}
//                   placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body'}
//                   className="w-full h-64 px-4 py-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Response */}
//         {response && (
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-900">Response</h2>
//               {!response.error && (
//                 <div className="flex items-center gap-4 text-sm">
//                   <span className={`px-3 py-1 rounded font-medium ${
//                     response.status < 300 ? 'bg-green-100 text-green-800' :
//                     response.status < 400 ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {response.status} {response.statusText}
//                   </span>
//                   <span className="text-gray-600">Time: {response.time}ms</span>
//                   <span className="text-gray-600">Size: {response.size}B</span>
//                   <button
//                     onClick={copyResponse}
//                     className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
//                   >
//                     {copied ? <Check size={16} /> : <Copy size={16} />}
//                     {copied ? 'Copied!' : 'Copy'}
//                   </button>
//                 </div>
//               )}
//             </div>

//             {response.error ? (
//               <div className="p-4 bg-red-50 text-red-800 rounded">
//                 <strong>Error:</strong> {response.message}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="font-semibold mb-2">Headers</h3>
//                   <div className="bg-gray-50 rounded p-3 text-sm font-mono overflow-x-auto">
//                     {Object.entries(response.headers).map(([key, value]) => (
//                       <div key={key} className="text-gray-700">
//                         <span className="text-blue-600">{key}:</span> {value}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div>
//                   <h3 className="font-semibold mb-2">Body</h3>
//                   <div className="bg-gray-50 rounded p-4 text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto">
//                     <pre className="text-gray-700">
//                       {typeof response.data === 'string' 
//                         ? response.data 
//                         : JSON.stringify(response.data, null, 2)}
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }