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
  X,
  Menu
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
  
  // Sidebar visibility for mobile / tablet portrait
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden font-sans text-[#141414] antialiased" id="main-app-container">
      
      {/* Backdrop overlay for mobile/portrait sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#141414]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- LEFT SIDEBAR (Full height on lg) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[427px] bg-white border-r border-[#141414]/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-[427px] lg:max-w-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header: Logo & Close Button */}
        <div className="p-4 border-b border-[#141414]/5 flex items-center justify-between">
          <img src="/icons/logo.png" className="h-10 w-auto" alt="Malerprofis Uderstadt Logo" referrerPolicy="no-referrer" />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-[#141414]/40 hover:text-[#141414]/80 transition-all cursor-pointer lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeProject && (
            <>
              {/* Room list inside sidebar */}
              <RoomList
                rooms={activeProject.rooms}
                activeRoomId={activeRoomId}
                onSelectRoom={(id) => {
                  setActiveRoomId(id);
                  setIsSidebarOpen(false);
                }}
                onAddRoom={(name) => {
                  handleAddRoom(name);
                  setIsSidebarOpen(false);
                }}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
              />

              {/* Export Settings & Project Total Statistics Panel inside sidebar */}
              <ExportSettingsPanel
                project={activeProject}
                settings={exportSettings}
              />
            </>
          )}
        </div>

        {/* Project Selection / Actions (Sticky/Pinned at bottom left) */}
        <div className="p-4 border-t border-[#141414]/10 bg-gray-50/70 space-y-3">
          <label className="block text-[10px] font-bold text-[#141414]/40 uppercase tracking-wider">
            Projekt auswählen
          </label>
          {projects.length > 0 ? (
            <div className="relative flex items-center bg-white border border-[#141414]/10 rounded-xl px-3 py-2 text-sm shadow-3xs cursor-pointer">
              <FolderOpen className="w-4 h-4 text-brand-accent1 mr-2 flex-shrink-0" />
              <select
                id="project-selector"
                value={activeProjectId || ''}
                onChange={(e) => {
                  const pid = e.target.value;
                  setActiveProjectId(pid);
                  const p = projects.find(proj => proj.id === pid);
                  setActiveRoomId(p?.rooms[0]?.id || null);
                  setIsSidebarOpen(false);
                }}
                className="bg-transparent text-[#141414] font-bold pr-6 focus:outline-none cursor-pointer w-full appearance-none truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-[#141414]">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#141414]/45 absolute right-3 pointer-events-none" />
            </div>
          ) : (
            <span className="text-xs text-[#141414]/40 block">Kein Projekt angelegt</span>
          )}

          {/* Project management buttons */}
          {activeProject && (
            <div className="flex items-center gap-2">
              <button
                id="btn-edit-project"
                onClick={() => {
                  setProjectToEdit(activeProject);
                  setIsProjectModalOpen(true);
                }}
                className="flex-1 py-2 bg-white hover:bg-gray-50 border border-[#141414]/10 text-xs text-[#141414]/70 hover:text-brand-accent1 rounded-xl transition-all flex items-center justify-center gap-1 font-bold cursor-pointer"
                title="Projekt Details bearbeiten"
              >
                <FileEdit className="w-3.5 h-3.5" /> Bearbeiten
              </button>
              <button
                id="btn-delete-project"
                onClick={() => handleDeleteProject(activeProject.id)}
                className="p-2 bg-white hover:bg-red-50 border border-[#141414]/10 text-red-500 rounded-xl transition-all cursor-pointer"
                title="Projekt komplett löschen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            id="btn-create-project-trigger"
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="w-full py-2 bg-brand-accent1 hover:bg-brand-accent1/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Neues Projekt
          </button>
        </div>
      </aside>

      {/* --- RIGHT WORKSPACE CONTAINER (Scrolls independently on lg) --- */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto lg:h-screen lg:overflow-y-auto" id="workspace-container">
        
        {/* Mobile Header (visible only on mobile/portrait < 1024px) */}
        <header className="bg-white border-b border-[#141414]/10 shadow-xs px-4 py-3 flex items-center justify-between sticky top-0 z-30 lg:hidden" id="mobile-header">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-xl text-[#141414]/70 hover:text-[#141414] transition-all cursor-pointer"
              title="Menü öffnen"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src="/icons/logo.png" className="h-8 w-auto" alt="Logo" referrerPolicy="no-referrer" />
          </div>
          {activeProject && (
            <div className="text-right max-w-[180px] sm:max-w-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider truncate">Aktives Projekt</span>
              <span className="text-xs font-black text-[#141414] block truncate">{activeProject.name}</span>
            </div>
          )}
        </header>

        {/* --- MAIN WORKSPACE AREA --- */}
        {activeProject ? (
          <main className="flex-1 w-full p-4 lg:p-6 space-y-6" id="workspace-main">
            
            {/* 1. Service Tile Grid (Selection) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
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

            {/* 2. Position Table (Measurements) */}
            <PositionTable
              activeRoom={activeRoom}
              onEditPosition={handleEditPositionQuantity}
              onDeletePosition={handleDeletePosition}
              allRooms={activeProject.rooms}
            />

          </main>
        ) : (
          /* --- EMPTY STATE ONBOARDING --- */
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
                onClick={() => {
                  handleLoadSampleProject();
                  setIsSidebarOpen(false);
                }}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" /> Demo-Projekt laden (EFH Müller)
              </button>
            </div>
          </main>
        )}

      </div>

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
