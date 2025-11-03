'use client';

import React, { useState } from 'react';
import { FiCopy, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useIsMounted } from '@/hooks/useIsMounted';

interface JSONEditorProps {
  data: string;
  onDataChange: (data: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
  title?: string;
}

export function JSONEditor({ data, onDataChange, title = 'JSON Data', onEditingChange }: JSONEditorProps) {
  const [format, setFormat] = useState<'minified' | 'pretty'>('pretty');
  const [error, setError] = useState<string>('');
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<string>(data);
  const isMounted = useIsMounted();

  // Format JSON
  const formatJSON = (json: string, pretty: boolean): string => {
    try {
      const parsed = JSON.parse(json);
      return pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    } catch {
      return json;
    }
  };

  // Validate JSON
  const validateJSON = (json: string): string => {
    try {
      JSON.parse(json);
      return '';
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid JSON';
    }
  };

  // Handle change - update local state only while editing to preserve caret
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalData(value);
    // During editing don't push validation errors or update parent yet
    if (validationTriggered) {
      setError(validateJSON(value));
    }
  };

  // When user leaves the textarea, sync changes to parent and validate
  const handleBlur = () => {
    setIsEditing(false);
    setValidationTriggered(true);
    if (onEditingChange) onEditingChange(false);
    onDataChange(localData);
    if (localData.trim()) {
      setError(validateJSON(localData));
    } else {
      setError('');
    }
  };

  const handleFocus = () => {
    // When starting to edit, ensure localData reflects the latest prop
    setLocalData(data);
    setIsEditing(true);
    if (onEditingChange) onEditingChange(true);
    // Clear transient error while user focuses to edit
    // Keep validationTriggered flag so that if previously validated we still show errors after blur
  };

  // Keep localData in sync with incoming prop when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setLocalData(data);
    }
  }, [data, isEditing]);

  // Keep a ref to the latest localData so we can sync on unmount without recreating the
  // cleanup on every render (which would cause the cleanup to run on every update).
  const localDataRef = React.useRef(localData);
  React.useEffect(() => {
    localDataRef.current = localData;
  }, [localData]);

  // NOTE: intentionally NOT syncing localData on unmount to avoid potential
  // feedback loops with parent state updates. We sync onBlur (when user
  // finishes editing) and via explicit toolbar actions instead.

  // Toggle format
  const toggleFormat = () => {
    const newFormat = format === 'pretty' ? 'minified' : 'pretty';
    setFormat(newFormat);
    // Apply format to the currently edited value (localData when editing, otherwise prop)
    const source = isEditing ? localData : data;
    const formatted = formatJSON(source, newFormat === 'pretty');
    // Prevent the parent from immediately syncing back while we perform this action
    if (onEditingChange) onEditingChange(true);
    setIsEditing(true);
    setLocalData(formatted);
    // Immediately sync formatted content to parent as well
    onDataChange(formatted);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const source = isEditing ? localData : data;
    try {
      navigator.clipboard.writeText(source);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  // Download as file
  const downloadAsFile = () => {
    const source = isEditing ? localData : data;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(source));
    element.setAttribute('download', 'data.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded as JSON file!');
  };

  return (
  <div className="bg-gray-950 rounded-lg flex flex-col h-[95%] overflow-hidden">
    {/* Header */}
    <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
      <h3 className="font-semibold text-gray-300">{title}</h3>
      {isMounted && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFormat}
            className="px-3 py-1 text-xs bg-gray-700 text-blue-100 rounded hover:bg-gray-600 transition"
          >
            {format === 'pretty' ? 'Minify' : 'Pretty'}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-300 hover:text-gray-100 rounded transition"
            title="Copy to clipboard"
          >
            <FiCopy size={16} />
          </button>
          <button
            onClick={downloadAsFile}
            className="p-2 text-gray-300 hover:text-gray-100 rounded transition"
            title="Download file"
          >
            <FiDownload size={16} />
          </button>
        </div>
      )}
    </div>

    {/* Error Message */}
    {error && (
      <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    )}

    {/* Scrollable Editor */}
    <div className="flex-1">
      <textarea
        value={isEditing ? localData : data}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none ${
          error ? 'border border-red-300' : ''
        }`}
        rows={12}
        spellCheck={false}
        style={{
          color: error ? '#ff6b6b' : '#d1d5db',
          backgroundColor: '#030712',
          fontFamily: 'Fira Code, Courier New, monospace',
        }}
      />
    </div>

    {/* Fixed Stats Bar */}
    <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 flex justify-between flex-shrink-0">
      <span>{(isEditing ? localData : data).length} characters</span>
      <span>
        {(() => {
          try {
            const parsed = JSON.parse(isEditing ? localData : data);
            const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
            return `${count} items`;
          } catch {
            return 'Invalid JSON';
          }
        })()}
      </span>
    </div>
  </div>
);

}
