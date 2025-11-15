# Data Generator API - Complete Examples

## 🔌 API Endpoint
```
POST https://pk-toolbox.vercel.app/api/data-generate
```

## 📋 Field Schema

### Required Properties
```typescript
{
  id: number,           // Unique identifier (1, 2, 3, ...)
  name: string,         // Field name in generated output
  type: "string" | "number" | "boolean"
}
```

### Optional Properties (type-specific)

**For `type: "string"`:**
```typescript
{
  stringType?: "text" | "sentence" | "paragraph" | "firstName" | "lastName" | 
               "fullName" | "email" | "phone" | "address" | "city" | "state" |
               "grade" | "gender" | "password",
  minWords?: number,        // For text/sentence/paragraph types
  maxWords?: number,        // For text/sentence/paragraph types
  startsWith?: string,      // Prefix for string values
  endsWith?: string,        // Suffix for string values
  emailDomain?: string,     // Email domain (e.g., "@example.com")
  passwordAlphabets?: number,  // Number of letters in password
  passwordNumbers?: number,    // Number of digits in password
  passwordSymbols?: number     // Number of symbols in password
}
```

**For `type: "number"`:**
```typescript
{
  min?: number,         // Minimum value (default: 0)
  max?: number,         // Maximum value (default: 100)
  decimals?: number     // Decimal places (default: 0)
}
```

**For `type: "boolean"`:**
```typescript
// No additional properties needed
```

---

## Example 1: Simple User Profile (Minimal Schema)

### Request
```json
{
  "fields": [
    {
      "id": 1,
      "name": "name",
      "type": "string",
      "stringType": "fullName",
      "minWords": 5,
      "maxWords": 15
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
  "count": 5,
  "format": "json"
}
```

### Response (JSON Format)
```json
[
  {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "age": 45
  },
  {
    "name": "Mary Johnson",
    "email": "mary.johnson@example.com",
    "age": 32
  },
  {
    "name": "David Williams",
    "email": "david.williams@example.com",
    "age": 28
  }
]
```

---

## Example 2: Student Records with Smart Correlation

### Request
```json
{
  "fields": [
    {
      "id": 1,
      "name": "studentName",
      "type": "string",
      "stringType": "fullName"
    },
    {
      "id": 2,
      "name": "rollNumber",
      "type": "number",
      "min": 1001,
      "max": 9999
    },
    {
      "id": 3,
      "name": "marks",
      "type": "number",
      "min": 0,
      "max": 100,
      "decimals": 2
    },
    {
      "id": 4,
      "name": "grade",
      "type": "string",
      "stringType": "grade"
    }
  ],
  "count": 3,
  "format": "json"
}
```

### Response (grade calculated from marks)
```json
[
  {
    "studentName": "Robert Miller",
    "rollNumber": 5432,
    "marks": 87.45,
    "grade": "A"
  },
  {
    "studentName": "Jennifer Wilson",
    "rollNumber": 2156,
    "marks": 92.18,
    "grade": "S"
  },
  {
    "studentName": "Christopher Moore",
    "rollNumber": 7821,
    "marks": 65.73,
    "grade": "C"
  }
]
```

---

## Example 3: CSV Format Output

### Request
```json
{
  "fields": [
    {
      "id": 1,
      "name": "firstName",
      "type": "string",
      "stringType": "firstName"
    },
    {
      "id": 2,
      "name": "lastName",
      "type": "string",
      "stringType": "lastName"
    },
    {
      "id": 3,
      "name": "phone",
      "type": "string",
      "stringType": "phone"
    }
  ],
  "count": 3,
  "format": "csv"
}
```

### Response (CSV Format)
Note: CSV and SQL formats return an object with a `data` property (string), not a direct array.

```json
{
  "data": "firstName,lastName,phone\nJohn,Smith,(555) 123-4567\nMary,Johnson,(555) 987-6543\nDavid,Williams,(555) 246-8135"
}
```

---

## Example 4: SQL Format Output

