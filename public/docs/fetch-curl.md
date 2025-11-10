# cURL ⇄ Fetch Converter

A powerful bidirectional converter that transforms cURL commands into JavaScript fetch requests and vice versa. Built with Next.js and TypeScript, featuring comprehensive support for both JSON and multipart/form-data requests.

## Features

### 🔄 Bidirectional Conversion
Convert seamlessly between cURL commands and JavaScript fetch API calls with a single click. Switch directions instantly using the intuitive toggle button.

![Main Interface](../images/fetch-curl/Screenshot%202025-11-10%20163752.png)
*Clean, modern interface with dark theme and easy-to-use controls*

### 📤 JSON Request Support
Perfect for standard API calls with JSON payloads. Automatically handles:
- Request headers (Authorization, Content-Type, etc.)
- JSON request bodies
- HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- Query parameters in URLs

![JSON Example](../images/fetch-curl/Screenshot%202025-11-10%20164017.png)
*Converting a cURL command with JSON data to fetch API*

### 📦 FormData & File Upload Support
**NEW!** Advanced support for multipart/form-data requests, including:
- File uploads with `-F` flags
- Mixed form data (files + JSON metadata)
- Automatic FormData generation
- Smart Content-Type handling (browser manages multipart boundaries)

![FormData Example](../images/fetch-curl/Screenshot%202025-11-10%20164102.png)
*Converting complex multipart form data with file uploads*

## Key Capabilities

### ✅ Supported Features

- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH, and more
- **Custom Headers**: Authorization tokens, API keys, content types
- **JSON Payloads**: Automatic JSON body handling and formatting
- **FormData Requests**: File uploads and multipart form data
- **Query Parameters**: Preserved in URL conversion
- **File Uploads**: Converts `-F` flags to FormData.append() calls
- **Mixed Content**: JSON metadata + file uploads in single request

### 🎯 Smart Parsing

- **cURL → Fetch**:
  - Extracts URL with query parameters
  - Parses all headers (`-H` flags)
  - Handles data payloads (`-d`, `--data`, `--data-raw`)
  - Processes form fields and file uploads (`-F` flags)
  - Generates clean, production-ready fetch code

- **Fetch → cURL**:
  - Converts fetch options to cURL flags
  - Maintains header formatting
  - Preserves request body structure
  - Handles FormData to `-F` flag conversion
  - Escapes special characters properly

## Usage Examples

### JSON Request
**Input (cURL):**
```bash
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer token123' \
  -d '{"name":"John","email":"john@example.com"}'
```

**Output (Fetch):**
```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: '{"name":"John","email":"john@example.com"}'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### File Upload with Metadata
**Input (cURL):**
```bash
curl -X POST "https://api.example.com/v2/upload?userId=42&type=image" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" \
  -H "Content-Type: multipart/form-data" \
  -H "Accept: application/json" \
  -F "metadata={\"title\":\"Sunset Shot\",\"tags\":[\"nature\",\"photography\"]};type=application/json" \
  -F "file=@/Users/pratham/Pictures/sunset.jpg"
```

**Output (Fetch):**
```javascript
const formData = new FormData();
formData.append("metadata", JSON.stringify({
  "title": "Sunset Shot",
  "tags": ["nature", "photography"]
}));
formData.append("file", myFile); // e.g. file input element (original: sunset.jpg)

fetch("https://api.example.com/v2/upload?userId=42&type=image", {
  method: "POST",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    "Accept": "application/json"
    // ⚠️ Don't set Content-Type manually; browser will handle it
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log("✅ Upload success:", data))
  .catch(err => console.error("❌ Error:", err));
```

## How to Use

1. **Select Example Type**: Choose between JSON or FormData examples from the dropdown
2. **Load Example**: Click "Load example" to see a sample conversion
3. **Paste Your Code**: Or paste your own cURL command or fetch code
4. **Convert**: Click the "Convert" button to transform your code
5. **Copy Result**: Use the copy button to grab the converted code
6. **Toggle Direction**: Switch between cURL→Fetch and Fetch→cURL modes

## Technical Details

### Built With
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Responsive dark theme design
- **Lucide Icons**: Clean, modern iconography

### Smart Features
- **Regex-based Parsing**: Accurate extraction of URLs, headers, and data
- **FormData Detection**: Automatically identifies multipart requests
- **JSON Formatting**: Pretty-prints JSON in generated code
- **Error Handling**: Clear error messages for invalid input
- **Copy to Clipboard**: One-click copying of results

## Best Practices

### When Converting to Fetch
- ✅ Review the generated code before use in production
- ✅ Replace `myFile` placeholder with actual file input reference
- ✅ Remove unnecessary headers for cleaner code
- ✅ Note the warning about Content-Type in FormData requests

### When Converting to cURL
- ✅ Test the generated cURL in terminal before deployment
- ✅ Escape special characters in production scripts
- ✅ Use environment variables for sensitive tokens
- ✅ Consider using `--data-binary` for large payloads

## Responsive Design

The converter works seamlessly across all devices:
- 💻 **Desktop**: Full two-column layout with side-by-side input/output
- 📱 **Tablet**: Responsive grid that adapts to screen size
- 📱 **Mobile**: Stacked layout optimized for smaller screens

## Why Use This Tool?

- 🚀 **Save Time**: Instantly convert between formats without manual rewriting
- 🎯 **Accuracy**: Automated parsing reduces human error
- 📚 **Learn**: See how cURL maps to fetch and vice versa
- 🔧 **Development**: Speed up API testing and integration
- 📱 **Responsive**: Works on any device, anywhere

---

**Pro Tip**: Use the example selector to quickly learn the differences between JSON and FormData request patterns!
