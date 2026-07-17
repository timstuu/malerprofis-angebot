/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { ExportSettings, Project } from '../types';
import { generateGaebXml, downloadGaebFile } from '../utils/exportUtils';

interface ExportSettingsPanelProps {
  project: Project;
  settings: ExportSettings;
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({
  project,
  settings,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate statistics
  const roomCount = project.rooms.length;
  const positionCount = project.rooms.reduce((sum, r) => sum + r.positions.length, 0);
  const totalSum = project.rooms.reduce(
    (sum, r) => sum + r.positions.reduce((pSum, pos) => pSum + pos.totalPrice, 0),
    0
  );

  const triggerExport = () => {
    const xmlContent = generateGaebXml(project);
    
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
      
    if (!filename.endsWith('.x83')) {
      filename += '.x83';
    }

    downloadGaebFile(xmlContent, filename);
    
    // Trigger download animation
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="w-full flex flex-col space-y-4 relative text-[#141414]" id="export-panel">
      


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
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white border border-[#141414]/10 rounded-xl p-3 flex justify-between items-center shadow-3xs">
          <span className="text-[#141414]/60 font-semibold">Räume</span>
          <span className="font-bold text-[#141414]">{roomCount}</span>
        </div>
        <div className="bg-white border border-[#141414]/10 rounded-xl p-3 flex justify-between items-center shadow-3xs">
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
          id="btn-export-gaeb"
          onClick={triggerExport}
          disabled={positionCount === 0}
          className={`w-full py-3.5 px-4 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            positionCount === 0
              ? 'bg-gray-100 text-[#141414]/30 cursor-not-allowed border-none'
              : 'bg-brand-accent1 hover:bg-brand-accent1/90 text-white shadow-3xs border-none'
          }`}
        >
          <Download className={`w-4 h-4 ${isAnimating ? 'animate-download-bounce' : ''}`} /> GAEB-Export (.x83)
        </button>
      </div>

    </div>
  );
};
