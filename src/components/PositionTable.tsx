/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, FileSpreadsheet, Eye, EyeOff, Calculator } from 'lucide-react';
import { Room, Position } from '../types';

interface PositionTableProps {
  activeRoom: Room | null;
  onEditPosition: (roomId: string, posId: string, newQuantity: number) => void;
  onDeletePosition: (roomId: string, posId: string) => void;
  allRooms: Room[]; // Passed to display a project-wide grand summary if wanted
}

export const PositionTable: React.FC<PositionTableProps> = ({
  activeRoom,
  onEditPosition,
  onDeletePosition,
  allRooms,
}) => {
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [showAllRooms, setShowAllRooms] = useState(false);

  const startEditing = (pos: Position) => {
    setEditingPosId(pos.id);
    setEditQuantity(String(pos.quantity).replace('.', ','));
  };

  const handleEditSubmit = (roomId: string, posId: string, e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(editQuantity.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    onEditPosition(roomId, posId, parsed);
    setEditingPosId(null);
  };

  const calculateRoomTotal = (room: Room): number => {
    return room.positions.reduce((sum, pos) => sum + pos.totalPrice, 0);
  };

  const calculateGrandTotal = (): number => {
    return allRooms.reduce((sum, r) => sum + calculateRoomTotal(r), 0);
  };

  const totalPositionsCount = allRooms.reduce((sum, r) => sum + r.positions.length, 0);

  return (
    <div className="w-full space-y-6" id="positions-section">
      {/* 1. Active Room Positions Table */}
      <div className="bg-white rounded-3xl border border-[#141414]/5 p-6 shadow-xs" id="active-room-positions">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#141414]/5">
          <div>
            <h2 className="text-lg font-bold text-[#141414] flex items-center gap-2 font-sans tracking-tight">
              <FileSpreadsheet className="w-5 h-5 text-brand-accent1" />
              Positionen im Raum
            </h2>
            <p className="text-xs text-[#141414]/60">
              {activeRoom ? `Aktueller Raum: "${activeRoom.name}"` : 'Wähle einen Raum aus, um Positionen zu sehen'}
            </p>
          </div>

          {activeRoom && (
            <div className="bg-brand-accent1/10 px-4 py-2 rounded-2xl border-none text-right">
              <span className="text-[10px] font-bold text-brand-accent1 block uppercase tracking-wider font-sans">Raum-Summe</span>
              <span className="text-base font-extrabold text-brand-accent1 font-mono">
                {calculateRoomTotal(activeRoom).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          )}
        </div>

        {!activeRoom ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#141414]/50">Bitte wähle einen Raum aus, um dessen Positionen anzuzeigen oder zu bearbeiten.</p>
          </div>
        ) : activeRoom.positions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#141414]/10 rounded-2xl bg-gray-50/50">
            <Calculator className="w-8 h-8 text-[#141414]/30 mx-auto mb-2.5" />
            <p className="text-sm text-[#141414]/60 font-medium">Bislang keine Aufmaße in diesem Raum erfasst.</p>
            <p className="text-xs text-[#141414]/40 mt-1">Klicke rechts auf die großen Kacheln, um Leistungen hinzuzufügen.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="active-positions-table">
              <thead>
                <tr className="border-b border-[#141414]/5 text-[10px] font-bold text-[#141414]/40 uppercase tracking-wider font-sans">
                  <th className="py-3 px-3">Pos.</th>
                  <th className="py-3 px-3">Leistung</th>
                  <th className="py-3 px-3 text-right">Menge</th>
                  <th className="py-3 px-3 text-center">Einheit</th>
                  <th className="py-3 px-3 text-right">Einzel (€)</th>
                  <th className="py-3 px-3 text-right">Gesamt (€)</th>
                  <th className="py-3 px-3 text-center">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/5 text-sm">
                {activeRoom.positions.map((pos, idx) => {
                  const isEditing = pos.id === editingPosId;
                  const posCode = `${allRooms.indexOf(activeRoom) + 1}.${String(idx + 1).padStart(2, '0')}`;

                  return (
                    <tr key={pos.id} className="hover:bg-gray-50/50 transition-colors" id={`pos-row-${pos.id}`}>
                      {/* Code */}
                      <td className="py-3.5 px-3 font-mono text-xs font-bold text-[#141414]/40">
                        {posCode}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-3 font-semibold text-[#141414]">
                        {pos.name}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3 text-right">
                        {isEditing ? (
                          <form
                            id={`form-edit-pos-${pos.id}`}
                            onSubmit={(e) => handleEditSubmit(activeRoom.id, pos.id, e)}
                            className="flex items-center justify-end gap-1.5"
                          >
                            <input
                              id={`input-edit-qty-${pos.id}`}
                              type="text"
                              required
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-18 p-1.5 text-right font-mono text-xs bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-brand-accent1/20"
                            />
                          </form>
                        ) : (
                          <span className="font-mono font-semibold text-[#141414]">
                            {pos.quantity.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-3 text-center font-medium text-[#141414]/60 text-xs">
                        {pos.unit}
                      </td>

                      {/* Single Price */}
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-[#141414]/50">
                        {pos.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Total Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#141414]">
                        {pos.totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                id={`btn-save-pos-edit-${pos.id}`}
                                onClick={(e) => handleEditSubmit(activeRoom.id, pos.id, e)}
                                className="p-1.5 text-brand-accent2 hover:bg-brand-accent2/10 rounded-lg cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                id={`btn-cancel-pos-edit-${pos.id}`}
                                onClick={() => setEditingPosId(null)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                id={`btn-edit-pos-trigger-${pos.id}`}
                                onClick={() => startEditing(pos)}
                                className="p-1.5 text-[#141414]/40 hover:text-brand-accent1 hover:bg-brand-accent1/10 rounded-lg transition-all cursor-pointer"
                                title="Menge bearbeiten"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-delete-pos-trigger-${pos.id}`}
                                onClick={() => {
                                  if (confirm(`Position "${pos.name}" wirklich löschen?`)) {
                                    onDeletePosition(activeRoom.id, pos.id);
                                  }
                                }}
                                className="p-1.5 text-[#141414]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Global Project Summary */}
      <div className="bg-[#141414] text-white rounded-3xl p-6 shadow-sm border border-[#141414]/10" id="grand-summary-widget">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-sans">
              Projekt-Gesamtsumme
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Zusammenfassung aller Räume und Leistungen
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 font-mono">Gesamt:</span>
            <span className="text-3xl font-extrabold text-brand-accent2 tracking-tight font-mono">
              {calculateGrandTotal().toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10 text-sm">
          <div>
            <span className="text-xs text-white/50 block">Räume gesamt</span>
            <span className="text-lg font-bold block mt-0.5 font-mono">{allRooms.length}</span>
          </div>
          <div>
            <span className="text-xs text-white/50 block">Positionen gesamt</span>
            <span className="text-lg font-bold block mt-0.5 font-mono">{totalPositionsCount}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <button
              id="btn-toggle-full-breakdown"
              onClick={() => setShowAllRooms(!showAllRooms)}
              disabled={totalPositionsCount === 0}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                totalPositionsCount === 0 
                  ? 'border-white/5 text-white/30 cursor-not-allowed opacity-50' 
                  : 'border-white/10 hover:border-white/20 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95'
              }`}
            >
              {showAllRooms ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Aufteilung verbergen
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Gesamtes Aufmaß zeigen
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Project-wide breakdown */}
        {showAllRooms && totalPositionsCount > 0 && (
          <div className="mt-5 pt-5 border-t border-white/10 space-y-4 animate-fade-in" id="project-breakdown-panel">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Aufmaß-Dokumentation</h4>
            {allRooms.map((room, roomIdx) => {
              if (room.positions.length === 0) return null;
              const roomTotal = calculateRoomTotal(room);

              return (
                <div key={room.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-white/5">
                    <span className="text-xs font-bold text-brand-accent1">
                      Raum #{roomIdx + 1}: {room.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {roomTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-white/75">
                    {room.positions.map((pos, posIdx) => (
                      <li key={pos.id} className="flex justify-between items-center">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-white/30">
                            {roomIdx + 1}.{String(posIdx + 1).padStart(2, '0')}
                          </span>
                          <span className="truncate">{pos.name}</span>
                        </div>
                        <div className="font-mono flex-shrink-0 flex gap-4">
                          <span>
                            {pos.quantity.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {pos.unit}
                          </span>
                          <span className="text-brand-accent2 w-16 text-right">
                            {pos.totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
