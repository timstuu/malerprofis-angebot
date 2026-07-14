/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceTile } from '../types';

interface ServiceTileGridProps {
  tiles: ServiceTile[];
  onTileClick: (tile: ServiceTile) => void;
  onAddTile?: (tile: Omit<ServiceTile, 'id'>) => void;
  onEditTile?: (tile: ServiceTile) => void;
  onDeleteTile?: (id: string) => void;
}

export const ServiceTileGrid: React.FC<ServiceTileGridProps> = ({
  tiles,
  onTileClick,
}) => {
  const tabs = ['Stundenlohnarbeiten', 'Abdeckarbeiten', 'Baustelleneinrichtung', 'Gerüstarbeiten'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const colorMap: Record<string, { hover: string; text: string }> = {
    emerald: { hover: 'hover:border-brand-accent2/35 hover:shadow-xs', text: 'text-brand-accent2' },
    sky: { hover: 'hover:border-brand-accent1/35 hover:shadow-xs', text: 'text-brand-accent1' },
    amber: { hover: 'hover:border-amber-400/30 hover:shadow-xs', text: 'text-amber-600' },
    orange: { hover: 'hover:border-orange-400/30 hover:shadow-xs', text: 'text-orange-600' },
    slate: { hover: 'hover:border-slate-400/30 hover:shadow-xs', text: 'text-slate-650' },
  };

  const filteredTiles = tiles.filter((tile) => tile.category === activeTab);

  return (
    <div className="w-full" id="service-tile-grid-container">
      {/* Header section (container-less) */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#141414] tracking-tight font-sans">
          Leistungen
        </h2>
        <p className="text-xs text-[#141414]/60 mt-0.5">
          Kachel antippen zur schnellen Aufmaß-Erfassung
        </p>
      </div>

      {/* Tabs Menu (Reiter) */}
      <div className="flex flex-wrap gap-6 text-sm font-bold mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer transition-colors ${
                isActive
                  ? 'text-[#141414] font-black'
                  : 'text-[#141414]/40 hover:text-[#141414]/75 font-semibold'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* POS Tiles Grid (4 columns on larger viewports) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTiles.map((tile) => {
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
