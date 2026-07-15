/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Fragment } from 'react';
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
  // Dynamically extract categories (Tabs) from tiles list
  const tabs = Array.from(new Set(tiles.map((tile) => tile.category).filter(Boolean))) as string[];
  const [activeTab, setActiveTab] = useState('');

  // Synchronize activeTab if tiles or categories list changes
  useEffect(() => {
    if (tabs.length > 0) {
      if (!activeTab || !tabs.includes(activeTab)) {
        setActiveTab(tabs[0]);
      }
    } else {
      setActiveTab('');
    }
  }, [tiles, activeTab]);

  const colorMap: Record<string, { hover: string; text: string }> = {
    emerald: { hover: 'hover:border-brand-accent2/35 hover:shadow-xs', text: 'text-brand-accent2' },
    sky: { hover: 'hover:border-brand-accent1/35 hover:shadow-xs', text: 'text-brand-accent1' },
    amber: { hover: 'hover:border-amber-400/30 hover:shadow-xs', text: 'text-amber-600' },
    orange: { hover: 'hover:border-orange-400/30 hover:shadow-xs', text: 'text-orange-600' },
    slate: { hover: 'hover:border-slate-400/30 hover:shadow-xs', text: 'text-slate-655' },
  };

  const filteredTiles = tiles.filter((tile) => tile.category === activeTab);

  // Group filtered tiles by subcategory
  const groups: Record<string, ServiceTile[]> = {};
  filteredTiles.forEach((tile) => {
    const sub = tile.subcategory || '';
    if (!groups[sub]) {
      groups[sub] = [];
    }
    groups[sub].push(tile);
  });

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
      {tabs.length > 0 && (
        <div className="flex flex-nowrap overflow-x-auto scrollbar-none gap-6 text-sm font-bold mb-6 pb-2 border-b border-[#141414]/5 whitespace-nowrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-colors flex-shrink-0 uppercase ${
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
      )}

      {/* POS Tiles Grid or Empty State */}
      {filteredTiles.length === 0 ? (
        <div className="text-center py-12 bg-white border border-[#141414]/5 rounded-2xl text-xs text-[#141414]/40 font-medium">
          Keine Leistungen in dieser Kategorie vorhanden.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(groups).map(([sub, groupTiles]) => (
            <Fragment key={sub}>
              {/* Render Sub-Reiter Section Header */}
              {sub && (
                <div className="col-span-full mt-4 mb-2 text-xs font-black text-brand-accent1/80 uppercase tracking-wider border-b border-[#141414]/5 pb-1 flex items-center gap-2">
                  <span>{sub}</span>
                  <div className="flex-1 h-[1px] bg-[#141414]/5"></div>
                </div>
              )}
              {groupTiles.map((tile) => {
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
                        {tile.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €{tile.unit ? ` / ${tile.unit}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
