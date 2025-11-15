import React from 'react';
import Image from 'next/image';

export default async function DataGeneratorDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* <div className="prose prose-gray dark:prose-invert max-w-none"> */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📋 Data Generator Documentation
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Complete guide to using the Data Generator tool
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The Data Generator tool helps you create realistic test data quickly and easily. 
            It supports smart field correlation, multiple data types, and various export formats including JSON, CSV, and SQL.
          </p>

          {/* Screenshot - Home */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/ui/data-gen-home.png"
              alt="Data Generator Tool Interface"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
            <li>Smart field correlation (firstName, lastName, fullName, email)</li>
            <li>Grade auto-calculation from marks</li>
            <li>Order-independent field processing</li>
            <li>Multiple data types: string, number, boolean</li>
            <li>Export formats: JSON, CSV, SQL</li>
            <li>Customizable field properties</li>
            <li>Pre-built templates</li>
          </ul>
        </section>

        {/* Usage */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="space-y-4 text-gray-600 dark:text-gray-400 list-decimal list-inside mb-6">
            <li>Add fields by clicking &quot;Add Field&quot; button</li>
            <li>Configure each field with name, type, and specific options</li>
            <li>Set the number of records to generate (1-10,000)</li>
            <li>Choose your export format (JSON, CSV, or SQL)</li>
            <li>Click &quot;Generate Data&quot; to create your dataset</li>
            <li>Download or copy the generated data</li>
          </ol>

          {/* Screenshot - Schema Configuration */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/ui/data-gen-schema.png"
              alt="Field Schema Configuration"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Field Types */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Field Types</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">String Types</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">text</code> - Random lorem ipsum text</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">sentence</code> - Complete sentence</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">paragraph</code> - Multi-sentence paragraph</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">firstName</code> - First name only</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">lastName</code> - Last name only</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">fullName</code> - Complete name</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">email</code> - Email address</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">phone</code> - Phone number</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">address</code> - Street address</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">city</code> - City name</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">state</code> - State name</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">grade</code> - Letter grade (S, A, B, C, D, E, F)</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">gender</code> - Male, Female, or Other</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">password</code> - Secure password</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Number Type</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure min, max, and decimal places for numeric values.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Boolean Type</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generates random true/false values (or 1/0 for SQL format).
          </p>
        </section>

        {/* Smart Correlation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Correlation</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The tool automatically correlates related fields in any order:
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong>Names:</strong> firstName + lastName = fullName</li>
            <li><strong>Email:</strong> Uses firstName if available</li>
            <li><strong>Grades:</strong> Auto-calculated from marks (if present)</li>
          </ul>
        </section>

        {/* Export Formats */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export Formats</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">JSON</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Returns an array of objects, perfect for APIs and web applications.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">CSV</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comma-separated values format for spreadsheet applications.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">SQL</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            INSERT statements ready to use in your database.
          </p>

          {/* Screenshot - Format Output */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/ui/data-gen-formatOutput.png"
              alt="Export Format Selection"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          {/* Screenshot - Generated Output */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/data-gen/ui/data-gen-output.png"
              alt="Generated Data Output"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* See Also */}
        <section className="mt-12 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Related Documentation
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <a href="/apis/data-generator" className="text-blue-600 dark:text-blue-400 hover:underline">
                API Reference for Data Generator
              </a>
            </li>
            <li>
              <a href="/tools/files/data-generator" className="text-blue-600 dark:text-blue-400 hover:underline">
                Try the Data Generator Tool
              </a>
            </li>
          </ul>
        </section>
     
    </div>
  );
}