### Request
```json
{
  "fields": [
    {
      "id": 1,
      "name": "username",
      "type": "string",
      "stringType": "firstName"
    },
    {
      "id": 2,
      "name": "password",
      "type": "string",
      "stringType": "password",
      "passwordAlphabets": 10,
      "passwordNumbers": 3,
      "passwordSymbols": 2
    },
    {
      "id": 3,
      "name": "isActive",
      "type": "boolean"
    }
  ],
  "count": 2,
  "format": "sql"
}
```

### Response (SQL Format)
```json
{
  "data": "INSERT INTO table_name (username, password, isActive) VALUES\n('John', 'aB3$xY9@kL2m', 1),\n('Mary', 'pQ7!wE5#rT8n', 0);"
}
```

---

## 📚 String Type Options

When `type: "string"`, set `stringType` to one of:

| stringType | Description |
|------------|-------------|
| `"text"` | Random lorem ipsum text |
| `"sentence"` | Complete sentence |
| `"paragraph"` | Multi-sentence paragraph |
| `"firstName"` | First name |
| `"lastName"` | Last name |
| `"fullName"` | Full name (smart: uses firstName/lastName if available) |
| `"email"` | Email address (smart: uses firstName if available) |
| `"phone"` | US phone number |
| `"address"` | Street address |
| `"city"` | City name |
| `"state"` | State name |
| `"grade"` | Letter grade S, A, B, C, D, E, F (smart: calculates from marks if available) |
| `"gender"` | Male, Female, or Other |
| `"password"` | Secure password |

---

## ⚠️ Important Notes

1. **Required Properties**: Only `id`, `name`, and `type` are required for all fields
2. **Type-Specific Properties**: Include only the properties relevant to your field type
3. **Default Values**: Omitted optional properties will use sensible defaults
4. **Format Options**: Only `"json"`, `"csv"`, or `"sql"` are accepted
5. **Response Format Differs**:
   - JSON format → Returns direct array `[{}, {}]`
   - CSV/SQL formats → Returns object `{ "data": "string" }`
6. **Smart Correlation**: Works automatically when field names match (firstName/email, marks/grade, fullName/firstName/lastName)

---

## 🌐 Usage Examples in Different Languages

### cURL
```bash
curl -X POST https://pk-toolbox.vercel.app/api/data-generate \
  -H "Content-Type: application/json" \
  -d '{
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
        "emailDomain": "@company.com"
      }
    ],
    "count": 10,
    "format": "json"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('https://pk-toolbox.vercel.app/api/data-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fields: [
      {
        id: 1,
        name: 'fullName',
        type: 'string',
        stringType: 'fullName',
      },
      {
        id: 2,
        name: 'email',
        type: 'string',
        stringType: 'email',
        emailDomain: '@company.com',
      },
      {
        id: 3,
        name: 'age',
        type: 'number',
        min: 18,
        max: 65,
      },
    ],
    count: 50,
    format: 'json',
  }),
});

const data = await response.json();
console.log(data);
```

### Python
```python
import requests
import json

url = "https://pk-toolbox.vercel.app/api/data-generate"

payload = {
    "fields": [
        {
            "id": 1,
            "name": "fullName",
            "type": "string",
            "stringType": "fullName"
        },
        {
            "id": 2,
            "name": "age",
            "type": "number",
            "min": 18,
            "max": 70,
            "decimals": 0
        },
        {
            "id": 3,
            "name": "city",
            "type": "string",
            "stringType": "city"
        }
    ],
    "count": 100,
    "format": "json"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(payload), headers=headers)
data = response.json()
print(data)
```

---

## 💡 Tips for Success

1. **Minimal is Better**: Only include properties you actually need - the API fills in sensible defaults
2. **Your Postman Example Works**: Your minimal schema is perfect - that's exactly how it should be used
3. **Test Small First**: Start with `"count": 3` to verify your schema works
4. **Use Smart Correlation**: Name your fields `firstName`, `lastName`, `fullName`, `email`, `marks`, `grade` for auto-correlation
5. **Check Format**: Remember JSON returns array, CSV/SQL return `{ "data": "..." }` object

---

**Back to main documentation**: [data-generator.md](./data-generator.md)
