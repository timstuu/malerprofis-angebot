/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, ExportSettings } from '../types';

/**
 * Formats a number according to the specified decimal separator.
 */
export function formatNumber(value: number, decimalSeparator: ',' | '.', decimals: number = 2): string {
  if (isNaN(value)) return '';
  const fixedValue = value.toFixed(decimals);
  if (decimalSeparator === ',') {
    return fixedValue.replace('.', ',');
  }
  return fixedValue;
}

/**
 * Escapes a CSV field to prevent syntax errors.
 */
export function escapeCsvField(field: string, delimiter: string): string {
  const needsQuotes = field.includes(delimiter) || field.includes('"') || field.includes('\n') || field.includes('\r');
  if (needsQuotes) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Generates a HANDICRAFT "SF 602" compliant CSV string.
 * Spalte A: Positionsnr. (e.g., 1 for room, 1.01 for sub-item)
 * Spalte B: Menge
 * Spalte C: ME (Mengeneinheit)
 * Spalte D: Text (Leistungsbezeichnung)
 * Spalte E: Einzelpreis
 */
export function generateHandicraftCSV(project: Project, settings: ExportSettings): string {
  const { delimiter, decimalSeparator } = settings;
  const rows: string[][] = [];

  // Note: We don't include a header row by default because HANDICRAFT 602 imports direct lines.
  // However, we separate rooms and positions exactly as defined.

  project.rooms.forEach((room, roomIdx) => {
    const roomNum = roomIdx + 1;
    
    // 1. Room Title Row
    // Spalte A: room number (e.g. "1")
    // Spalte B: empty
    // Spalte C: empty
    // Spalte D: Room name
    // Spalte E: empty
    rows.push([
      String(roomNum),
      '',
      '',
      `Raum: ${room.name}`,
      ''
    ]);

    // 2. Positions inside this room
    room.positions.forEach((pos, posIdx) => {
      const posNum = posIdx + 1;
      const positionCode = `${roomNum}.${String(posNum).padStart(2, '0')}`; // e.g., 1.01, 1.02
      
      const qtyStr = formatNumber(pos.quantity, decimalSeparator, 2);
      const priceStr = formatNumber(pos.price, decimalSeparator, 2);

      rows.push([
        positionCode,
        qtyStr,
        pos.unit,
        pos.name,
        priceStr
      ]);
    });

    // Add an empty line between rooms to make it very clear for import, except for the last room
    if (roomIdx < project.rooms.length - 1) {
      rows.push(['', '', '', '', '']);
    }
  });

  // Convert array of rows to delimited CSV string
  const csvContent = rows
    .map(row => row.map(field => escapeCsvField(field, delimiter)).join(delimiter))
    .join('\r\n'); // Windows style line endings (very important for HANDICRAFT/German systems)

  return csvContent;
}

/**
 * Triggers a client-side download of the CSV content.
 */
export function downloadCSVFile(csvContent: string, filename: string, includeBOM: boolean = true): void {
  // Prepends UTF-8 BOM so Excel and other programs open it as UTF-8 immediately
  const fileContent = includeBOM ? '\uFEFF' + csvContent : csvContent;
  const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(url ? (void URL.revokeObjectURL(url), link) : link);
}
