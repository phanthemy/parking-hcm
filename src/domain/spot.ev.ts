/**
 * MAPGO DOMAIN LAYER - EV CHARGING SPOT ENTITY
 */

import { SpotCategory, EvConnectorType } from './enums';
import { SpotEntity } from './spot.base';

export interface EVChargerPort {
  connectorType: EvConnectorType;
  powerKW: number;      // e.g. 11kW, 30kW, 60kW, 150kW, 250kW
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  quantity: number;
}

export interface EVChargingDetail {
  operator: 'VinFast' | 'EV_ONE' | 'Porsche' | 'Eboost' | 'Other';
  is247: boolean;
  openTime?: string;
  closeTime?: string;
  totalPorts: number;
  ports: EVChargerPort[];
  pricingPerKwh?: number;
  parkingFeeIncluded: boolean;
}

export interface EVChargingSpot extends SpotEntity {
  category: SpotCategory.EV_CHARGING;
  chargingDetails: EVChargingDetail;
}
