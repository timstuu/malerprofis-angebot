/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Check, Sparkles } from 'lucide-react';
import { ServiceTile } from '../types';

interface ServiceTileGridProps {
  tiles: ServiceTile[];
  onTileClick: (tile: ServiceTile) => void;
  onAddTile: (tile: Omit<ServiceTile, 'id'>) => void;
  onEditTile: (tile: ServiceTile) => void;
  onDeleteTile: (id: string) => void;
}

export const ServiceTileGrid: React.FC<ServiceTileGridProps> = ({
  tiles,
  onTileClick,
  onAddTile,
  onEditTile,
  onDeleteTile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('qm');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('slate');

  const colorMap: Record<string, { bg: string; text: string; border: string; accent: string; hover: string; circleBg: string; iconColor: string }> = {
    emerald: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-brand-accent2', hover: 'hover:border-brand-accent2/30 hover:shadow-xs', circleBg: 'bg-brand-accent2/10', iconColor: 'text-brand-accent2' },
    sky: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-brand-accent1', hover: 'hover:border-brand-accent1/30 hover:shadow-xs', circleBg: 'bg-brand-accent1/10', iconColor: 'text-brand-accent1' },
    amber: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-amber-500', hover: 'hover:border-amber-450 hover:shadow-xs', circleBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    indigo: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-indigo-500', hover: 'hover:border-indigo-400 hover:shadow-xs', circleBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    violet: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-violet-500', hover: 'hover:border-violet-400 hover:shadow-xs', circleBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    rose: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-red-500', hover: 'hover:border-red-400 hover:shadow-xs', circleBg: 'bg-red-50', iconColor: 'text-red-500' },
    slate: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-slate-500', hover: 'hover:border-slate-400 hover:shadow-xs', circleBg: 'bg-gray-100', iconColor: 'text-slate-600' },
    orange: { bg: 'bg-white', text: 'text-[#141414]', border: 'border-[#141414]/5', accent: 'bg-orange-500', hover: 'hover:border-orange-400 hover:shadow-xs', circleBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice)) return;

    if (isEditing) {
      onEditTile({
        id: isEditing,
        name,
        unit,
        price: parsedPrice,
        color,
      });
      setIsEditing(null);
    } else {
      onAddTile({
        name,
        unit,
        price: parsedPrice,
        color,
      });
      setIsAdding(false);
    }

    // Reset Form
    setName('');
    setUnit('qm');
    setPrice('');
    setColor('slate');
  };

  const cancelForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setName('');
    setUnit('qm');
    setPrice('');
    setColor('slate');
  };

  const colorOptions = ['sky', 'emerald', 'amber', 'indigo', 'violet', 'rose', 'slate', 'orange'];

  return (
    <div className="w-full" id="service-tile-grid-container">
      {/* Grid Headers and Toggle Form */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#141414] tracking-tight font-sans">
             Leistungen
          </h2>
          <p className="text-xs text-[#141414]/60 mt-0.5">
            Kachel antippen zur schnellen Aufmaß-Erfassung
          </p>
        </div>
        {!isAdding && !isEditing && (
          <button
            id="btn-add-tile-toggle"
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold px-4 py-2.5 bg-brand-accent1 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:bg-brand-accent1/90"
          >
            <Plus className="w-3.5 h-3.5" /> Neue Kachel
          </button>
        )}
      </div>

      {/* Adding / Editing Inline Form */}
      {(isAdding || isEditing) && (
        <form onSubmit={handleSave} className="bg-gray-50 p-5 rounded-3xl border border-[#141414]/5 mb-6 shadow-xs animate-fade-in" id="tile-form">
          <h3 className="font-bold text-sm text-[#141414] mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-accent1" />
            {isEditing ? 'Leistung bearbeiten' : 'Neue Leistung hinzufügen'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-1.5">Leistungsbezeichnung</label>
              <input
                id="input-tile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Decken tapezieren"
                className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-1.5">Einheit</label>
                <select
                  id="select-tile-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all cursor-pointer"
                >
                  <option value="qm">qm</option>
                  <option value="m">m</option>
                  <option value="Stk">Stk</option>
                  <option value="Std">Std</option>
                  <option value="Psch">Psch</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-1.5">Einzelpreis (€)</label>
                <input
                  id="input-tile-price"
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="12,50"
                  className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2">Kachel-Farbe</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => {
                const isSelected = color === c;
                const mapped = colorMap[c] || colorMap.slate;
                return (
                  <button
                    key={c}
                    id={`btn-color-select-${c}`}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${mapped.accent} ${
                      isSelected ? 'ring-2 ring-brand-accent1 ring-offset-2 scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              id="btn-tile-form-cancel"
              type="button"
              onClick={cancelForm}
              className="px-4 py-2.5 bg-gray-200 text-gray-750 font-bold rounded-xl cursor-pointer hover:bg-gray-300 transition-colors"
            >
              Abbrechen
            </button>
            <button
              id="btn-tile-form-save"
              type="submit"
              className="px-5 py-2.5 bg-brand-accent2 hover:bg-brand-accent2/90 text-white font-bold rounded-xl cursor-pointer transition-colors"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* POS Tiles Grid (4 columns on larger viewports) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tiles.map((tile) => {
          const colors = colorMap[tile.color || 'slate'] || colorMap.slate;
          return (
            <div
              key={tile.id}
              id={`service-tile-${tile.id}`}
              onClick={() => onTileClick(tile)}
              className={`relative bg-white border border-[#141414]/5 ${colors.hover} rounded-2xl p-4 flex flex-col justify-between items-stretch transition-all duration-250 shadow-3xs cursor-pointer group active:scale-95 min-h-[100px]`}
            >
              {/* Service Info (Top Left Aligned) */}
              <h3 className="text-xs font-bold text-[#141414] tracking-tight leading-snug font-sans text-left line-clamp-2">
                {tile.name}
              </h3>

              {/* Price per unit (Bottom Right Aligned) */}
              <div className="text-right mt-auto pt-2">
                <span className="text-[10px] font-black font-mono tracking-tight text-brand-accent1">
                  {tile.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / {tile.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
