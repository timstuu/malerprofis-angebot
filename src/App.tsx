/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, 
  Plus, 
  FolderOpen, 
  Settings2, 
  Trash2, 
  FileEdit, 
  Sparkles, 
  RefreshCw, 
  Info, 
  FolderGit, 
  Database,
  ChevronDown,
  X
} from 'lucide-react';

import { Project, Room, Position, ServiceTile, ExportSettings } from './types';
import { DEFAULT_SERVICE_TILES, DEFAULT_EXPORT_SETTINGS } from './constants';
import { NumericKeypad } from './components/NumericKeypad';
import { ServiceTileGrid } from './components/ServiceTileGrid';
import { RoomList } from './components/RoomList';
import { PositionTable } from './components/PositionTable';
import { ExportSettingsPanel } from './components/ExportSettingsPanel';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';

// --- SAMPLE INITIAL DATA FOR IMMACULATE UX ON FIRST LAUNCH ---
const createSampleProject = (): Project => {
  return {
    id: 'sample-project-1',
    name: 'EFH Müller - Renovierung',
    projectNumber: 'PR-2026-042',
    date: '2026-07-09',
    description: 'Erdgeschoss und Flur Malerarbeiten, Spachteln Q3 & Vliestapezierung',
    createdAt: Date.now() - 86400000, // 1 day ago
    rooms: [
      {
        id: 'sample-room-1',
        name: 'Wohnzimmer',
        sortOrder: 0,
        positions: [
          {
            id: 'sample-pos-1',
            tileId: 'tile-1',
            name: 'Wände spachteln Q3',
            quantity: 42.50,
            unit: 'qm',
            price: 14.50,
            totalPrice: 616.25,
            timestamp: Date.now() - 3600000 * 3
          },
          {
            id: 'sample-pos-2',
            tileId: 'tile-2',
            name: 'Oberflächen schleifen',
            quantity: 42.50,
            unit: 'qm',
            price: 4.20,
            totalPrice: 178.50,
            timestamp: Date.now() - 3600000 * 2.8
          },
          {
            id: 'sample-pos-3',
            tileId: 'tile-3',
            name: 'Tiefgrund grundieren',
            quantity: 42.50,
            unit: 'qm',
            price: 3.80,
            totalPrice: 161.50,
            timestamp: Date.now() - 3600000 * 2.5
          },
          {
            id: 'sample-pos-4',
            tileId: 'tile-4',
            name: 'Vlies tapezieren',
            quantity: 38.00,
            unit: 'qm',
            price: 18.90,
            totalPrice: 718.20,
            timestamp: Date.now() - 3600000 * 2
          }
        ]
      },
      {
        id: 'sample-room-2',
        name: 'Flur & Eingangsbereich',
        sortOrder: 1,
        positions: [
          {
            id: 'sample-pos-5',
            tileId: 'tile-1',
            name: 'Wände spachteln Q3',
            quantity: 18.20,
            unit: 'qm',
            price: 14.50,
            totalPrice: 263.90,
            timestamp: Date.now() - 3600000 * 1.5
          },
          {
            id: 'sample-pos-6',
            tileId: 'tile-3',
            name: 'Tiefgrund grundieren',
            quantity: 18.20,
            unit: 'qm',
            price: 3.80,
            totalPrice: 69.16,
            timestamp: Date.now() - 3600000 * 1.2
          },
          {
            id: 'sample-pos-7',
            tileId: 'tile-6',
            name: 'Acrylfugen spritzen',
            quantity: 15.00,
            unit: 'm',
            price: 2.50,
            totalPrice: 37.50,
            timestamp: Date.now() - 3600000 * 1.0
          }
        ]
      },
      {
        id: 'sample-room-3',
        name: 'Küche',
        sortOrder: 2,
        positions: [] // Empty to let user experiment with adding items
      }
    ]
  };
};

