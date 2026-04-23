'use client';
import { useState } from 'react';
import { Play, Trash2, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

type LanguageKey = 'javascript' | 'python' | 'java' | 'c' | 'cpp';

interface LanguageConfig {
  name: string;
  version: string;
  pistonLang: string;
  template: string;
  monacoLang: string;
}

const MultiLanguageCompiler = () => {
  const [language, setLanguage] = useState<LanguageKey>('javascript');
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const languageConfig: Record<LanguageKey, LanguageConfig> = {
    javascript: {
      name: 'JavaScript',
      version: '18.15.0',
      pistonLang: 'javascript',
      template: 'console.log("Hello, World!");',
      monacoLang: 'javascript'
    },
    python: {
      name: 'Python',
      version: '3.10.0',
      pistonLang: 'python',
      template: 'print("Hello, World!")',
      monacoLang: 'python'
    },
    java: {
      name: 'Java',
      version: '15.0.2',
      pistonLang: 'java',
      template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      monacoLang: 'java'
    },
    c: {
      name: 'C',
      version: '10.2.0',
      pistonLang: 'c',
      template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      monacoLang: 'c'
    },
    cpp: {
      name: 'C++',
      version: '10.2.0',
      pistonLang: 'c++',
      template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      monacoLang: 'cpp'
    }
  };

  const handleLanguageChange = (lang: LanguageKey) => {
    setLanguage(lang);
    setCode(languageConfig[lang].template);
    setOutput('');
  };

  const runJavaScriptInBrowser = async () => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // Override console methods to capture and display output in real-time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setOutput(prev => prev + message + '\n');
      originalConsole.log(...args);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      const message = 'ERROR: ' + args.map(arg => String(arg)).join(' ');
      setOutput(prev => prev + message + '\n');
      originalConsole.error(...args);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
      const message = 'WARN: ' + args.map(arg => String(arg)).join(' ');
      setOutput(prev => prev + message + '\n');
      originalConsole.warn(...args);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.info = (...args: any[]) => {
      const message = 'INFO: ' + args.map(arg => String(arg)).join(' ');
      setOutput(prev => prev + message + '\n');
      originalConsole.info(...args);
    };

    try {
      // Wrap code to ensure it returns a promise we can await
      const wrappedCode = `
        return (async () => {
          ${code}
        })();
      `;
      
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(wrappedCode);
      await fn();
      
      // Restore console
      Object.assign(console, originalConsole);
    } catch (error) {
      // Restore console
      Object.assign(console, originalConsole);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : '';
      setOutput(prev => prev + `\nERROR: ${errorMessage}\n${stack}`);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Run JavaScript in browser instead of using API
      if (language === 'javascript') {
        await runJavaScriptInBrowser();
        setIsRunning(false);
        return;
      }

      // For other languages, use Piston API
      const config = languageConfig[language];
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

      const data = await response.json();
      
      if (data.run) {
        let result = '';
        
        if (data.run.stdout) {
          result += data.run.stdout;
        }
        
        if (data.run.stderr) {
          result += data.run.stderr;
        }
        
        if (data.run.output) {
          result = data.run.output;
        }
        
        if (!result && data.run.code === 0) {
          result = 'Program executed successfully with no output.';
        }
                
        setOutput(result || 'No output');
      } else {
        setOutput('Error: Unable to execute code');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`Error: ${errorMessage}\nMake sure you have an internet connection.`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const handleEditorWillMount = (monaco: any) => {
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

  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="bg-gray-800/50 rounded-sm border border-slate-700/50 p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between">
            
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                Multi-Language Compiler
              </h1>
              
            <div className="flex gap-2 flex-wrap">
                {(Object.keys(languageConfig) as LanguageKey[]).map((lang) => (
                <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2 py-0.5 rounded-sm text-sm transition-all duration-200 outline-none border border-gray-400 ${
                    language === lang
                        ? 'text-gray-100 bg-gray-950/50  '
                        : 'bg-gray-900/50 text-gray-400 hover:bg-gray-950/50 hover:text-white border-gray-600'
                    }`}
                >
                    {languageConfig[lang].name}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col bg-gray-800/50 rounded-sm border border-slate-700/50 overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
               
                <div>
                  <span className="text-sm font-semibold text-gray-200">Code Editor</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {languageConfig[language].name} {languageConfig[language].version}
                  </span>
                </div>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 p-2 bg-green-600 hover:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-sm text-sm font-medium transition-all duration-200 disabled:shadow-none"
              >
                {isRunning ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Play size={16} />
                )}
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
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
            </div>
          </div>

          {/* Output Terminal */}
          <div className="flex-1 flex flex-col bg-gray-800/50 rounded-sm border border-slate-700/50 overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                
                <span className="text-sm font-semibold text-gray-200">Output Terminal</span>
              
              <button
                onClick={clearOutput}
                className="flex items-center gap-2 p-2 hover:bg-gray-600/50 rounded-sm text-sm transition-all duration-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-950 text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
              {output || 'Output will appear here after running code...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLanguageCompiler;