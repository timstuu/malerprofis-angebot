/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceTile {
  id: string;
  name: string;
  unit: string;
  price: number;
  color?: string; // Optional custom background color for the POS tile
  isDefault?: boolean;
  category?: string; // Tab/Category association
}

export interface Position {
  id: string;
  tileId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  sortOrder: number;
  positions: Position[];
}

export interface Project {
  id: string;
  name: string;
  projectNumber: string;
  date: string;
  description: string;
  rooms: Room[];
  createdAt: number;
}

export interface ExportSettings {
  delimiter: ';' | ',';
  decimalSeparator: ',' | '.';
  includeBOM: boolean;
  filenameTemplate: string;
}