export default function App() {
  // --- STATE DECLARATIONS ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  const [serviceTiles, setServiceTiles] = useState<ServiceTile[]>([]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  
  // Modals & Popups
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedTileForInput, setSelectedTileForInput] = useState<ServiceTile | null>(null);
  const [targetRoomForInput, setTargetRoomForInput] = useState<string>('');
  
  // Quick quantity entry keyboard input
  const [keypadValue, setKeypadValue] = useState('');

  // --- INITIALIZATION (LOCAL STORAGE SYNC) ---
  useEffect(() => {
    // 1. Service Tiles
    const cachedTiles = localStorage.getItem('maler_service_tiles');
    if (cachedTiles) {
      setServiceTiles(JSON.parse(cachedTiles));
    } else {
      setServiceTiles(DEFAULT_SERVICE_TILES);
      localStorage.setItem('maler_service_tiles', JSON.stringify(DEFAULT_SERVICE_TILES));
    }

    // 2. Export Settings
    const cachedSettings = localStorage.getItem('maler_export_settings');
    if (cachedSettings) {
      setExportSettings(JSON.parse(cachedSettings));
    } else {
      setExportSettings(DEFAULT_EXPORT_SETTINGS);
      localStorage.setItem('maler_export_settings', JSON.stringify(DEFAULT_EXPORT_SETTINGS));
    }

    // 3. Projects
    const cachedProjects = localStorage.getItem('maler_projects');
    if (cachedProjects) {
      const parsed = JSON.parse(cachedProjects) as Project[];
      setProjects(parsed);
      if (parsed.length > 0) {
        setActiveProjectId(parsed[0].id);
        if (parsed[0].rooms.length > 0) {
          setActiveRoomId(parsed[0].rooms[0].id);
        }
      }
    } else {
      // Auto-load sample project on first launch to deliver a beautiful, instantly-testable workspace
      const sample = createSampleProject();
      const initialProjects = [sample];
      setProjects(initialProjects);
      setActiveProjectId(sample.id);
      setActiveRoomId(sample.rooms[0].id);
      localStorage.setItem('maler_projects', JSON.stringify(initialProjects));
    }
  }, []);

  // Sync state to localStorage on modification
  const saveProjectsToStorage = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem('maler_projects', JSON.stringify(updated));
  };

  const saveTilesToStorage = (updated: ServiceTile[]) => {
    setServiceTiles(updated);
    localStorage.setItem('maler_service_tiles', JSON.stringify(updated));
  };

  const saveExportSettingsToStorage = (updated: ExportSettings) => {
    setExportSettings(updated);
    localStorage.setItem('maler_export_settings', JSON.stringify(updated));
  };

  // --- DERIVED SELECTORS ---
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeRoom = activeProject?.rooms.find(r => r.id === activeRoomId) || null;

  // Sync target room selection when opening quantity popup
  useEffect(() => {
    if (activeRoomId) {
      setTargetRoomForInput(activeRoomId);
    }
  }, [selectedTileForInput, activeRoomId]);

  // --- PROJECT ACTIONS ---
  const handleCreateOrUpdateProject = (data: { name: string; projectNumber: string; date: string; description: string }) => {
    if (projectToEdit) {
      // Update existing
      const updated = projects.map(p => {
        if (p.id === projectToEdit.id) {
          return {
            ...p,
            name: data.name,
            projectNumber: data.projectNumber,
            date: data.date,
            description: data.description
          };
        }
        return p;
      });
      saveProjectsToStorage(updated);
      setProjectToEdit(null);
    } else {
      // Create new
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: data.name,
        projectNumber: data.projectNumber,
        date: data.date,
        description: data.description,
        createdAt: Date.now(),
        rooms: [
          // Pre-populate with standard room names so they can start right away
          { id: `room-${Date.now()}-1`, name: 'Wohnzimmer', sortOrder: 0, positions: [] },
          { id: `room-${Date.now()}-2`, name: 'Flur', sortOrder: 1, positions: [] }
        ]
      };
      const updated = [newProj, ...projects];
      saveProjectsToStorage(updated);
      setActiveProjectId(newProj.id);
      setActiveRoomId(newProj.rooms[0].id);
    }
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Möchtest du das gesamte Projekt und alle darin enthaltenen Aufmaße unwiderruflich löschen?')) {
      const remaining = projects.filter(p => p.id !== id);
      saveProjectsToStorage(remaining);
      if (remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
        setActiveRoomId(remaining[0].rooms[0]?.id || null);
      } else {
        setActiveProjectId(null);
        setActiveRoomId(null);
      }
    }
  };

  const handleLoadSampleProject = () => {
    const sample = createSampleProject();
    // Generate a unique ID to prevent overlapping if they import multiple times
    sample.id = `sample-${Date.now()}`;
    sample.projectNumber = `PR-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    sample.name = `${sample.name} (${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })})`;
    
    const updated = [sample, ...projects];
    saveProjectsToStorage(updated);
    setActiveProjectId(sample.id);
    setActiveRoomId(sample.rooms[0].id);
  };

  // --- ROOM ACTIONS ---
  const handleAddRoom = (name: string) => {
    if (!activeProject) return;
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      sortOrder: activeProject.rooms.length,
      positions: []
    };
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: [...p.rooms, newRoom]
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    setActiveRoomId(newRoom.id);
  };

  const handleEditRoom = (id: string, newName: string) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: p.rooms.map(r => r.id === id ? { ...r, name: newName } : r)
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        const filteredRooms = p.rooms.filter(r => r.id !== roomId);
        return {
          ...p,
          rooms: filteredRooms
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    
    // Select another active room if the current one was deleted
    if (activeRoomId === roomId) {
      const remainingProject = updated.find(p => p.id === activeProject.id);
      setActiveRoomId(remainingProject?.rooms[0]?.id || null);
    }
  };

  // --- POSITION ACTIONS (MEASUREMENTS) ---
  const handleAddPositionFromTile = () => {
    if (!activeProject || !selectedTileForInput) return;
    
    // Parse quantity according to the active decimal separator typed in keypad
    const cleanedValue = keypadValue.replace(',', '.');
    const parsedQty = parseFloat(cleanedValue);
    
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Bitte gib eine gültige Menge größer als 0 ein.');
      return;
    }

    const roomIdToInsert = targetRoomForInput || activeRoomId;
    if (!roomIdToInsert) {
      alert('Bitte erstelle oder wähle zuerst einen Raum aus.');
      return;
    }

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      tileId: selectedTileForInput.id,
      name: selectedTileForInput.name,
      quantity: parsedQty,
      unit: selectedTileForInput.unit,
      price: selectedTileForInput.price,
      totalPrice: parsedQty * selectedTileForInput.price,
      timestamp: Date.now()
    };

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: p.rooms.map(r => {
            if (r.id === roomIdToInsert) {
              return {
                ...r,
                positions: [...r.positions, newPos]
              };
            }
            return r;
          })
        };
      }
      return p;
    });

    saveProjectsToStorage(updatedProjects);
    
    // Keep focus on the assigned room
    setActiveRoomId(roomIdToInsert);
    
    // Close Keypad Popover
    setSelectedTileForInput(null);
    setKeypadValue('');
  };

  const handleEditPositionQuantity = (roomId: string, posId: string, newQuantity: number) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: p.rooms.map(r => {
            if (r.id === roomId) {
              return {
                ...r,
                positions: r.positions.map(pos => {
                  if (pos.id === posId) {
                    return {
                      ...pos,
                      quantity: newQuantity,
                      totalPrice: newQuantity * pos.price
                    };
                  }
                  return pos;
                })
              };
            }
            return r;
          })
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  const handleDeletePosition = (roomId: string, posId: string) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: p.rooms.map(r => {
            if (r.id === roomId) {
              return {
                ...r,
                positions: r.positions.filter(pos => pos.id !== posId)
              };
            }
            return r;
          })
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  // --- POS TILES (CATALOG MANAGEMENT) ---
  const handleAddCustomTile = (tileData: Omit<ServiceTile, 'id'>) => {
    const newTile: ServiceTile = {
      ...tileData,
      id: `custom-tile-${Date.now()}`
    };
    const updated = [...serviceTiles, newTile];
    saveTilesToStorage(updated);
  };

  const handleEditCustomTile = (updatedTile: ServiceTile) => {
    const updated = serviceTiles.map(t => t.id === updatedTile.id ? updatedTile : t);
    saveTilesToStorage(updated);
  };

  const handleDeleteCustomTile = (id: string) => {
    if (confirm('Möchtest du diese Leistungskachel wirklich aus dem Katalog löschen?')) {
      const updated = serviceTiles.filter(t => t.id !== id);
      saveTilesToStorage(updated);
    }
  };

  const handleResetCatalogToDefault = () => {
    if (confirm('Möchtest du das Leistungen-Grid auf die fiktiven Standarddaten zurücksetzen? Eigene Leistungen werden gelöscht.')) {
      setServiceTiles(DEFAULT_SERVICE_TILES);
      localStorage.setItem('maler_service_tiles', JSON.stringify(DEFAULT_SERVICE_TILES));
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-[#141414] antialiased" id="main-app-container">
      
      {/* --- HEADER NAVIGATION --- */}
      <header className="bg-white border-b border-[#141414]/10 shadow-xs sticky top-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/icons/logo.png" className="h-11 w-auto" alt="Malerprofis Uderstadt Logo" referrerPolicy="no-referrer" />
          </div>

          {/* Project Selection / Actions */}
          <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-end">
            {projects.length > 0 ? (
              <div className="relative inline-flex items-center bg-gray-100 hover:bg-gray-250/80 text-[#141414] rounded-xl px-4 py-2.5 text-sm transition-all shadow-3xs group min-w-[200px] max-w-xs cursor-pointer">
                <FolderOpen className="w-4 h-4 text-brand-accent1 mr-2 flex-shrink-0" />
                <select
                  id="project-selector"
                  value={activeProjectId || ''}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setActiveProjectId(pid);
                    const p = projects.find(proj => proj.id === pid);
                    setActiveRoomId(p?.rooms[0]?.id || null);
                  }}
                  className="bg-transparent text-[#141414] font-bold pr-6 focus:outline-none cursor-pointer w-full appearance-none truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-[#141414]">
                      {p.name} ({p.projectNumber})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#141414]/40 absolute right-3 pointer-events-none" />
              </div>
            ) : (
              <span className="text-xs text-[#141414]/40">Kein Projekt angelegt</span>
            )}

            {activeProject && (
              <button
                id="btn-edit-project"
                onClick={() => {
                  setProjectToEdit(activeProject);
                  setIsProjectModalOpen(true);
                }}
                className="p-2.5 bg-gray-100 hover:bg-gray-250/80 text-[#141414]/60 hover:text-brand-accent1 rounded-xl transition-all cursor-pointer"
                title="Projekt Details bearbeiten"
              >
                <FileEdit className="w-4 h-4" />
              </button>
            )}

            {activeProject && (
              <button
                id="btn-delete-project"
                onClick={() => handleDeleteProject(activeProject.id)}
                className="p-2.5 bg-gray-100 hover:bg-red-50 text-[#141414]/60 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                title="Projekt komplett löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-create-project-trigger"
              onClick={() => {
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              className="px-4 py-2.5 bg-brand-accent1 hover:bg-brand-accent1/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Neues Projekt
            </button>
          </div>
        </div>
      </header>

      {/* --- SUB-HEADER: ACTIVE PROJECT METADATA CARD --- */}
      {activeProject && (
        <div className="bg-white border-b border-[#141414]/5 shadow-3xs" id="project-metadata-bar">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs bg-gray-100 border border-[#141414]/5 text-[#141414]/70 font-bold px-3 py-1.5 rounded-xl">
                Projekt-Nr: <code className="font-mono text-brand-accent1 font-bold">{activeProject.projectNumber}</code>
              </span>
              <span className="text-xs text-[#141414]/55 font-medium">
                Datum: {new Date(activeProject.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              {activeProject.description && (
                <span className="text-xs text-[#141414]/60 max-w-sm truncate italic" title={activeProject.description}>
                  – {activeProject.description}
                </span>
              )}
            </div>

            {/* Quick Helper to load a fully populated sample database */}
            <button
              id="btn-load-sample"
              onClick={handleLoadSampleProject}
              className="text-[11px] font-bold text-brand-accent1 hover:text-brand-accent1/90 flex items-center gap-1.5 bg-brand-accent1/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" /> Demo-Projekt laden (+ Spachteln, Schleifen, Vlies)
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN CORE CONTAINER --- */}
      {activeProject ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6" id="workspace-main">
          
          {/* Two-column responsive Grid (5/7 allocation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Room Management & Entered Measurements (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              <RoomList
                rooms={activeProject.rooms}
                activeRoomId={activeRoomId}
                onSelectRoom={setActiveRoomId}
                onAddRoom={handleAddRoom}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
              />

              <PositionTable
                activeRoom={activeRoom}
                onEditPosition={handleEditPositionQuantity}
                onDeletePosition={handleDeletePosition}
                allRooms={activeProject.rooms}
              />

            </div>

            {/* Right Side: Interactive POS grid (Kacheln) & Handicraft Export Panel (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <ServiceTileGrid
                  tiles={serviceTiles}
                  onTileClick={(tile) => {
                    if (activeProject.rooms.length === 0) {
                      alert('Bitte lege zuerst mindestens einen Raum an, um Aufmaße hinzuzufügen.');
                      return;
                    }
                    setSelectedTileForInput(tile);
                  }}
                  onAddTile={handleAddCustomTile}
                  onEditTile={handleEditCustomTile}
                  onDeleteTile={handleDeleteCustomTile}
                />

                {/* Reset Catalog options */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    Modus: {serviceTiles.length} Kacheln verfügbar
                  </span>
                  <button
                    id="btn-reset-catalog"
                    onClick={handleResetCatalogToDefault}
                    className="text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Fiktive Stammdaten wiederherstellen
                  </button>
                </div>
              </div>

              <ExportSettingsPanel
                project={activeProject}
                settings={exportSettings}
                onUpdateSettings={saveExportSettingsToStorage}
              />

            </div>

          </div>

        </main>
      ) : (
        /* --- EMPTY STATE ONBOARDING (IF NO PROJECTS EXIST) --- */
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto" id="workspace-empty">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100 shadow-md">
            <Paintbrush className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display">Maler-Aufmaß-Profi MVP</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Es ist aktuell kein Projekt geladen. Lege ein neues Projekt für deinen Kunden an, um mit der schnellen Kachel-Aufmaßerfassung auf der Baustelle zu starten.
          </p>

          <div className="w-full space-y-3 mt-8">
            <button
              id="btn-onboarding-create-project"
              onClick={() => {
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Neues Projekt anlegen
            </button>
            
            <button
              id="btn-onboarding-load-demo"
              onClick={handleLoadSampleProject}
              className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" /> Demo-Projekt laden (EFH Müller)
            </button>
          </div>
        </main>
      )}

      {/* --- FOOTER REGISTRY --- */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-4 text-center mt-auto" id="app-footer-brand">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Maler-Aufmaß-Profi MVP. Lokaler Offline-Modus aktiv.</span>
          <span className="font-semibold text-slate-400">Kompatibel mit HANDICRAFT "Sonderfunktion 602"</span>
        </div>
      </footer>

      {/* --- MODAL 1: PROJECT METADATA CREATOR / EDITOR --- */}
      <ProjectDetailsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={projectToEdit}
        onSave={handleCreateOrUpdateProject}
      />

      {/* --- MODAL 2: TACTILE QUANTITY ENTRY POPUP WITH NUMERIC KEYPAD --- */}
      {selectedTileForInput && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/40 backdrop-blur-xs animate-fade-in" id="keypad-modal-overlay">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-[#141414]/5 shadow-xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header with Title service */}
            <div className="px-6 py-5 bg-gray-50 border-b border-[#141414]/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-brand-accent1 uppercase tracking-widest block font-mono">
                  Aufmaß erfassen
                </span>
                <h3 className="font-extrabold text-[#141414] text-base leading-tight mt-0.5">
                  {selectedTileForInput.name}
                </h3>
              </div>
              <button
                id="btn-close-keypad-modal"
                onClick={() => {
                  setSelectedTileForInput(null);
                  setKeypadValue('');
                }}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-[#141414]/40 hover:text-[#141414]/80 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector of Room to assign (super practical fallback) */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-[#141414]/5 text-xs">
              <label className="block font-bold text-[#141414]/60 uppercase tracking-wider mb-2">
                Zuordnen zu Raum:
              </label>
              <select
                id="keypad-room-selector"
                value={targetRoomForInput}
                onChange={(e) => setTargetRoomForInput(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl px-3.5 py-2.5 font-bold text-[#141414] focus:ring-2 focus:ring-brand-accent1/20 focus:outline-none transition-all cursor-pointer"
              >
                {activeProject.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Big Keypad Body */}
            <div className="p-5 bg-white">
              <NumericKeypad
                value={keypadValue}
                onChange={setKeypadValue}
                onConfirm={handleAddPositionFromTile}
                decimalSeparator={exportSettings.decimalSeparator}
                unit={selectedTileForInput.unit}
              />
            </div>

            {/* Quick manual helper fallback */}
            <div className="px-6 pb-6 text-center bg-white text-[10px] text-[#141414]/40 font-mono">
              Einzelpreis: {selectedTileForInput.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / {selectedTileForInput.unit}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
