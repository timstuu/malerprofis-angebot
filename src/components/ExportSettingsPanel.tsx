/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { ExportSettings, Project } from '../types';
import { generateHandicraftCSV, downloadCSVFile } from '../utils/exportUtils';

interface ExportSettingsPanelProps {
  project: Project;
  settings: ExportSettings;
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({
  project,
  settings,
}) => {
  const [showToast, setShowToast] = useState(false);

  // Calculate statistics
  const roomCount = project.rooms.length;
  const positionCount = project.rooms.reduce((sum, r) => sum + r.positions.length, 0);
  const totalSum = project.rooms.reduce(
    (sum, r) => sum + r.positions.reduce((pSum, pos) => pSum + pos.totalPrice, 0),
    0
  );

  const triggerExport = () => {
    const csvContent = generateHandicraftCSV(project, settings);
    
    // Build standard filename based on template
    const nameParts = project.name.trim().split(/\s+/);
    const lastName = nameParts[nameParts.length - 1] || 'Kunde';
    const cleanLastName = lastName.replace(/[^a-zA-Z0-9]/g, '');
    const year = project.date ? project.date.split('-')[0] : new Date().getFullYear().toString();
    const cleanStreet = project.street
      ? project.street.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
      : 'Strasse';
      
    let filename = settings.filenameTemplate
      .replace('{projectNumber}', '000')
      .replace('{projectName}', cleanLastName)
      .replace('{lastName}', cleanLastName)
      .replace('{year}', year)
      .replace('{date}', year)
      .replace('{street}', cleanStreet);
      
    if (!filename.endsWith('.csv')) {
      filename += '.csv';
    }

    downloadCSVFile(csvContent, filename, settings.includeBOM);
    
    // Show toast notification
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="w-full flex flex-col space-y-4 relative text-[#141414]" id="export-panel">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#141414] text-white text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 z-50 animate-bounce">
          <Check className="w-3.5 h-3.5 text-brand-accent2" />
          <span>Datei erfolgreich heruntergeladen!</span>
        </div>
      )}

      {/* Header section (container-less) */}
      <div>
        <h2 className="text-lg font-bold text-[#141414] font-sans tracking-tight">
          Gesamtsumme
        </h2>
        <p className="text-xs text-[#141414]/60 mt-0.5">
          Zusammenfassung aller Räume und Leistungen
        </p>
      </div>

      {/* Card 1: Statistics (Rooms & Positions) */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden divide-y divide-[#141414]/5 shadow-3xs text-xs">
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-[#141414]/60 font-semibold">Räume</span>
          <span className="font-bold text-[#141414]">{roomCount}</span>
        </div>
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-[#141414]/60 font-semibold">Positionen</span>
          <span className="font-bold text-[#141414]">{positionCount}</span>
        </div>
      </div>

      {/* Card 2: Grand total and colored Export button */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden divide-y divide-[#141414]/5 shadow-3xs">
        {/* Grand Total Row */}
        <div className="p-3.5 bg-brand-accent1/5 flex items-center justify-between">
          <span className="text-xs text-[#141414]/70 font-bold">Gesamtsumme</span>
          <span className="text-base font-black text-brand-accent1">
            {totalSum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
          </span>
        </div>

        {/* Export Button */}
        <button
          id="btn-export-handicraft"
          onClick={triggerExport}
          disabled={positionCount === 0}
          className={`w-full py-3.5 px-4 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            positionCount === 0
              ? 'bg-gray-100 text-[#141414]/30 cursor-not-allowed border-none'
              : 'bg-brand-accent1 hover:bg-brand-accent1/90 text-white shadow-3xs border-none'
          }`}
        >
          <Download className="w-4 h-4" /> HANDICRAFT-Export (.csv)
        </button>
      </div>

    </div>
  );
};
