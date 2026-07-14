/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delete, DeleteIcon, RotateCcw } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  decimalSeparator: ',' | '.';
  unit: string;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onConfirm,
  decimalSeparator,
  unit,
}) => {
  const handleKeyPress = (key: string) => {
    if (key === 'clear') {
      onChange('');
      return;
    }

    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === 'decimal') {
      const displaySeparator = decimalSeparator;
      // Prevent duplicate separators
      if (value.includes('.') || value.includes(',')) {
        return;
      }
      // If empty, prepend 0
      if (value === '') {
        onChange('0' + displaySeparator);
      } else {
        onChange(value + displaySeparator);
      }
      return;
    }

    // Number keys
    // Prevent multiple leading zeros
    if (value === '0' && key === '0') return;
    if (value === '0' && key !== '0') {
      onChange(key);
      return;
    }

    onChange(value + key);
  };

  const keys = [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: 'C', value: 'clear', isAction: true, className: 'bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-200 border-[#141414]/5' },
    { label: '0', value: '0' },
    { label: decimalSeparator, value: 'decimal', isAction: true },
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-100/50 p-5 rounded-3xl border border-[#141414]/5 shadow-xs" id="numeric-keypad-container">
      {/* Display */}
      <div className="mb-4 bg-white px-4 py-3.5 rounded-xl border border-[#141414]/5 flex items-baseline justify-between shadow-3xs">
        <span className="text-3xl font-mono font-bold text-[#141414] break-all select-all tracking-tight">
          {value || '0'}
        </span>
        <span className="text-sm font-bold uppercase tracking-wider text-[#141414]/40 font-sans ml-2">
          {unit}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {keys.map((key) => (
          <button
            key={key.label}
            id={`btn-keypad-${key.label}`}
            type="button"
            onClick={() => handleKeyPress(key.value)}
            className={`h-16 text-2xl font-bold flex items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
              key.className || (key.isAction 
                ? 'bg-gray-200 text-[#141414]/70 hover:bg-gray-300 active:bg-gray-350 border-none' 
                : 'bg-white text-[#141414] hover:bg-gray-50 hover:border-[#141414]/10 active:bg-gray-100 border-[#141414]/5 shadow-xs')
            }`}
          >
            {key.label}
          </button>
        ))}

        {/* Backspace & Confirm Row */}
        <button
          id="btn-keypad-backspace"
          type="button"
          onClick={() => handleKeyPress('backspace')}
          className="col-span-1 h-14 bg-gray-200 text-[#141414]/70 hover:bg-gray-300 active:bg-gray-350 border-none shadow-3xs rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          id="btn-keypad-confirm"
          type="button"
          onClick={onConfirm}
          disabled={!value || parseFloat(value.replace(',', '.')) === 0}
          className={`col-span-2 h-14 font-bold text-base rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
            !value || parseFloat(value.replace(',', '.')) === 0
              ? 'bg-gray-200 text-[#141414]/30 border-none cursor-not-allowed opacity-60'
              : 'bg-brand-accent2 hover:bg-brand-accent2/90 active:bg-brand-accent2 text-white shadow-xs'
          }`}
        >
          Eintragen
        </button>
      </div>
    </div>
  );
};
