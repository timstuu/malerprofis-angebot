/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceTile, ExportSettings } from './types';

export const DEFAULT_SERVICE_TILES: ServiceTile[] = [
  {
    id: 'tile-1',
    name: 'Wände spachteln Q3',
    unit: 'qm',
    price: 14.50,
    color: 'emerald', // emerald-500
    isDefault: true,
  },
  {
    id: 'tile-2',
    name: 'Oberflächen schleifen',
    unit: 'qm',
    price: 4.20,
    color: 'amber', // amber-500
    isDefault: true,
  },
  {
    id: 'tile-3',
    name: 'Tiefgrund grundieren',
    unit: 'qm',
    price: 3.80,
    color: 'sky', // sky-500
    isDefault: true,
  },
  {
    id: 'tile-4',
    name: 'Vlies tapezieren',
    unit: 'qm',
    price: 18.90,
    color: 'indigo', // indigo-500
    isDefault: true,
  },
  {
    id: 'tile-5',
    name: 'Dispersionstrich 2-fach',
    unit: 'qm',
    price: 11.20,
    color: 'violet', // violet-500
    isDefault: false,
  },
  {
    id: 'tile-6',
    name: 'Acrylfugen spritzen',
    unit: 'm',
    price: 2.50,
    color: 'rose', // rose-500
    isDefault: false,
  },
  {
    id: 'tile-7',
    name: 'Abdeckarbeiten & Schutz',
    unit: 'qm',
    price: 3.50,
    color: 'slate', // slate-500
    isDefault: false,
  },
  {
    id: 'tile-8',
    name: 'Lackierung Türzarge',
    unit: 'Stk',
    price: 34.00,
    color: 'orange', // orange-500
    isDefault: false,
  },
];

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  delimiter: ';',
  decimalSeparator: ',',
  includeBOM: true,
  filenameTemplate: 'HANDICRAFT_{projectNumber}_{projectName}',
};
