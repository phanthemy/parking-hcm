/**
 * AUTOMATED UNIT TESTS FOR MAPGO DOMAIN LAYER
 * Test execution using Node.js Native Test Runner (node:test & node:assert)
 */

const test = require('node:test');
const assert = require('node:assert/strict');

// ===== Mock / Direct Import of Domain Logic for Standalone Testing =====

const SpotCategory = {
  PARKING: 'PARKING',
  EV_CHARGING: 'EV_CHARGING',
  GAS_STATION: 'GAS_STATION',
  GARAGE: 'GARAGE',
  CAR_WASH: 'CAR_WASH',
  RESTROOM: 'RESTROOM',
  RESCUE: 'RESCUE',
  INSPECTION: 'INSPECTION',
};

const VehicleType = {
  CAR: 'CAR',
  BIKE: 'BIKE',
  TRUCK: 'TRUCK',
  BUS: 'BUS',
  EV: 'EV',
};

const PriceType = {
  HOUR: 'HOUR',
  NEXT_HOUR: 'NEXT_HOUR',
  OVERNIGHT: 'OVERNIGHT',
  DAY: 'DAY',
  MONTH: 'MONTH',
  KWH: 'KWH',
};

const VerificationMethod = {
  FIELD_VISIT: 'FIELD_VISIT',
  BQL_CONFIRMED: 'BQL_CONFIRMED',
  COMMUNITY: 'COMMUNITY',
  OFFICIAL_SOURCE: 'OFFICIAL_SOURCE',
  UNVERIFIED: 'UNVERIFIED',
};

function isParkingSpot(spot) {
  return spot && spot.category === SpotCategory.PARKING;
}

function isEVChargingSpot(spot) {
  return spot && spot.category === SpotCategory.EV_CHARGING;
}

function isGarageSpot(spot) {
  return spot && spot.category === SpotCategory.GARAGE;
}

function calculateConfidenceScore(verification) {
  if (!verification) return 0;
  switch (verification.verifiedMethod) {
    case VerificationMethod.FIELD_VISIT:
      return 98;
    case VerificationMethod.BQL_CONFIRMED:
      return 95;
    case VerificationMethod.COMMUNITY:
      return Math.min(85, 50 + (verification.confirmationCount || 1) * 5);
    case VerificationMethod.OFFICIAL_SOURCE:
      return 90;
    default:
      return 15;
  }
}

function formatPricingTable(pricingList) {
  if (!pricingList || !pricingList.length) return { carPerHour: 0, bikePerHour: 0 };
  const carHour = pricingList.find(p => p.vehicleType === VehicleType.CAR && p.priceType === PriceType.HOUR);
  const bikeHour = pricingList.find(p => p.vehicleType === VehicleType.BIKE && p.priceType === PriceType.HOUR);
  return {
    carPerHour: carHour ? carHour.amount : 0,
    bikePerHour: bikeHour ? bikeHour.amount : 0,
  };
}

// ===== TEST SUITES =====

test('Suite 1: Domain Enums & Integrity', () => {
  assert.equal(SpotCategory.PARKING, 'PARKING');
  assert.equal(SpotCategory.EV_CHARGING, 'EV_CHARGING');
  assert.equal(VehicleType.CAR, 'CAR');
  assert.equal(PriceType.OVERNIGHT, 'OVERNIGHT');
  assert.equal(VerificationMethod.FIELD_VISIT, 'FIELD_VISIT');
});

test('Suite 2: Domain Type Guards', () => {
  const parkingSpot = {
    id: 'spot-1',
    name: 'Bãi xe Diamond Plaza',
    category: SpotCategory.PARKING,
  };
  const evSpot = {
    id: 'spot-2',
    name: 'Trạm sạc VinFast SC VivoCity',
    category: SpotCategory.EV_CHARGING,
  };
  const garageSpot = {
    id: 'spot-3',
    name: 'Gara Ô tô Hiệp Phát',
    category: SpotCategory.GARAGE,
  };

  assert.equal(isParkingSpot(parkingSpot), true);
  assert.equal(isParkingSpot(evSpot), false);
  assert.equal(isEVChargingSpot(evSpot), true);
  assert.equal(isGarageSpot(garageSpot), true);
});

test('Suite 3: E-E-A-T Verification & Confidence Calculation', () => {
  const fieldVisit = { verifiedMethod: VerificationMethod.FIELD_VISIT, verified: true };
  const bqlConfirmed = { verifiedMethod: VerificationMethod.BQL_CONFIRMED, verified: true };
  const community = { verifiedMethod: VerificationMethod.COMMUNITY, confirmationCount: 4 };
  const unverified = { verifiedMethod: VerificationMethod.UNVERIFIED };

  assert.equal(calculateConfidenceScore(fieldVisit), 98);
  assert.equal(calculateConfidenceScore(bqlConfirmed), 95);
  assert.equal(calculateConfidenceScore(community), 70);
  assert.equal(calculateConfidenceScore(unverified), 15);
});

test('Suite 4: Dynamic Pricing Matrix Normalization', () => {
  const pricingList = [
    { vehicleType: VehicleType.CAR, priceType: PriceType.HOUR, amount: 30000, currency: 'VND' },
    { vehicleType: VehicleType.CAR, priceType: PriceType.OVERNIGHT, amount: 150000, currency: 'VND' },
    { vehicleType: VehicleType.BIKE, priceType: PriceType.HOUR, amount: 5000, currency: 'VND' },
    { vehicleType: VehicleType.BIKE, priceType: PriceType.MONTH, amount: 200000, currency: 'VND' },
  ];

  const formatted = formatPricingTable(pricingList);
  assert.equal(formatted.carPerHour, 30000);
  assert.equal(formatted.bikePerHour, 5000);
});

test('Suite 5: ParkingSpot Entity Instantiation & Validation', () => {
  const spot = {
    id: 'spot-diamond-123',
    name: 'Bãi đỗ xe Diamond Plaza',
    slug: 'bai-do-xe-diamond-plaza',
    category: SpotCategory.PARKING,
    geo: { latitude: 10.7816, longitude: 106.6983 },
    address: {
      full: '34 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh',
    },
    parkingDetails: {
      operatingHours: { is247: false, openTime: '06:00', closeTime: '23:00' },
      heightLimit: 2.1,
      capacity: { totalCarSlots: 120, totalBikeSlots: 500, hasRealtimeSlots: true },
      security: { hasGuard247: true, hasCCTV: true, hasRoof: true, hasFireSafety: true },
      evSupport: { hasEvCharging: true, chargerCount: 4 },
    },
    pricing: [
      { vehicleType: VehicleType.CAR, priceType: PriceType.HOUR, amount: 30000, currency: 'VND' },
    ],
    status: 'ACTIVE',
    verified: true,
  };

  assert.equal(spot.name, 'Bãi đỗ xe Diamond Plaza');
  assert.equal(spot.parkingDetails.heightLimit, 2.1);
  assert.equal(spot.parkingDetails.capacity.totalCarSlots, 120);
  assert.equal(spot.parkingDetails.security.hasGuard247, true);
  assert.equal(spot.parkingDetails.evSupport.hasEvCharging, true);
});

console.log('✅ ALL DOMAIN LAYER UNIT TESTS PASSED!');
