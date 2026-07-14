/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceTile, ExportSettings } from './types';

export const DEFAULT_SERVICE_TILES: ServiceTile[] = [
  // Stundenlohnarbeiten
  {
    id: 'tile-stunden-1',
    name: 'Regiearbeit Maler',
    unit: 'Std',
    price: 48.50,
    color: 'sky',
    isDefault: true,
    category: 'Stundenlohnarbeiten',
  },
  {
    id: 'tile-stunden-2',
    name: 'Regiearbeit Vorarbeiter',
    unit: 'Std',
    price: 54.00,
    color: 'sky',
    isDefault: true,
    category: 'Stundenlohnarbeiten',
  },
  {
    id: 'tile-stunden-3',
    name: 'Helferstunde',
    unit: 'Std',
    price: 38.00,
    color: 'sky',
    isDefault: true,
    category: 'Stundenlohnarbeiten',
  },
  {
    id: 'tile-stunden-4',
    name: 'Fahrzeit',
    unit: 'Std',
    price: 32.00,
    color: 'sky',
    isDefault: true,
    category: 'Stundenlohnarbeiten',
  },

  // Abdeckarbeiten
  {
    id: 'tile-abdeck-1',
    name: 'Abdecken mit Vlies',
    unit: 'qm',
    price: 4.20,
    color: 'emerald',
    isDefault: true,
    category: 'Abdeckarbeiten',
  },
  {
    id: 'tile-abdeck-2',
    name: 'Abkleben Fenster & Türen',
    unit: 'm',
    price: 2.80,
    color: 'emerald',
    isDefault: true,
    category: 'Abdeckarbeiten',
  },
  {
    id: 'tile-abdeck-3',
    name: 'Abkleben Fußleisten',
    unit: 'm',
    price: 1.90,
    color: 'emerald',
    isDefault: true,
    category: 'Abdeckarbeiten',
  },
  {
    id: 'tile-abdeck-4',
    name: 'Staubschutzwand aufbauen',
    unit: 'Psch',
    price: 85.00,
    color: 'emerald',
    isDefault: true,
    category: 'Abdeckarbeiten',
  },

  // Baustelleneinrichtung
  {
    id: 'tile-einricht-1',
    name: 'Baustelle einrichten',
    unit: 'Psch',
    price: 120.00,
    color: 'amber',
    isDefault: true,
    category: 'Baustelleneinrichtung',
  },
  {
    id: 'tile-einricht-2',
    name: 'Baustelle räumen/besenrein',
    unit: 'Psch',
    price: 80.00,
    color: 'amber',
    isDefault: true,
    category: 'Baustelleneinrichtung',
  },
  {
    id: 'tile-einricht-3',
    name: 'Schmutz & Müll entsorgen',
    unit: 'Psch',
    price: 65.00,
    color: 'amber',
    isDefault: true,
    category: 'Baustelleneinrichtung',
  },
  {
    id: 'tile-einricht-4',
    name: 'Werkzeug/Maschinentransport',
    unit: 'Psch',
    price: 90.00,
    color: 'amber',
    isDefault: true,
    category: 'Baustelleneinrichtung',
  },

  // Gerüstarbeiten
  {
    id: 'tile-geruest-1',
    name: 'Rollgerüst auf-/abbauen',
    unit: 'Psch',
    price: 150.00,
    color: 'orange',
    isDefault: true,
    category: 'Gerüstarbeiten',
  },
  {
    id: 'tile-geruest-2',
    name: 'Fassadengerüst stellen',
    unit: 'qm',
    price: 9.50,
    color: 'orange',
    isDefault: true,
    category: 'Gerüstarbeiten',
  },
  {
    id: 'tile-geruest-3',
    name: 'Gerüstvorhaltung wöchentlich',
    unit: 'qm',
    price: 1.80,
    color: 'orange',
    isDefault: true,
    category: 'Gerüstarbeiten',
  },
  {
    id: 'tile-geruest-4',
    name: 'Kleingerüst stellen',
    unit: 'Psch',
    price: 45.00,
    color: 'orange',
    isDefault: true,
    category: 'Gerüstarbeiten',
  },
];

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  delimiter: ';',
  decimalSeparator: ',',
  includeBOM: true,
  filenameTemplate: 'HANDICRAFT_{projectNumber}_{projectName}',
};
