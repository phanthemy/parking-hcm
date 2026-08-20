/**
 * MAPGO DOMAIN LAYER - BASE ENTITY
 * Core fields that exist for all POIs on MapGo
 */

import {
  SpotCategory,
  SpotStatus,
  VerificationMethod,
  PaymentMethod,
  ImageType,
} from './enums';

export interface SpotGeo {
  latitude: number;
  longitude: number;
}

export interface SpotAddress {
  full: string;
  street?: string;
  ward?: string;
  district: string;
  province: string;
}

export interface SpotImage {
  id?: string;
  url: string;
  type: ImageType;
  caption?: string;
  sortOrder?: number;
  verified?: boolean;
}

export interface SpotVerification {
  verified: boolean;
  verifiedBy?: string;
  verifiedMethod: VerificationMethod;
  verifiedAt?: Date | string;
  source?: string;
  confidenceScore: number; // 0 - 100
}

export interface SpotReviewStats {
  rating: number;         // 1.0 - 5.0
  reviewCount: number;
  lastReviewAt?: Date | string;
}

export interface SpotEntity {
  id: string;
  name: string;
  slug: string;
  category: SpotCategory;
  geo: SpotGeo;
  address: SpotAddress;
  phone?: string;
  website?: string;
  status: SpotStatus;
  
  // E-E-A-T & Verification
  verification: SpotVerification;
  
  // Media & Relations
  images: SpotImage[];
  paymentMethods: PaymentMethod[];
  reviews: SpotReviewStats;
  
  // Timestamps
  lastUpdated: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
