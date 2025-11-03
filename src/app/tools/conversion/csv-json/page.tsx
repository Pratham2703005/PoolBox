'use client';

import React, { useState, useMemo } from 'react';
import { FiDownload } from 'react-icons/fi';

import toast from 'react-hot-toast';
import { FileUpload } from '@/components/tools/csv-json/FileUpload';
import { CSVTable } from '@/components/tools/csv-json/CSVTable';
import { JSONEditor } from '@/components/tools/csv-json/JSONEditor';
import {
    parseCSV,
    jsonToCSV,
    formatAsJSON,
    formatAsJavaScript,
    formatAsTypeScript,
    formatAsSQL,
    formatAsYAML,
} from '@/lib/converters/csv-json';
import { EXPORT_FORMATS, downloadFile } from '@/lib/converters/export-utils';

type ConversionMode = 'csv-to-json' | 'json-to-csv';
type ViewMode = 'split' | 'single';

export default function CSVtoJSONConverter() {
    const [mode, setMode] = useState<ConversionMode>('csv-to-json');
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [csvData, setCsvData] = useState<Record<string, unknown>[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvDelimiter, setCsvDelimiter] = useState(',');
    const [csvIssues, setCsvIssues] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState('json');
    const [jsonContent, setJsonContent] = useState('');
    const [isEditorEditing, setIsEditorEditing] = useState(false);

    // Handle CSV upload
    const handleCSVUpload = (content: string) => {
        setMode('csv-to-json');

        const result = parseCSV(content, {
            hasHeader: true,
            trimSpaces: true,
            smartTypes: true,
            fixMissingHeaders: true,
            skipEmptyRows: true,
        });

        setCsvData(result.data);
        setCsvHeaders(result.headers);
        setCsvDelimiter(result.delimiter);
        setCsvIssues(result.issues);

        const jsonFormatted = formatAsJSON(result.data, true);
        setJsonContent(jsonFormatted);

        toast.success(`CSV loaded: ${result.rowCount} rows, ${result.headers.length} columns`);
    };

    // Handle JSON upload
    const handleJSONUpload = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            setJsonContent(content);
            setMode('json-to-csv');

            if (Array.isArray(parsed)) {
                const result = jsonToCSV(parsed, { delimiter: ',' });
                setCsvHeaders(result.headers);
                setCsvData(parsed);
                toast.success(`JSON loaded: ${parsed.length} items`);
            } else {
                toast.error('JSON must be an array of objects');
            }
        } catch {
            toast.error('Invalid JSON format');
        }
    };

    // Handle changes coming from the JSON editor. When the JSON is a valid array of objects,
    // update the CSV table state so edits persist when switching back to the CSV view.
    const handleJSONEditorChange = (content: string) => {
        setJsonContent(content);

        try {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    // Only update csvData when the edited JSON as string differs from current csvData
                    const parsedStr = JSON.stringify(parsed);
                    const currentStr = JSON.stringify(csvData);
                    if (parsedStr !== currentStr) {
                        setCsvData(parsed as Record<string, unknown>[]);
                        const result = jsonToCSV(parsed as Record<string, unknown>[], { delimiter: ',' });
                        setCsvHeaders(result.headers);
                    }
                }
        } catch {
            // Ignore parse errors here; validation is handled in the editor on blur
        }
    };

    // Handle file upload (auto-detect type)
    const handleFileUpload = (content: string, fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();

        if (ext === 'csv') {
            handleCSVUpload(content);
        } else if (ext === 'json') {
            handleJSONUpload(content);
        } else {
            // Try to detect
            try {
                JSON.parse(content);
                handleJSONUpload(content);
            } catch {
                handleCSVUpload(content);
            }
        }
    };

    // Convert based on current data
    const convertedContent = useMemo(() => {
        if (csvData.length === 0) return '';

        switch (exportFormat) {
            case 'csv':
                return jsonToCSV(csvData).csv;
            case 'json':
                return formatAsJSON(csvData, true);
            case 'js':
                return formatAsJavaScript(csvData, 'data');
            case 'ts':
                return formatAsTypeScript(csvData, 'Data');
            case 'sql':
                return formatAsSQL(csvData, 'data_table');
            case 'yaml':
                return formatAsYAML(csvData);
            default:
                return formatAsJSON(csvData, true);
        }
    }, [csvData, exportFormat]);

    // Keep the editable JSON content in sync with csvData when csvData changes
    // (for example when user edits the CSV table). This avoids showing stale converted JSON.
    React.useEffect(() => {
        // Only update the editor content when the user is NOT actively editing to avoid
        // overwriting their in-progress edits.
        if (isEditorEditing) return;
        try {
            const formatted = formatAsJSON(csvData, true);
            if (formatted !== jsonContent) {
                setJsonContent(formatted);
            }
        } catch {
            // ignore
        }
    }, [csvData, jsonContent, isEditorEditing]);

    // Download converted file
    const downloadConverted = () => {
        const format = EXPORT_FORMATS.find(f => f.id === exportFormat);
        if (!format) return;

        downloadFile(convertedContent, `converted${format.ext}`, format.mimeType);
        toast.success(`Downloaded as ${format.name}`);
    };
    const hasData = csvData.length > 0;

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-100 mb-2">CSV ↔ JSON Converter</h1>
                    <p className="text-gray-300">
                        Convert between CSV and JSON with smart type detection, editing, and multiple export formats
                    </p>
                </div>

                {/* Controls */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    {/* Mode Selection */}
                    {hasData && (
                        <>
                    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                        <label className="text-sm font-medium text-gray-300">View:</label>
                        <select value={viewMode} onChange={e => setViewMode(e.target.value as ViewMode)} className="px-3 py-1 border text-gray-300 border-gray-700 rounded text-sm">
                            <option value="split" className='text-gray-300 bg-gray-800'>Split View</option>
                            <option value="single" className='text-gray-300 bg-gray-800 '>Single Tab</option>
                        </select>
                    </div>
                    
                        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                            <label className="text-sm font-medium text-gray-200">Export as:</label>
                            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="px-3 py-1 border text-gray-300 border-gray-700 rounded text-sm">
                                {EXPORT_FORMATS.map(fmt => (
                                    <option className='bg-gray-800' key={fmt.id} value={fmt.id}>{fmt.name}</option>
                                ))}
                            </select>
                        </div>
                    
                        <div className="flex items-center gap-2 ml-auto">
                            <button onClick={downloadConverted} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                <FiDownload size={18} />
                                Download {exportFormat.toUpperCase()}
                            </button>
                        </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                {!hasData ? (
                    // File Upload / Blank sheet starter
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <FileUpload onFileUpload={handleFileUpload} accepted={['.csv', '.json', '.txt']} maxSize={50} />
                            </div>

                            <div className="flex-1 flex flex-col gap-3 justify-center items-start">
                                <p className="text-gray-200">Or start with a blank sheet to edit manually:</p>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        const initHeaders = ['Column1', 'Column2', 'Column3'];
                                        const initRow = initHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {} as Record<string, unknown>);
                                        setCsvHeaders(initHeaders);
                                        setCsvData([initRow]);
                                        setCsvDelimiter(',');
                                        setJsonContent(formatAsJSON([initRow], true));
                                    }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Start Blank Sheet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'split' ? (
                    // Split View
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* CSV Section */}
                        <div>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-100 mb-2">CSV Data</h2>
                                {csvIssues.length > 0 && (
                                    <div className="p-3 bg-gray-50 border border-yellow-200 rounded text-sm text-yellow-700">
                                        <strong>Issues detected:</strong>
                                        <ul className="list-disc list-inside mt-2">
                                            {csvIssues.map((issue, idx) => (
                                                <li key={idx}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <CSVTable headers={csvHeaders} data={csvData} onDataChange={setCsvData} onHeadersChange={setCsvHeaders} />
                        </div>

                        {/* JSON Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-100 mb-4">JSON Output</h2>
                            <JSONEditor data={jsonContent} onDataChange={handleJSONEditorChange} onEditingChange={setIsEditorEditing} title="Converted JSON" />
                        </div>
                    </div>
                ) : (
                    // Single Tab View
                    <div className="mb-4">
                        <div className="flex gap-2 mb-4 border-b border-gray-700">
                            <button onClick={() => setMode('csv-to-json')} className={`px-4 py-2 font-medium transition ${mode === 'csv-to-json' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300 hover:text-gray-100'}`}>CSV Table</button>
                            <button onClick={() => setMode('json-to-csv')} className={`px-4 py-2 font-medium transition ${mode === 'json-to-csv' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300 hover:text-gray-100'}`}>JSON Output</button>
                        </div>

                        {mode === 'csv-to-json' ? (
                            <div>
                                {csvIssues.length > 0 && (
                                    <div className="p-3 bg-gray-50 border border-yellow-200 rounded text-sm text-yellow-700 mb-4">
                                        <strong>Issues detected:</strong>
                                        <ul className="list-disc list-inside mt-2">
                                            {csvIssues.map((issue, idx) => (
                                                <li key={idx}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <CSVTable headers={csvHeaders} data={csvData} onDataChange={setCsvData} onHeadersChange={setCsvHeaders} />
                            </div>
                        ) : (
                            <JSONEditor data={jsonContent} onDataChange={handleJSONEditorChange} onEditingChange={setIsEditorEditing} title="Converted JSON" />
                        )}
                    </div>
                )}

                {/* Footer Info */}
                {hasData && (
                    <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-gray-300">Rows</p>
                                <p className="text-lg font-semibold text-gray-100">{csvData.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-300">Columns</p>
                                <p className="text-lg font-semibold text-gray-100">{csvHeaders.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-300">Delimiter</p>
                                <p className="text-lg font-semibold text-gray-100 font-mono">
                                    {csvDelimiter === '\t' ? 'Tab' : csvDelimiter === ',' ? 'Comma' : csvDelimiter}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-300">Output Format</p>
                                <p className="text-lg font-semibold text-gray-100">
                                    {EXPORT_FORMATS.find(f => f.id === exportFormat)?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
