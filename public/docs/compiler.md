# Multi-Language Compiler

A powerful browser-based code compiler that supports multiple programming languages with real-time execution and output. JavaScript runs directly in the browser with no timeout limits, while other languages use the Piston API for compilation and execution.


## 🎯 Overview

The Multi-Language Compiler provides an in-browser code editing and execution environment powered by Monaco Editor (the same editor that powers VS Code). It offers syntax highlighting, code completion, and real-time output for multiple programming languages.

### Key Features:
- **Browser-based JavaScript Execution** - No timeout limits
- **Monaco Editor Integration** - Professional code editing experience
- **Multi-language Support** - JavaScript, Python, Java, C, C++
- **Real-time Console Output** - See results as they happen
- **Dark Theme** - Comfortable coding environment

---

## ✨ Features

### 1. **Monaco Editor Integration**
- Syntax highlighting for all supported languages
- IntelliSense and auto-completion
- Line numbers and minimap
- Code folding and bracket matching
- Customizable font size and word wrap

### 2. **JavaScript Browser Execution**
- Runs directly in the browser using AsyncFunction
- No timeout restrictions (unlike API-based execution)
- Full async/await support
- Real-time console output
- Support for setTimeout, Promises, and other async operations

### 3. **API-based Compilation (Python, Java, C, C++)**
- Powered by Piston API
- Multiple language versions available
- Secure sandboxed execution
- ~2 second timeout for API calls

### 4. **Real-time Output**
- Console logs appear immediately as code executes
- Support for console.log, console.error, console.warn, console.info
- Error messages with stack traces
- Clean, terminal-style output display

---

## 🔧 Supported Languages

| Language | Version | Execution Method | Timeout |
|----------|---------|------------------|---------|
| **JavaScript** | ES2020+ | Browser (AsyncFunction) | None |
| **Python** | 3.10.0 | Piston API | ~2 seconds |
| **Java** | 15.0.2 | Piston API | ~2 seconds |
| **C** | 10.2.0 | Piston API | ~2 seconds |
| **C++** | 10.2.0 | Piston API | ~2 seconds |

---

## 🔄 How It Works

### JavaScript Execution Flow

```
User Code → Monaco Editor → AsyncFunction Wrapper → Browser Execution
                                                    ↓
                                          Console Override
                                                    ↓
                                          Real-time Output Display
```

**Step-by-step:**
1. User writes JavaScript code in Monaco Editor
2. Code is wrapped in an async IIFE (Immediately Invoked Function Expression)
3. Console methods are overridden to capture output
4. Code executes in the browser using AsyncFunction constructor
5. Each console.log immediately updates the output panel
6. After execution completes, console is restored

### Other Languages Execution Flow

```
User Code → Monaco Editor → Piston API Request → Remote Compilation
                                                ↓
                                         Execution Result
                                                ↓
                                         Output Display
```

**Step-by-step:**
1. User writes code in Monaco Editor
2. Code is sent to Piston API with language and version info
3. API compiles and executes code in a secure sandbox
4. stdout, stderr, and exit codes are returned
5. Output is displayed with error handling

---

## 💻 Technical Implementation

### Monaco Editor Configuration

```typescript
<Editor
  height="100%"
  language={languageConfig[language].monacoLang}
  value={code}
  onChange={(value) => setCode(value || '')}
  beforeMount={handleEditorWillMount}
  theme="oceanic-theme"
  options={{
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on'
  }}
/>
```

### Custom Theme Definition

```typescript
monaco.editor.defineTheme("oceanic-theme", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "608b4e", fontStyle: "italic" },
    { token: "keyword", foreground: "c792ea" },
    { token: "string", foreground: "c3e88d" },
    { token: "number", foreground: "f78c6c" },
  ],
  colors: {
    "editor.background": "#030712",
    "editor.foreground": "#ffffff",
    "editor.lineHighlightBackground": "#030712",
    "editorCursor.foreground": "#ffffff",
    "editorWhitespace.foreground": "#3b3f41",
  },
});
```

### JavaScript Browser Execution

```typescript
const runJavaScriptInBrowser = async () => {
  // Override console methods to capture output in real-time
  console.log = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    setOutput(prev => prev + message + '\n');
  };

  // Wrap user code in async IIFE
  const wrappedCode = `
    return (async () => {
      ${code}
    })();
  `;
  
  // Execute using AsyncFunction
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const fn = new AsyncFunction(wrappedCode);
  await fn();
};
```

### Piston API Integration

```typescript
const response = await fetch('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    language: config.pistonLang,
    version: config.version,
    files: [{
      content: code
    }]
  })
});
```

---

## 📸 Screenshots

### JavaScript Execution
![JavaScript Execution](../images/compiler/Screenshot%202025-11-15%20230114.png)
*JavaScript code running in the browser with real-time console output*

### Language Selection
![Language Selection](../images/compiler/Screenshot%202025-11-15%20230129.png)
*Easy language switching with visual feedback*

### Python Execution
![Python Execution](../images/compiler/Screenshot%202025-11-15%20230152.png)
*Python code execution using Piston API*

### Code Editor Interface
![Code Editor](../images/compiler/Screenshot%202025-11-15%20230201.png)
*Monaco Editor with syntax highlighting and minimap*
