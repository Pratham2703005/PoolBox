import Image from 'next/image';

export default async function CompilerDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        💻 Multi-Language Compiler Documentation
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        A powerful browser-based code compiler with real-time execution and Monaco Editor integration
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The Multi-Language Compiler provides an in-browser code editing and execution environment powered by Monaco Editor 
          (the same editor that powers VS Code). It offers syntax highlighting, code completion, and real-time output for 
          multiple programming languages. JavaScript runs directly in the browser with no timeout limits, while other languages 
          use the Piston API for compilation and execution.
        </p>

        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-6">
          <Image
            src="/images/compiler/Screenshot 2025-11-15 230114.png"
            alt="Multi-Language Compiler Interface"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">🌐</span>
            <span><strong>Browser-based JavaScript Execution</strong> - No timeout limits, runs locally in your browser</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✨</span>
            <span><strong>Monaco Editor Integration</strong> - Professional code editing with IntelliSense and auto-completion</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔧</span>
            <span><strong>Multi-language Support</strong> - JavaScript, Python, Java, C, and C++</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⚡</span>
            <span><strong>Real-time Console Output</strong> - See results as they happen during code execution</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎨</span>
            <span><strong>Custom Dark Theme</strong> - Oceanic theme for comfortable coding</span>
          </li>
        </ul>
      </section>

      {/* Supported Languages */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Languages</h2>
        
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-6">
          <Image
            src="/images/compiler/Screenshot 2025-11-15 230129.png"
            alt="Language Selection Interface"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Language</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Version</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Execution Method</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Timeout</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2"><strong>JavaScript</strong></td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">ES2020+</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Browser (AsyncFunction)</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-green-600 dark:text-green-400">None ✓</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2"><strong>Python</strong></td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">3.10.0</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Piston API</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-yellow-600 dark:text-yellow-400">~2 seconds</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2"><strong>Java</strong></td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">15.0.2</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Piston API</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-yellow-600 dark:text-yellow-400">~2 seconds</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2"><strong>C</strong></td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">10.2.0</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Piston API</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-yellow-600 dark:text-yellow-400">~2 seconds</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2"><strong>C++</strong></td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">10.2.0</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Piston API</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-yellow-600 dark:text-yellow-400">~2 seconds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">JavaScript Execution Flow</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <code className="text-sm text-gray-800 dark:text-gray-200">
              User Code → Monaco Editor → AsyncFunction Wrapper → Browser Execution<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Console Override<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Real-time Output Display
            </code>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>User writes JavaScript code in Monaco Editor</li>
            <li>Code is wrapped in an async IIFE (Immediately Invoked Function Expression)</li>
            <li>Console methods are overridden to capture output</li>
            <li>Code executes in the browser using AsyncFunction constructor</li>
            <li>Each console.log immediately updates the output panel</li>
            <li>After execution completes, console is restored</li>
          </ol>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Other Languages Execution Flow</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <code className="text-sm text-gray-800 dark:text-gray-200">
              User Code → Monaco Editor → Piston API Request → Remote Compilation<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Execution Result<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Output Display
            </code>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>User writes code in Monaco Editor</li>
            <li>Code is sent to Piston API with language and version info</li>
            <li>API compiles and executes code in a secure sandbox</li>
            <li>stdout, stderr, and exit codes are returned</li>
            <li>Output is displayed with error handling</li>
          </ol>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Usage Examples</h2>

        <div className="space-y-6">
          {/* JavaScript Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">JavaScript - Async Operations</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-3">
              <Image
                src="/images/compiler/Screenshot 2025-11-15 230152.png"
                alt="JavaScript Async Example"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`async function session() {
  console.log("Start:", Date.now());
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("End:", Date.now());
      resolve();
    }, 1000);
  });
}

await session();`}
              </pre>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              ✓ Supports async/await, Promises, and setTimeout without any timeout restrictions
            </p>
          </div>

          {/* Python Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Python - Basic Output</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
for i in range(1, 4):
    print(f"Count: {i}")`}
              </pre>
            </div>
          </div>

          {/* Java Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Java - Class Example</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        for(int i = 1; i <= 3; i++) {
            System.out.println("Count: " + i);
        }
    }
}`}
              </pre>
            </div>
          </div>

          {/* C Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">C - Loop Example</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    int sum = 0;
    for(int i = 1; i <= 5; i++) {
        sum += i;
    }
    printf("Sum of 1 to 5: %d\\n", sum);
    return 0;
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Monaco Editor Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Monaco Editor Features</h2>
        
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-4">
          <Image
            src="/images/compiler/Screenshot 2025-11-15 230201.png"
            alt="Monaco Editor Interface"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>

        <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
          <li>Syntax highlighting for all supported languages</li>
          <li>IntelliSense and auto-completion</li>
          <li>Line numbers and minimap for navigation</li>
          <li>Code folding and bracket matching</li>
          <li>Customizable font size and word wrap</li>
          <li>Custom &quot;oceanic-theme&quot; based on VS Dark</li>
        </ul>
      </section>

      {/* Technical Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Technical Implementation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">JavaScript Execution</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// Wrap user code in async IIFE
const wrappedCode = \`
  return (async () => {
    \${code}
  })();
\`;

// Execute using AsyncFunction
const AsyncFunction = Object.getPrototypeOf(
  async function(){}
).constructor;
const fn = new AsyncFunction(wrappedCode);
await fn();`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Console Override</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' 
      ? JSON.stringify(arg, null, 2) 
      : String(arg)
  ).join(' ');
  // Update output in real-time
  setOutput(prev => prev + message + '\\n');
};`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Piston API Integration</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`const response = await fetch(
  'https://emkc.org/api/v2/piston/execute',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: config.pistonLang,
      version: config.version,
      files: [{ content: code }]
    })
  }
);`}
              </pre>
            </div>
          </div>
        </div>
      </section>
     
    </div>
  );
}
