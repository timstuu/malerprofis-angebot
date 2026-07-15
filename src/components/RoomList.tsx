/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Home, FileEdit, Trash2, Check, X } from 'lucide-react';
import { Room } from '../types';

interface RoomListProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onAddRoom: (name: string) => void;
  onEditRoom: (id: string, newName: string) => void;
  onDeleteRoom: (id: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim());
    setNewRoomName('');
    setIsAdding(false);
  };

  const startEditing = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(room.id);
    setEditingName(room.name);
  };

  const handleEditSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    onEditRoom(id, editingName.trim());
    setEditingId(null);
  };

  const calculateRoomTotal = (room: Room): number => {
    return room.positions.reduce((sum, pos) => sum + pos.totalPrice, 0);
  };

  return (
    <div className="w-full flex flex-col space-y-4" id="room-list-container">
      {/* Header section (container-less) */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-[#141414] font-sans tracking-tight">
            Abschnitte / Räume
          </h2>
          <p className="text-xs text-[#141414]/60 mt-0.5">
            Wähle den aktiven Raum für das Aufmaß
          </p>
        </div>
        {!isAdding && (
          <button
            id="btn-add-room-toggle"
            onClick={() => setIsAdding(true)}
            className="p-3 bg-brand-accent1/10 hover:bg-brand-accent1/15 text-brand-accent1 rounded-xl transition-all cursor-pointer"
            title="Raum hinzufügen"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add Room Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-gray-50 p-4 rounded-2xl border border-[#141414]/5 flex gap-2.5 animate-fade-in" id="add-room-form">
          <input
            id="input-new-room-name"
            type="text"
            required
            autoFocus
            placeholder="z. B. Wohnzimmer"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-1 p-3 text-sm bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all"
          />
          <button
            id="btn-submit-new-room"
            type="submit"
            className="p-3 bg-brand-accent2 text-white rounded-xl cursor-pointer hover:bg-brand-accent2/90 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            id="btn-cancel-new-room"
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-3 bg-gray-200 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Unified Room List Container without spacing */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden divide-y divide-[#141414]/5 max-h-[340px] overflow-y-auto pr-0 shadow-3xs">
        {rooms.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#141414]/10 rounded-2xl m-4">
            <p className="text-xs text-[#141414]/60">Keine Räume angelegt.</p>
            <button
              id="btn-create-first-room"
              onClick={() => setIsAdding(true)}
              className="text-xs font-bold text-brand-accent1 hover:underline mt-2 cursor-pointer"
            >
              + Ersten Raum anlegen
            </button>
          </div>
        ) : (
          rooms.map((room, idx) => {
            const isActive = room.id === activeRoomId;
            const isEditing = room.id === editingId;
            const total = calculateRoomTotal(room);

            if (isEditing) {
              return (
                <form
                  key={room.id}
                  id={`form-edit-room-${room.id}`}
                  onSubmit={(e) => handleEditSubmit(room.id, e)}
                  className="flex items-center gap-2 p-2.5 bg-gray-50 border-b border-[#141414]/5"
                >
                  <input
                    id={`input-edit-room-${room.id}`}
                    type="text"
                    required
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 p-2 text-sm bg-gray-100 rounded-xl border-none focus:outline-none"
                  />
                  <button
                    id={`btn-save-room-edit-${room.id}`}
                    type="submit"
                    className="p-2 bg-brand-accent2 text-white rounded-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-cancel-room-edit-${room.id}`}
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-2 bg-gray-200 text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              );
            }

            return (
              <React.Fragment key={room.id}>
                {/* Row 1: The Room Item */}
                <div
                  id={`room-item-${room.id}`}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left p-3.5 transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-brand-accent1 text-white'
                      : 'bg-white hover:bg-gray-50 text-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <span className={`p-2 rounded-xl flex-shrink-0 ${isActive ? 'bg-white/15 text-white' : 'bg-gray-100 text-brand-accent1 shadow-2xs'}`}>
                      <Home className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm tracking-tight truncate font-sans">
                        {room.name}
                      </h3>
                    </div>
                  </div>

                  {/* Room-Sum on the right */}
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-white/95' : 'text-brand-accent1'}`}>
                    {total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                </div>

                {/* Row 2: Selected Room Actions (Edit & Delete side-by-side) */}
                {isActive && (
                  <div className="flex divide-x divide-[#141414]/5 text-xs text-[#141414]/70 bg-gray-50/50">
                    <button
                      id={`btn-edit-room-${room.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(room, e);
                      }}
                      className="flex-1 py-2.5 hover:bg-gray-100 flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all"
                      title="Raum umbenennen"
                    >
                      <FileEdit className="w-3.5 h-3.5" /> Bearbeiten
                    </button>
                    <button
                      id={`btn-delete-room-${room.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Möchtest du den Raum "${room.name}" und alle seine Positionen wirklich löschen?`)) {
                          onDeleteRoom(room.id);
                        }
                      }}
                      className="flex-1 py-2.5 hover:bg-red-50 text-red-500 flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all"
                      title="Raum löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Löschen
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
