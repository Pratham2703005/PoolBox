'use client';

import React, { useState, useRef } from 'react';
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { MdDeleteOutline, MdDragIndicator } from 'react-icons/md';
import { useIsMounted } from '@/hooks/useIsMounted';

interface CSVTableProps {
  headers: string[];
  data: Record<string, unknown>[];
  onDataChange: (data: Record<string, unknown>[]) => void;
  onHeadersChange: (headers: string[]) => void;
}

export function CSVTable({ headers, data, onDataChange, onHeadersChange }: CSVTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

  // Handle cell edit
  const handleCellChange = (rowIdx: number, colName: string, value: unknown) => {
    const newData = data.map((r, i) => (i === rowIdx ? { ...r, [colName]: value } : r));
    onDataChange(newData);
  };

  // Start editing cell
  const startEditCell = (rowIdx: number, colName: string) => {
    setEditingCell({ row: rowIdx, col: colName });
    setEditValue(String(data[rowIdx][colName] ?? ''));
  };

  // Save cell edit
  const saveCellEdit = (rowIdx: number, colName: string) => {
    handleCellChange(rowIdx, colName, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  // Start editing header
  const startEditHeader = (colIdx: number) => {
    setEditingHeader(colIdx);
    setEditValue(headers[colIdx]);
  };

  // Save header edit
  const saveHeaderEdit = (colIdx: number) => {
    if (editValue.trim()) {
      const oldName = headers[colIdx];
      const newName = editValue.trim();

      // Update headers
      const newHeaders = [...headers];
      newHeaders[colIdx] = newName;

      // Rename keys in data rows so values are preserved under the new header name
      const newData = data.map(row => {
        const newRow = { ...row } as Record<string, unknown>;
        // Move value from oldName to newName (preserve even falsy values)
        if (Object.prototype.hasOwnProperty.call(newRow, oldName)) {
          newRow[newName] = newRow[oldName];
          delete newRow[oldName];
        } else {
          // ensure the new column exists
          newRow[newName] = '';
        }
        return newRow;
      });

      onHeadersChange(newHeaders);
      onDataChange(newData);
      setEditingHeader(null);
      setEditValue('');
    }
  };

  // Add column
  const addColumn = (name?: string) => {
    // Determine unique name
    const base = name ?? `Column${headers.length + 1}`;
    let newName = base;
    let i = 1;
    while (headers.includes(newName)) {
      newName = `${base}_${i++}`;
    }

    const newHeaders = [...headers, newName];
    const newData = data.map(row => ({ ...row, [newName]: '' }));
    onHeadersChange(newHeaders);
    onDataChange(newData);
  };

  // Delete row
  const deleteRow = (rowIdx: number) => {
    const newData = data.filter((_, idx) => idx !== rowIdx);
    onDataChange(newData);
  };

  // Add row
  const addRow = () => {
    const newRow: Record<string, unknown> = {};
    headers.forEach(h => (newRow[h] = ''));
    onDataChange([...data, newRow]);
  };

  // Delete column
  const deleteColumn = (colIdx: number) => {
    const colName = headers[colIdx];
    const newHeaders = headers.filter((_, idx) => idx !== colIdx);
    const newData = data.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    });
    onHeadersChange(newHeaders);
    onDataChange(newData);
  };

  // Reorder columns (drag and drop)
  const moveColumn = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const newHeaders = [...headers];
    const [movedHeader] = newHeaders.splice(fromIdx, 1);
    newHeaders.splice(toIdx, 0, movedHeader);

    const newData = data.map(row => {
      const newRow: Record<string, unknown> = {};
      newHeaders.forEach(h => (newRow[h] = row[h]));
      return newRow;
    });

    onHeadersChange(newHeaders);
    onDataChange(newData);
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <p className="text-gray-300 mb-4">No data to display</p>
        {isMounted && (
          <button
            onClick={addRow}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add First Row
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-700 overflow-hidden">
      {/* Table Container */}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Header Row */}
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="w-12 px-3 py-2 text-left text-gray-400">#</th>

              {headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  className="relative px-3 py-2 text-left text-gray-200 bg-gray-800 border-r border-gray-700 min-w-[150px]"
                  draggable
                  onDragStart={() => setDraggedColumn(colIdx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (draggedColumn !== null && draggedColumn !== colIdx) {
                      moveColumn(draggedColumn, colIdx);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <MdDragIndicator className="text-gray-400 cursor-grab active:cursor-grabbing shrink-0" />

                      {editingHeader === colIdx ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="px-2 py-1 text-xs flex-1 outline-none"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveHeaderEdit(colIdx);
                              if (e.key === 'Escape') { setEditingHeader(null); setEditValue(''); }
                            }}
                          />
                          <button
                            onClick={e => { e.stopPropagation(); saveHeaderEdit(colIdx); }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingHeader(null); setEditValue(''); }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className="truncate cursor-pointer hover:text-blue-300"
                          onClick={() => startEditHeader(colIdx)}
                        >
                          {header}
                        </span>
                      )}
                    </div>

                    {editingHeader !== colIdx && (
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 shrink-0">
                        <button
                          onClick={() => startEditHeader(colIdx)}
                          className="p-1 text-gray-400 hover:text-blue-400  rounded"
                          title="Edit header"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteColumn(colIdx)}
                          className="p-1 text-gray-400 hover:text-red-400  rounded"
                          title="Delete column"
                        >
                          <MdDeleteOutline size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`border-b border-gray-700 hover:bg-gray-700 transition ${rowIdx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}
              >
                {/* Row Number */}
                <td className="px-3 py-2 text-center text-gray-400 bg-gray-800 font-medium min-w-[50px] border-r border-gray-700">
                  {rowIdx + 1}
                </td>

                {/* Cells */}
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 border-r border-gray-700 cursor-cell"
                    onClick={() => startEditCell(rowIdx, header)}
                  >
                    {editingCell?.row === rowIdx && editingCell?.col === header ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, header)}
                          className="px-2 py-1 outline-none rounded-sm text-sm flex-1"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveCellEdit(rowIdx, header);
                            if (e.key === 'Escape') { setEditingCell(null); setEditValue(''); }
                          }}
                        />
                        <button
                          onClick={e => { e.stopPropagation(); saveCellEdit(rowIdx, header); }}
                          className="text-green-600 hover:text-green-700 text-xs"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setEditingCell(null); setEditValue(''); }}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-100 break-normal max-w-[300px]">
                        {String(row[header] ?? '').slice(0, 100)}
                        {String(row[header] ?? '').length > 100 ? '...' : ''}
                      </span>
                    )}
                  </td>
                ))}

                {/* Delete Row Button */}
                <td className="px-2 py-2 text-center bg-gray-800 hover:bg-gray-900 sticky right-0 border-l border-gray-700 w-12">
                  <button
                    onClick={() => deleteRow(rowIdx)}
                    className="p-1 text-gray-400 hover:text-red-400 rounded transition"
                    title="Delete row"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="px-4 py-3  border-t border-gray-700 flex gap-2">
        <button
          onClick={addRow}
          className="px-3 py-2 bg-green-600 text-gray-100 text-sm rounded hover:bg-green-700 transition"
        >
          + Add Row
        </button>
        <button
          onClick={() => addColumn()}
          className="px-3 py-2 bg-blue-600 text-gray-100 text-sm rounded hover:bg-blue-700 transition"
        >
          + Add Column
        </button>
        <span className="text-xs text-gray-500 ml-auto flex items-center">
          {data.length} row{data.length !== 1 ? 's' : ''} × {headers.length} column{headers.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
