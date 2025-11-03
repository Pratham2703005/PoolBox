'use client';

import React, { useState } from 'react';
import { FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CodeSnippetGeneratorProps {
  originalInput: string;
  originalBase: 2 | 8 | 10 | 16;
}

export function CodeSnippetGenerator({
  originalInput,
  originalBase,
}: CodeSnippetGeneratorProps) {
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  const snippets = [
    {
      lang: 'JavaScript',
      code: `const input = "${originalInput}";
const decimal = parseInt(input, ${originalBase});
const result = {
  binary: decimal.toString(2),
  octal: decimal.toString(8),
  decimal: decimal.toString(10),
  hex: decimal.toString(16).toUpperCase()
};
console.log(result);`,
    },
    {
      lang: 'Python',
      code: `input_val = "${originalInput}"
decimal = int(input_val, ${originalBase})
result = {
    "binary": bin(decimal)[2:],
    "octal": oct(decimal)[2:],
    "decimal": str(decimal),
    "hex": hex(decimal)[2:].upper()
}
print(result)`,
    },
    {
      lang: 'Java',
      code: `String input = "${originalInput}";
int decimal = Integer.parseInt(input, ${originalBase});
String binary = Integer.toBinaryString(decimal);
String octal = Integer.toOctalString(decimal);
String hex = Integer.toHexString(decimal).toUpperCase();

System.out.println("Binary: " + binary);
System.out.println("Decimal: " + decimal);
System.out.println("Hex: " + hex);`,
    },
    {
      lang: 'C++',
      code: `#include <iostream>
#include <string>

int main() {
    std::string input = "${originalInput}";
    int decimal = std::stoi(input, nullptr, ${originalBase});
    
    std::cout << "Binary: " << std::bitset<32>(decimal) << std::endl;
    std::cout << "Decimal: " << decimal << std::endl;
    std::cout << "Hex: " << std::hex << decimal << std::endl;
    
    return 0;
}`,
    },
    {
      lang: 'Go',
      code: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    input := "${originalInput}"
    decimal, _ := strconv.ParseInt(input, ${originalBase}, 64)
    
    fmt.Printf("Decimal: %d\\n", decimal)
    fmt.Printf("Binary: %b\\n", decimal)
    fmt.Printf("Hex: %x\\n", decimal)
}`,
    },
    {
      lang: 'Rust',
      code: `fn main() {
    let input = "${originalInput}";
    let decimal = i64::from_str_radix(input, ${originalBase})
        .expect("Failed to parse");
    
    println!("Decimal: {}", decimal);
    println!("Binary: {:b}", decimal);
    println!("Hex: {:x}", decimal);
}`,
    },
  ];

  const copyToClipboard = (code: string, label: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`${label} copied!`);
    });
  };

  const toggleSnippet = (lang: string) => {
    setExpandedSnippets((prev) => ({
      ...prev,
      [lang]: !prev[lang],
    }));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💻 Code Snippets
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        How to perform this conversion in your programming language:
      </p>

      <div className="space-y-2">
        {snippets.map((snippet) => (
          <div
            key={snippet.lang}
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <button
                onClick={() => toggleSnippet(snippet.lang)}
                className="flex-1 text-left"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {snippet.lang}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(snippet.code, `${snippet.lang} code`)}
                  className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSnippet(snippet.lang)}
                  className="p-1"
                >
                  {expandedSnippets[snippet.lang] ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {expandedSnippets[snippet.lang] && (
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600">
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700">
        <strong>💡 Tip:</strong> These snippets use base {originalBase} as input. Modify the base
        parameter to convert from other bases (2, 8, 10, 16).
      </div>
    </div>
  );
}
