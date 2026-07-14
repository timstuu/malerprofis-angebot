/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check, Calculator } from 'lucide-react';
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
    const cleanProjectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanProjNum = project.projectNumber.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = project.date.replace(/[^a-zA-Z0-9]/g, '-');
    
    let filename = settings.filenameTemplate
      .replace('{projectNumber}', cleanProjNum || 'PRJ')
      .replace('{projectName}', cleanProjectName || 'PROJEKT')
      .replace('{date}', dateStr);
      
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
    <div className="w-full flex flex-col space-y-4 relative" id="export-panel">
      
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
          Auswertung & Export
        </h2>
        <p className="text-xs text-[#141414]/60 mt-0.5">
          Projekt-Statistiken und HANDICRAFT-Datei (Sonderfunktion 602)
        </p>
      </div>

      {/* Grouped Statistics & Export Container */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden divide-y divide-[#141414]/5 shadow-3xs">
        
        {/* Row 1: Rooms & Positions count side-by-side */}
        <div className="grid grid-cols-2 divide-x divide-[#141414]/5 text-xs text-center">
          <div className="p-3">
            <span className="text-[10px] text-[#141414]/40 font-bold block uppercase tracking-wider">Räume</span>
            <span className="text-base font-black text-[#141414] block mt-0.5">{roomCount}</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] text-[#141414]/40 font-bold block uppercase tracking-wider">Positionen</span>
            <span className="text-base font-black text-[#141414] block mt-0.5">{positionCount}</span>
          </div>
        </div>

        {/* Row 2: Total Sum */}
        <div className="p-4 bg-brand-accent1/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-brand-accent1 font-bold block uppercase tracking-wider">Gesamtsumme</span>
            <span className="text-lg font-black text-[#141414] block mt-0.5">
              {totalSum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
          </div>
          <Calculator className="w-8 h-8 text-brand-accent1/20" />
        </div>

        {/* Row 3: Export Button */}
        <button
          id="btn-export-handicraft"
          onClick={triggerExport}
          disabled={positionCount === 0}
          className={`w-full py-3.5 px-4 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            positionCount === 0
              ? 'bg-gray-50 text-[#141414]/30 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-brand-accent1 hover:text-brand-accent1/90'
          }`}
        >
          <Download className="w-4 h-4" /> HANDICRAFT-Export (.csv)
        </button>

      </div>

    </div>
  );
};
