'use client';
import React, { useState } from 'react';
import { Download, Copy, Check, Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TEMPLATES, generateData, createEmptyField, createFieldFromTemplate } from '@/lib/data-generator';
import type { Field, OutputFormat } from '@/types/data-generator';

export default function DataGenerator() {
  const [fields, setFields] = useState<Field[]>([]);
  const [count, setCount] = useState<number>(10);
  const [generatedData, setGeneratedData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [format, setFormat] = useState<OutputFormat>('json');
  const [expandedField, setExpandedField] = useState<number | null>(null);

  const addField = () => {
    const newField = createEmptyField();
    setFields([...fields, newField]);
    setExpandedField(newField.id);
  };

  const removeField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: number, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    const templatedFields = template.fields.map((f, idx) => createFieldFromTemplate(f, idx));
    setFields(templatedFields);
    setExpandedField(null);
  };

  const handleGenerateData = () => {
    if (fields.length === 0) {
      setGeneratedData('Error: Please add at least one field');
      return;
    }

    try {
      const output = generateData(fields, count, format);
      setGeneratedData(output);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setGeneratedData(`Error: ${errorMessage}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadData = () => {
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'sql';
    const blob = new Blob([generatedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-gray-200" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-200">
              Data Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Build custom schemas and generate realistic dummy data
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Panel - Schema Builder */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white dark:bg-gray-900 rounded-sm shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Start Templates</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadTemplate(template)}
                    className="px-4 py-2 text-sm bg-[rgba(54,65,83,0.2)] text-gray-300 rounded-sm hover:bg-[rgba(54,65,83,0.5)]  transition border border-gray-600"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="bg-gray-900 rounded-sm shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Schema Fields</h3>
                <button
                  onClick={addField}
                  className="px-3 py-2 bg-[rgba(54,65,83,0.2)]  text-white rounded-sm hover:bg-[rgba(54,65,83,0.5)]  transition flex items-center gap-2 text-sm font-medium border border-gray-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <p>No fields yet. Click &quot;Add Field&quot; to start building your schema.</p>
                  </div>
                ) : (
                  fields.map((field) => (
                    <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="Field name"
                          className="flex-1 px-3 py-2 bg-[rgba(54,65,83,0.2)] border border-gray-600 rounded-sm text-sm outline-none hover:ring-1 hover:ring-gray-500 text-white"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as Field['type'] })}
                          className="px-3 py-2  border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                        >
                          <option value="string" className='bg-gray-800'>String</option>
                          <option value="number" className='bg-gray-800'>Number</option>
                          <option value="boolean" className='bg-gray-800'>Boolean</option>
                        </select>
                        <button
                          onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          {expandedField === field.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>

                      {expandedField === field.id && (
                        <div className="p-4 space-y-3 bg-gray-900">
                          {field.type === 'string' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                  String Type
                                </label>
                                <select
                                  value={field.stringType}
                                  onChange={(e) => updateField(field.id, { stringType: e.target.value as Field['stringType'] })}
                                  className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                >
                                  <option value="text" className='bg-gray-800'>Random Text</option>
                                  <option value="sentence" className='bg-gray-800'>Sentence</option>
                                  <option value="paragraph" className='bg-gray-800'>Paragraph</option>
                                  <option value="firstName" className='bg-gray-800'>First Name</option>
                                  <option value="lastName" className='bg-gray-800'>Last Name</option>
                                  <option value="fullName" className='bg-gray-800'>Full Name</option>
                                  <option value="email" className='bg-gray-800'>Email</option>
                                  <option value="phone" className='bg-gray-800'>Phone</option>
                                  <option value="address" className='bg-gray-800'>Address</option>
                                  <option value="city" className='bg-gray-800'>City</option>
                                  <option value="state" className='bg-gray-800'>State</option>
                                  <option value="grade" className='bg-gray-800'>Grade (S, A, B, C, D, E, F)</option>
                                  <option value="gender" className='bg-gray-800'>Gender (Male, Female, Other)</option>
                                  <option value="password" className='bg-gray-800'>Password</option>
                                </select>
                              </div>

                              {['text', 'sentence', 'paragraph'].includes(field.stringType) && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                      Min Words
                                    </label>
                                    <input
                                      type="number"
                                      value={field.minWords}
                                      onChange={(e) => updateField(field.id, { minWords: parseInt(e.target.value) || 1 })}
                                      min="1"
                                      className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                      Max Words
                                    </label>
                                    <input
                                      type="number"
                                      value={field.maxWords}
                                      onChange={(e) => updateField(field.id, { maxWords: parseInt(e.target.value) || 1 })}
                                      min="1"
                                      className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                    />
                                  </div>
                                </div>
                              )}

                              {field.stringType === 'email' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Email Domain
                                  </label>
                                  <input
                                    type="text"
                                    value={field.emailDomain}
                                    onChange={(e) => updateField(field.id, { emailDomain: e.target.value })}
                                    placeholder="@gmail.com"
                                    className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                  />
                                </div>
                              )}

                              {field.stringType === 'password' && (
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                      Alphabets
                                    </label>
                                    <input
                                      type="number"
                                      value={field.passwordAlphabets}
                                      onChange={(e) => updateField(field.id, { passwordAlphabets: parseInt(e.target.value) || 1 })}
                                      min="1"
                                      max="50"
                                      className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                      Numbers
                                    </label>
                                    <input
                                      type="number"
                                      value={field.passwordNumbers}
                                      onChange={(e) => updateField(field.id, { passwordNumbers: parseInt(e.target.value) || 0 })}
                                      min="0"
                                      max="20"
                                      className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                      Symbols
                                    </label>
                                    <input
                                      type="number"
                                      value={field.passwordSymbols}
                                      onChange={(e) => updateField(field.id, { passwordSymbols: parseInt(e.target.value) || 0 })}
                                      min="0"
                                      max="20"
                                      className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Starts With (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={field.startsWith}
                                    onChange={(e) => updateField(field.id, { startsWith: e.target.value })}
                                    placeholder="PREFIX_"
                                    className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Ends With (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={field.endsWith}
                                    onChange={(e) => updateField(field.id, { endsWith: e.target.value })}
                                    placeholder="_SUFFIX"
                                    className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {field.type === 'number' && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Minimum
                                  </label>
                                  <input
                                    type="number"
                                    value={field.min}
                                    onChange={(e) => updateField(field.id, { min: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Maximum
                                  </label>
                                  <input
                                    type="number"
                                    value={field.max}
                                    onChange={(e) => updateField(field.id, { max: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                  Decimal Places
                                </label>
                                <input
                                  type="number"
                                  value={field.decimals}
                                  onChange={(e) => updateField(field.id, { decimals: parseInt(e.target.value) || 0 })}
                                  min="0"
                                  max="10"
                                  className="w-full px-3 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-900 rounded-sm  p-6 ring-1 ring-gray-800">
              <h3 className="font-semibold text-white mb-4">Generation Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Records
                  </label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as OutputFormat)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-sm text-sm outline-none  bg-[rgba(54,65,83,0.2)] hover:ring-1 hover:ring-gray-500 text-white"
                  >
                    <option value="json" className='bg-gray-800'>JSON</option>
                    <option value="csv" className='bg-gray-800'>CSV</option>
                    <option value="sql" className='bg-gray-800'>SQL</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateData}
                disabled={fields.length === 0}
                className="w-full mt-4 px-6 py-3 bg-[rgba(54,65,83,0.2)] border border-gray-700 text-white font-semibold rounded-sm hover:bg-[rgba(54,65,83,0.5)] disabled:opacity-60 disabled:cursor-not-allowed transition "
              >
                Generate Data
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-sm  p-6 ring-1 ring-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Generated Data</h3>
                {generatedData && !generatedData.startsWith('Error') && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-[rgba(54,65,83,0.2)] border border-gray-600 rounded-sm text-sm outline-none hover:ring-1 hover:ring-gray-500 text-white transition flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadData}
                      className="px-4 py-2 bg-[rgba(54,65,83,0.2)] border border-gray-600 rounded-sm text-sm outline-none hover:ring-1 hover:ring-gray-500 text-white transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>
              
              <div className="rounded-sm p-4 ring-1 ring-gray-700 min-h-[600px] max-h-[600px] overflow-auto h-full">
                {generatedData ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap dark:text-gray-300 ">
                    {generatedData}
                  </pre>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 min-h-full flex items-center justify-center py-20">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Your generated data will appear here</p>
                      <p className="text-sm">Add fields and click &quot;Generate Data&quot; to start</p>
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
