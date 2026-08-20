/**
 * MAPGO DOMAIN LAYER - PARKING SPOT ENTITY
 * Dedicated entity for Parking Lots, Garages, Basements with specialized fields
 */

import { SpotCategory, VehicleType, PriceType } from './enums';
import { SpotEntity } from './spot.base';

export interface SpotPriceItem {
  id?: string;
  vehicleType: VehicleType;
  priceType: PriceType;
  amount: number;
  currency: string;
  note?: string;
}

export interface ParkingCapacity {
  totalCarSlots: number;
  totalBikeSlots: number;
  availableCarSlots?: number;
  hasRealtimeSlots: boolean;
}

export interface ParkingSecurity {
  hasGuard247: boolean;
  hasCCTV: boolean;
  hasRoof: boolean;
  hasFireSafety: boolean;
}

export interface ParkingEvSupport {
  hasEvCharging: boolean;
  chargerCount?: number;
}

export interface ParkingOperatingHours {
  is247: boolean;
  openTime?: string;   // "06:00"
  closeTime?: string;  // "23:00"
  notes?: string;
}

export interface ParkingDetail {
  operatingHours: ParkingOperatingHours;
  heightLimit?: number; // mét (e.g. 2.1m)
  capacity: ParkingCapacity;
  security: ParkingSecurity;
  evSupport: ParkingEvSupport;
}

export interface ParkingSpot extends SpotEntity {
  category: SpotCategory.PARKING;
  parkingDetails: ParkingDetail;
  pricing: SpotPriceItem[];
}
