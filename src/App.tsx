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
  Menu,
  Upload
} from 'lucide-react';

import * as XLSX from 'xlsx';

import { Project, Room, Position, ServiceTile, ExportSettings } from './types';
import { DEFAULT_SERVICE_TILES, DEFAULT_EXPORT_SETTINGS } from './constants';
import { NumericKeypad } from './components/NumericKeypad';
import { ServiceTileGrid } from './components/ServiceTileGrid';
import { RoomList } from './components/RoomList';
import { PositionTable } from './components/PositionTable';
import { ExportSettingsPanel } from './components/ExportSettingsPanel';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';

// --- DYNAMIC HASH COLOR GENERATOR FOR IMPORTED CATEGORIES ---
const CATEGORY_COLORS = ['emerald', 'sky', 'amber', 'orange', 'slate'];
const hashCategoryToColor = (category: string): string => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
};



// --- SAMPLE INITIAL DATA FOR IMMACULATE UX ON FIRST LAUNCH ---
const createSampleProject = (): Project => {
  return {
    id: 'sample-project-1',
    name: 'Müller',
    street: 'Musterstraße 12',
    zipCity: '70173 Stuttgart',
    email: 'mueller.renovierung@gmail.com',
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
  
  const [serviceTiles, setServiceTiles] = useState<ServiceTile[]>(DEFAULT_SERVICE_TILES);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  
  // Sidebar visibility for mobile / tablet portrait
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings popover
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modals & Popups
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedTileForInput, setSelectedTileForInput] = useState<ServiceTile | null>(null);
  const [targetRoomForInput, setTargetRoomForInput] = useState<string>('');
  
  // Quick quantity entry keyboard input
  const [keypadValue, setKeypadValue] = useState('');

  // Import Progress state
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importStatusText, setImportStatusText] = useState<string>('');

  // --- INITIALIZATION (LOCAL STORAGE SYNC) ---
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
  }, []);


  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    // 1. Service Tiles
    const cachedTiles = localStorage.getItem('maler_service_tiles');
    if (cachedTiles) {
      const parsed = JSON.parse(cachedTiles) as ServiceTile[];
      const hasCategories = parsed.every(t => t.category);
      if (hasCategories && parsed.length > 0) {
        setServiceTiles(parsed);
      } else {
        setServiceTiles(DEFAULT_SERVICE_TILES);
        localStorage.setItem('maler_service_tiles', JSON.stringify(DEFAULT_SERVICE_TILES));
      }
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
  const handleCreateOrUpdateProject = (data: {
    name: string;
    street: string;
    zipCity: string;
    email: string;
    date: string;
    description: string;
  }) => {
    if (projectToEdit) {
      // Update existing
      const updated = projects.map(p => {
        if (p.id === projectToEdit.id) {
          return {
            ...p,
            name: data.name,
            street: data.street,
            zipCity: data.zipCity,
            email: data.email,
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
        street: data.street,
        zipCity: data.zipCity,
        email: data.email,
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

  const handleReorderRooms = (newRooms: Room[]) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rooms: newRooms
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
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
      nameS: selectedTileForInput.nameS,
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

  const extractUnitAndCleanTitle = (title: string): { unit: string; cleanTitle: string } => {
    const workingTitle = title.trim();
    
    const unitPatterns = [
      /^lfd\.m\./i,
      /^lfd\.m/i,
      /^lfd\s+m/i,
      /^pauschal/i,
      /^pausch\./i,
      /^pausch/i,
      /^gebinde/i,
      /^karton/i,
      /^liter/i,
      /^rolle/i,
      /^eimer/i,
      /^stck\./i,
      /^stck/i,
      /^stk\./i,
      /^stk/i,
      /^std\./i,
      /^std/i,
      /^psch\./i,
      /^psch/i,
      /^geb\./i,
      /^geb/i,
      /^ktn\./i,
      /^ktn/i,
      /^krt/i,
      /^ltr\./i,
      /^ltr/i,
      /^rln/i,
      /^rle/i,
      /^m²/i,
      /^m2/i,
      /^qm/i,
      /^lfm/i,
      /^kg/i,
      /^[mstlght](?=[\s\.\-\/]|$)/i
    ];

    for (const pattern of unitPatterns) {
      const match = workingTitle.match(pattern);
      if (match) {
        const matchedText = match[0];
        const matchLength = matchedText.length;
        
        let rest = workingTitle.substring(matchLength);
        rest = rest.replace(/^[\s\.\-\/]+/, '').trim();
        
        if (rest.length === 0) {
          continue;
        }

        const cleanTitle = rest.charAt(0).toUpperCase() + rest.slice(1);
        const unit = matchedText.trim();

        return { unit, cleanTitle };
      }
    }

    return { unit: '', cleanTitle: title };
  };

const parseImportPrice = (str: string): number => {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(',') && trimmed.includes('.')) {
    if (trimmed.indexOf('.') < trimmed.indexOf(',')) {
      return parseFloat(trimmed.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      return parseFloat(trimmed.replace(/,/g, '')) || 0;
    }
  }
  if (trimmed.includes(',')) {
    return parseFloat(trimmed.replace(',', '.')) || 0;
  }
  return parseFloat(trimmed) || 0;
};

  const handleImportXlsx = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const arr = new Uint8Array(data as ArrayBuffer);
        const workbook = XLSX.read(arr, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to json matrix (2D array of cells)
        const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        // Map all cells to strings, replacing null/undefined with empty string
        const parsedLines = sheetData.map(row => 
          row.map(cell => cell !== undefined && cell !== null ? String(cell) : '')
        );

        if (parsedLines.length < 2) {
          alert('Die Excel-Datei ist leer oder ungültig.');
          return;
        }

        // Set initial progress state
        setImportProgress(0);
        setImportStatusText('Analysiere Spalten...');

        setTimeout(() => {
          // Find indices dynamically
          const headers = parsedLines[0].map(h => h.trim().toLowerCase());
          const keyIdx = headers.indexOf('key');
          const matchcodeIdx = headers.indexOf('matchcode');
          const kurztext1Idx = headers.indexOf('kurztext1');
          const preisIdx = headers.indexOf('preis');
          const mengeneinheitIdx = headers.indexOf('mengeneinheit');

          const resolvedKeyIdx = keyIdx !== -1 ? keyIdx : 0;
          const resolvedMatchcodeIdx = matchcodeIdx !== -1 ? matchcodeIdx : 1;
          const resolvedKurztext1Idx = kurztext1Idx !== -1 ? kurztext1Idx : 2;
          const resolvedPreisIdx = 13; // Festgelegt auf Spalte N (Index 13)
          const resolvedMengeneinheitIdx = mengeneinheitIdx !== -1 ? mengeneinheitIdx : 14;

          let currentCategory = 'Allgemein';
          let currentSubcategory = '';
          const newTiles: ServiceTile[] = [];
          
          const totalRows = parsedLines.length - 1;
          let currentIndex = 1;
          const chunkSize = 400; // process 400 lines at a time

          const processNextChunk = () => {
            const endLimit = Math.min(currentIndex + chunkSize, parsedLines.length);
            
            for (let i = currentIndex; i < endLimit; i++) {
              const row = parsedLines[i];
              if (row.length < 3) continue;

              const key = row[resolvedKeyIdx]?.trim() || '';
              const matchcode = row[resolvedMatchcodeIdx]?.trim() || '';
              const kurztext1 = row[resolvedKurztext1Idx]?.trim() || '';

              // 1. Check if Reiter
              if (kurztext1.startsWith('==')) {
                currentCategory = kurztext1
                  .replace(/^==\s*/, '')
                  .replace(/\s*==+$/, '')
                  .replace(/=/g, '')
                  .trim();
                currentSubcategory = '';
                continue;
              }

              // 2. Check if Unterreiter
              if (kurztext1.startsWith('**')) {
                currentSubcategory = kurztext1
                  .replace(/^\*\*\s*/, '')
                  .replace(/\s*\*\*+$/, '')
                  .replace(/\*/g, '')
                  .trim();
                continue;
              }

              // 3. Exclude if matchcode AND kurztext1 are both empty
              if (!matchcode && !kurztext1) {
                continue;
              }

              // 4. Normal Position
              const preisStr = row[resolvedPreisIdx]?.trim() || '0';
              const price = Math.round(parseImportPrice(preisStr) * 100) / 100;

              let unit = row[resolvedMengeneinheitIdx]?.trim() || '';
              let name = kurztext1;
              const nameS = row[18]?.trim() || '';

              if (!unit) {
                const extracted = extractUnitAndCleanTitle(kurztext1);
                unit = extracted.unit;
                name = extracted.cleanTitle;
              }

              newTiles.push({
                id: key || `tile-imported-${i}`,
                name: name,
                nameS: nameS,
                unit: unit,
                price: price,
                color: hashCategoryToColor(currentCategory),
                category: currentCategory,
                subcategory: currentSubcategory || undefined,
                key: key
              });
            }

            currentIndex = endLimit;
            const progress = Math.min(Math.round(((currentIndex - 1) / totalRows) * 100), 99);
            setImportProgress(progress);
            setImportStatusText(`Verarbeite Position ${currentIndex - 1} von ${totalRows}...`);

            if (currentIndex < parsedLines.length) {
              // Schedule next chunk
              setTimeout(processNextChunk, 20); // 20ms pause for UI render
            } else {
              // Finished processing
              setImportProgress(100);
              setImportStatusText('Katalog wird finalisiert...');
              
              setTimeout(() => {
                if (newTiles.length === 0) {
                  alert('Keine gültigen Positionen in der Excel-Datei gefunden.');
                  setImportProgress(null);
                  return;
                }
                saveTilesToStorage(newTiles);
                setImportProgress(null);
                alert(`Erfolgreich ${newTiles.length} Positionen und deren Reiter importiert!`);
              }, 300);
            }
          };

          // Start the chunked execution
          processNextChunk();
        }, 100);
      } catch (err) {
        console.error(err);
        alert('Fehler beim Parsen der Excel-Datei.');
        setImportProgress(null);
      }
    };
    reader.readAsArrayBuffer(file);
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
        {/* Sidebar Header: Logo, Settings & Close Button */}
        <div className="p-4 border-b border-[#141414]/5 flex items-center justify-between">
          <img src="./icons/logo.png" className="h-10 w-auto" alt="Malerprofis Uderstadt Logo" referrerPolicy="no-referrer" />
          <div className="flex items-center gap-1">
            {/* Settings Icon with Popover */}
            <div className="relative">
              <button
                id="btn-settings"
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-[#141414]/40 hover:text-[#141414]/70 transition-all cursor-pointer"
                title="Einstellungen"
              >
                <Settings2 className="w-4 h-4" />
              </button>
              {isSettingsOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSettingsOpen(false)}
                  />
                  {/* Popover dropdown */}
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-[#141414]/10 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                  <div className="divide-y divide-[#141414]/5">
                    {/* Version row */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings2 className="w-4 h-4 text-[#141414]/50" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-wider">App-Version</p>
                        <p className="text-sm font-bold text-[#141414]">v1.1.14</p>
                      </div>
                    </div>

                    {/* Import Excel row */}
                    <div className="px-4 py-3">
                      <label 
                        htmlFor="xlsx-file-input"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-[#141414]/70 hover:text-[#141414] text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#141414]/50" />
                        Katalog importieren (.xlsx)
                      </label>
                      <input
                        id="xlsx-file-input"
                        type="file"
                        accept=".xlsx"
                        onChange={handleImportXlsx}
                        className="hidden"
                      />
                    </div>

                    {/* Reload app row */}
                    <div className="px-4 py-3">
                      <button
                        id="btn-reload-app"
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-[#141414]/70 hover:text-[#141414] text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        App neu laden
                      </button>
                    </div>
                  </div>
                  </div>
                </>
              )}
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-[#141414]/40 hover:text-[#141414]/80 transition-all cursor-pointer lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Project Selection / Actions (Container-less heading + grouped list card) */}
          <div className="w-full flex flex-col space-y-4" id="project-selection-panel">
            {/* Header section (container-less) */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-[#141414] font-sans tracking-tight">
                  Projekt
                </h2>
                <p className="text-xs text-[#141414]/60 mt-0.5">
                  Aktive Projektinformationen
                </p>
              </div>
              <button
                id="btn-create-project-trigger"
                onClick={() => {
                  setProjectToEdit(null);
                  setIsProjectModalOpen(true);
                }}
                className="p-3 bg-brand-accent1/10 hover:bg-brand-accent1/15 text-brand-accent1 rounded-xl transition-all cursor-pointer"
                title="Neues Projekt"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Project Details Display Card */}
            {activeProject ? (
              <div className="bg-white border border-[#141414]/10 rounded-2xl p-4 shadow-3xs text-xs space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-[#141414] truncate">{activeProject.name}</h3>
                  {activeProject.street && <p className="text-[#141414]/60 mt-1">{activeProject.street}</p>}
                  {activeProject.zipCity && <p className="text-[#141414]/60">{activeProject.zipCity}</p>}
                  {activeProject.email && <p className="text-[#141414]/50 mt-2 truncate font-mono">{activeProject.email}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#141414]/10 rounded-2xl p-4 text-center text-xs text-[#141414]/40 shadow-3xs">
                Kein aktives Projekt. Klicke auf "+", um eines zu erstellen.
              </div>
            )}
          </div>

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
                onReorderRooms={handleReorderRooms}
              />

            </>
          )}
        </div>

        {/* Bottom Pinned Gesamtsumme & Export Section */}
        {activeProject && (
          <div className="p-4 border-t border-[#141414]/10 bg-gray-50/70">
            <ExportSettingsPanel
              project={activeProject}
              settings={exportSettings}
            />
          </div>
        )}
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
            <img src="./icons/logo.png" className="h-8 w-auto" alt="Logo" referrerPolicy="no-referrer" />
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
            <div className="w-full">
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display">Malerprofis - Digitale Angebote</h2>
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
              Einzelpreis: <span className="text-brand-accent1 font-bold">{selectedTileForInput.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>{selectedTileForInput.unit ? ` / ${selectedTileForInput.unit}` : ''}
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: FULL SCREEN IMPORT PROGRESS OVERLAY --- */}
      {importProgress !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#141414]/65 backdrop-blur-md animate-fade-in" id="import-progress-modal">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-[#141414]/5 shadow-2xl p-6 flex flex-col items-center text-center animate-slide-up">
            
            {/* Animated Icon / Spinner */}
            <div className="w-16 h-16 bg-brand-accent1/10 rounded-full flex items-center justify-center mb-5 animate-pulse">
              <RefreshCw className="w-8 h-8 text-brand-accent1 animate-spin" style={{ animationDuration: '2s' }} />
            </div>

            <h3 className="font-extrabold text-[#141414] text-lg leading-tight font-sans">
              Katalog wird geladen
            </h3>
            <p className="text-xs text-[#141414]/60 mt-1 font-sans">
              Bitte lass das Browserfenster geöffnet.
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mt-6 mb-3 relative border border-gray-100">
              <div 
                className="bg-brand-accent1 h-full rounded-full transition-all duration-150 ease-out"
                style={{ width: `${importProgress}%` }}
              />
            </div>

            {/* Percentage & Status Text */}
            <div className="flex justify-between items-center w-full text-xs font-bold text-[#141414] mb-2 px-1 font-sans">
              <span className="text-[#141414]/50 truncate max-w-[200px]">{importStatusText}</span>
              <span className="font-mono text-brand-accent1">{importProgress}%</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
