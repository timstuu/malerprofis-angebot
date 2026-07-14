/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Settings, Info, Check, HelpCircle, FileText } from 'lucide-react';
import { ExportSettings, Project } from '../types';
import { generateHandicraftCSV, downloadCSVFile } from '../utils/exportUtils';

interface ExportSettingsPanelProps {
  project: Project;
  settings: ExportSettings;
  onUpdateSettings: (settings: ExportSettings) => void;
}

export const ExportSettingsPanel: React.FC<ExportSettingsPanelProps> = ({
  project,
  settings,
  onUpdateSettings,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDelimiterChange = (delim: ';' | ',') => {
    onUpdateSettings({
      ...settings,
      delimiter: delim,
      // If delimiter is semicolon, German standard typically uses comma as decimal
      decimalSeparator: delim === ';' ? ',' : '.',
    });
  };

  const handleDecimalChange = (dec: ',' | '.') => {
    onUpdateSettings({
      ...settings,
      decimalSeparator: dec,
    });
  };

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
    
    // Show quick toast notification
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const totalPositions = project.rooms.reduce((sum, r) => sum + r.positions.length, 0);

  return (
    <div className="w-full bg-white border border-[#141414]/5 p-6 rounded-3xl shadow-xs relative" id="export-panel">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#141414] text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 animate-bounce z-50">
          <Check className="w-4 h-4 text-brand-accent2" />
          <span>Schnittstellen-Datei erfolgreich heruntergeladen!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-[#141414] flex items-center gap-2 font-sans">
            <FileText className="w-5 h-5 text-brand-accent1" />
            HANDICRAFT-Schnittstelle (Sonderfunktion 602)
          </h2>
          <p className="text-xs text-[#141414]/60">
            Exportiere die Aufmaße direkt für das Modul AngebotRTF
          </p>
        </div>

        <button
          id="btn-export-handicraft"
          onClick={triggerExport}
          disabled={totalPositions === 0}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            totalPositions === 0
              ? 'bg-gray-200 text-[#141414]/40 cursor-not-allowed opacity-50'
              : 'bg-brand-accent1 hover:bg-brand-accent1/90 text-white shadow-xs'
          }`}
        >
          <Download className="w-4 h-4" /> HANDICRAFT-Export (.csv)
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[#141414]/5">
        
        {/* CSV Format Settings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]/40 flex items-center gap-1.5 font-sans">
            <Settings className="w-3.5 h-3.5 text-brand-accent1" /> CSV-Formateinstellungen
          </h3>
          
          <div className="flex flex-wrap gap-4 text-xs">
            {/* Delimiter Selection */}
            <div>
              <span className="block text-[#141414]/60 font-semibold mb-1.5">Spaltentrennzeichen:</span>
              <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                <button
                  id="btn-delim-semicolon"
                  type="button"
                  onClick={() => handleDelimiterChange(';')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    settings.delimiter === ';' ? 'bg-white text-[#141414] shadow-2xs' : 'text-[#141414]/50 hover:text-[#141414]/80'
                  }`}
                >
                  Semikolon ( ; ) <span className="text-[10px] font-normal text-[#141414]/40">(Standard DE)</span>
                </button>
                <button
                  id="btn-delim-comma"
                  type="button"
                  onClick={() => handleDelimiterChange(',')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    settings.delimiter === ',' ? 'bg-white text-[#141414] shadow-2xs' : 'text-[#141414]/50 hover:text-[#141414]/80'
                  }`}
                >
                  Komma ( , )
                </button>
              </div>
            </div>

            {/* Decimal Separator */}
            <div>
              <span className="block text-[#141414]/60 font-semibold mb-1.5">Dezimaltrennzeichen:</span>
              <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                <button
                  id="btn-decimal-comma"
                  type="button"
                  onClick={() => handleDecimalChange(',')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    settings.decimalSeparator === ',' ? 'bg-white text-[#141414] shadow-2xs' : 'text-[#141414]/50 hover:text-[#141414]/80'
                  }`}
                >
                  Komma ( , )
                </button>
                <button
                  id="btn-decimal-period"
                  type="button"
                  onClick={() => handleDecimalChange('.')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    settings.decimalSeparator === '.' ? 'bg-white text-[#141414] shadow-2xs' : 'text-[#141414]/50 hover:text-[#141414]/80'
                  }`}
                >
                  Punkt ( . )
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info/Help Box Toggle */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-end">
            <button
              id="btn-toggle-help"
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs font-bold text-brand-accent1 hover:text-brand-accent1/80 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> Import-Hilfe anzeigen
            </button>
          </div>

          <p className="text-[11px] text-[#141414]/40 mt-2">
            * Das generierte Dokument enthält ein UTF-8-BOM-Signal, damit deutsche Umlaute (z. B. "Wände") in Excel und HANDICRAFT fehlerfrei dargestellt werden.
          </p>
        </div>
      </div>

      {/* Help box dropdown */}
      {showHelp && (
        <div className="mt-4 p-5 bg-gray-50 border border-[#141414]/5 rounded-3xl text-xs text-[#141414]/70 leading-relaxed space-y-3 animate-fade-in" id="help-content-box">
          <h4 className="font-bold text-[#141414] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-brand-accent1" />
            Anleitung: Import in das Handwerkerprogramm HANDICRAFT
          </h4>
          <ol className="list-decimal pl-4 space-y-2">
            <li>
              Erfasse alle Räume und die dazugehörigen Aufmaßmengen auf der Baustelle.
            </li>
            <li>
              Klicke oben auf <strong>"HANDICRAFT-Export (.csv)"</strong>, um die fertig strukturierte Datei zu speichern.
            </li>
            <li>
              Öffne dein Handwerkerprogramm <strong>HANDICRAFT</strong> und navigiere in das Modul <strong>AngebotRTF</strong>.
            </li>
            <li>
              Wähle im Menü oder über die Tastenkombination die <strong>"Sonderfunktion 602"</strong> (Angebot importieren/bearbeiten).
            </li>
            <li>
              Wähle die heruntergeladene Datei aus. Das Programm liest die Zeilen ein:
              <ul className="list-disc pl-4 mt-1.5 font-mono text-[10px] text-[#141414]/50 space-y-1">
                <li>Raumzeilen (z. B. <code className="bg-white border border-[#141414]/5 px-1.5 py-0.5 rounded">1;;;Raum: Wohnzimmer;</code>) werden als Titelüberschriften interpretiert.</li>
                <li>Leistungszeilen (z. B. <code className="bg-white border border-[#141414]/5 px-1.5 py-0.5 rounded">1.01;24,50;qm;Wände spachteln Q3;14,50</code>) werden mit Positionsnummer, Menge, Einheit, Text und Preis eingelesen.</li>
              </ul>
            </li>
          </ol>
          <p className="text-[11px] text-brand-accent2 font-bold italic pt-1">
            Hinweis: Falsche Mengeneinheiten werden vom Import-Prüfer abgelehnt. Verwende daher nur die vordefinierten Mengeneinheiten (qm, m, Stk, Std, Psch).
          </p>
        </div>
      )}
    </div>
  );
};
