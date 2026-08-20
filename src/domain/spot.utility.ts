/**
 * MAPGO DOMAIN LAYER - UTILITY ENTITIES (GAS STATION & RESTROOM)
 */

import { SpotCategory } from './enums';
import { SpotEntity } from './spot.base';

export interface GasStationDetail {
  brand: 'Petrolimex' | 'PVOIL' | 'Saigon_Petro' | 'Comeco' | 'Other';
  fuels: Array<'RON95_III' | 'RON95_V' | 'E5_RON92' | 'DIESEL_005S' | 'DIESEL_0001S'>;
  is247: boolean;
  openTime?: string;
  closeTime?: string;
  hasCarWash: boolean;
  hasRestroom: boolean;
  hasConvenienceStore: boolean;
}

export interface GasStationSpot extends SpotEntity {
  category: SpotCategory.GAS_STATION;
  gasStationDetails: GasStationDetail;
}

export interface RestroomDetail {
  isFree: boolean;
  feeAmount?: number;
  isAccessibleForDisabled: boolean;
  hasBabyCare: boolean;
  cleanlinessScore?: number; // 1-5
  is247: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface RestroomSpot extends SpotEntity {
  category: SpotCategory.RESTROOM;
  restroomDetails: RestroomDetail;
}
