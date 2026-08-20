/**
 * MAPGO DOMAIN LAYER - UNIFIED EXPORTS & TYPE GUARDS
 * Single Source of Truth
 */

export * from './enums';
export * from './spot.base';
export * from './spot.parking';
export * from './spot.ev';
export * from './spot.garage';
export * from './spot.utility';

import { SpotEntity } from './spot.base';
import { ParkingSpot } from './spot.parking';
import { EVChargingSpot } from './spot.ev';
import { GarageSpot, RescueSpot } from './spot.garage';
import { GasStationSpot, RestroomSpot } from './spot.utility';
import { SpotCategory } from './enums';

export type AnySpot =
  | ParkingSpot
  | EVChargingSpot
  | GarageSpot
  | RescueSpot
  | GasStationSpot
  | RestroomSpot;

// Type Guards
export function isParkingSpot(spot: SpotEntity): spot is ParkingSpot {
  return spot.category === SpotCategory.PARKING;
}

export function isEVChargingSpot(spot: SpotEntity): spot is EVChargingSpot {
  return spot.category === SpotCategory.EV_CHARGING;
}

export function isGarageSpot(spot: SpotEntity): spot is GarageSpot {
  return spot.category === SpotCategory.GARAGE;
}

export function isRescueSpot(spot: SpotEntity): spot is RescueSpot {
  return spot.category === SpotCategory.RESCUE;
}

export function isGasStationSpot(spot: SpotEntity): spot is GasStationSpot {
  return spot.category === SpotCategory.GAS_STATION;
}

export function isRestroomSpot(spot: SpotEntity): spot is RestroomSpot {
  return spot.category === SpotCategory.RESTROOM;
}
