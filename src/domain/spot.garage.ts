/**
 * MAPGO DOMAIN LAYER - GARAGE & RESCUE ENTITIES
 */

import { SpotCategory } from './enums';
import { SpotEntity } from './spot.base';

export interface GarageServiceItem {
  name: string;
  priceFrom?: number;
  description?: string;
}

export interface GarageDetail {
  is247: boolean;
  openTime?: string;
  closeTime?: string;
  specialties: Array<'TYRE_REPAIR' | 'OIL_CHANGE' | 'ENGINE' | 'ELECTRICAL' | 'PAINT' | 'GENERAL'>;
  services: GarageServiceItem[];
  supportsCar: boolean;
  supportsBike: boolean;
  hasMobileRepair: boolean; // Có sửa lưu động tận nơi
}

export interface GarageSpot extends SpotEntity {
  category: SpotCategory.GARAGE;
  garageDetails: GarageDetail;
}

export interface RescueDetail {
  hotline: string;
  responseRadiusKm: number;
  is247: boolean;
  serviceTypes: Array<'TOWING' | 'BATTERY_JUMP' | 'TYRE_PUNCTURE' | 'FUEL_DELIVERY' | 'LOCKOUT'>;
  basePrice?: number;
}

export interface RescueSpot extends SpotEntity {
  category: SpotCategory.RESCUE;
  rescueDetails: RescueDetail;
}
