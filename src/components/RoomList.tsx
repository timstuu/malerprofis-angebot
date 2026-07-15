/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, FileEdit, Trash2, Check, X, GripVertical } from 'lucide-react';
import { Room } from '../types';

interface RoomListProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onAddRoom: (name: string) => void;
  onEditRoom: (id: string, newName: string) => void;
  onDeleteRoom: (id: string) => void;
  onReorderRooms?: (rooms: Room[]) => void;
}

// Inline input editor for renaming rooms in edit mode
const RoomRowInput: React.FC<{
  room: Room;
  onEditRoom: (id: string, newName: string) => void;
}> = ({ room, onEditRoom }) => {
  const [val, setVal] = useState(room.name);

  useEffect(() => {
    setVal(room.name);
  }, [room.name]);

  const handleSave = () => {
    const trimmed = val.trim();
    if (trimmed && trimmed !== room.name) {
      onEditRoom(room.id, trimmed);
    }
  };

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="w-full px-2 py-1 bg-gray-100 rounded-lg text-sm font-bold text-[#141414] focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 border-none transition-all"
      placeholder="Abschnittsname"
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onReorderRooms,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim());
    setNewRoomName('');
    setIsAdding(false);
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
        <button
          id="btn-edit-rooms-mode-toggle"
          onClick={() => {
            setIsEditMode(prev => !prev);
            setIsAdding(false);
          }}
          className={`p-3 rounded-xl transition-all cursor-pointer ${
            isEditMode
              ? 'bg-[#141414] text-white shadow-3xs'
              : 'bg-brand-accent1/10 hover:bg-brand-accent1/15 text-brand-accent1'
          }`}
          title="Abschnitte bearbeiten"
        >
          <FileEdit className="w-4 h-4" />
        </button>
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
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden divide-y divide-[#141414]/5 max-h-[340px] overflow-y-auto pr-0 shadow-3xs" id="rooms-list-card">
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
          <>
            {rooms.map((room, idx) => {
              const isActive = room.id === activeRoomId;
              const total = calculateRoomTotal(room);

              return (
                <div
                  key={room.id}
                  id={`room-item-${room.id}`}
                  onClick={() => !isEditMode && onSelectRoom(room.id)}
                  draggable={isEditMode}
                  onDragStart={(e) => {
                    if (!isEditMode) return;
                    e.dataTransfer.setData('text/plain', String(idx));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!isEditMode) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    if (!isEditMode || !onReorderRooms) return;
                    e.preventDefault();
                    const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (draggedIdx === idx) return;

                    const newRooms = [...rooms];
                    const [removed] = newRooms.splice(draggedIdx, 1);
                    newRooms.splice(idx, 0, removed);

                    const updated = newRooms.map((r, i) => ({ ...r, sortOrder: i }));
                    onReorderRooms(updated);
                  }}
                  className={`w-full text-left p-3.5 transition-all flex items-center justify-between group ${
                    isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  } ${
                    isActive
                      ? 'bg-brand-accent1 text-white animate-fade-in'
                      : 'bg-white hover:bg-gray-50 text-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0 flex-1">
                    {isEditMode && (
                      <GripVertical className="w-3.5 h-3.5 text-[#141414]/30 cursor-grab active:cursor-grabbing flex-shrink-0" />
                    )}
                    <span className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs font-mono transition-all ${
                      isActive ? 'bg-white/15 text-white' : 'bg-gray-100 text-brand-accent1 shadow-2xs'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {isEditMode ? (
                        <RoomRowInput room={room} onEditRoom={onEditRoom} />
                      ) : (
                        <h3 className="font-bold text-sm tracking-tight truncate font-sans">
                          {room.name}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Right side: Delete button in edit mode, Room-Sum in normal mode */}
                  {isEditMode ? (
                    <button
                      id={`btn-delete-room-edit-${room.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Möchtest du den Raum "${room.name}" und alle seine Positionen wirklich löschen?`)) {
                          onDeleteRoom(room.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                      title="Raum löschen"
                    >
                      <X className="w-4 h-4 font-bold" />
                    </button>
                  ) : (
                    <span className={`font-mono text-xs font-bold flex-shrink-0 ml-2 ${isActive ? 'text-white/95' : 'text-brand-accent1'}`}>
                      {total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                  )}
                </div>
              );
            })}

            {/* Inline Large Button for adding new room, styled like standard list item */}
            {!isAdding && !isEditMode && (
              <div
                id="btn-add-room-inline"
                onClick={() => setIsAdding(true)}
                className="w-full text-left p-3.5 bg-gray-50/30 hover:bg-gray-50 text-brand-accent1 transition-all cursor-pointer flex items-center justify-between text-xs font-bold font-sans"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-brand-accent1/10 text-brand-accent1 shadow-2xs font-bold text-base">
                    +
                  </span>
                  <span>Neuen Abschnitt / Raum hinzufügen</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
