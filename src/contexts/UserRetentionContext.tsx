'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getFavoriteSpots,
  toggleFavoriteSpot,
  isSpotFavorite,
  getRecentPlaces,
  addRecentPlace,
  getRecentlyViewed,
  addRecentlyViewed,
  getHomeLocation,
  setHomeLocation,
  clearHomeLocation,
  getWorkLocation,
  setWorkLocation,
  clearWorkLocation,
  recordVisit,
  RetentionSpotSummary,
  SavedLocation,
} from '@/lib/user-retention';
import { Spot } from '@/lib/types';

interface UserRetentionContextType {
  favorites: RetentionSpotSummary[];
  recentPlaces: RetentionSpotSummary[];
  recentlyViewed: RetentionSpotSummary[];
  homeLocation: SavedLocation | null;
  workLocation: SavedLocation | null;
  toggleFavorite: (spot: Spot) => boolean;
  checkIsFavorite: (spotId: string) => boolean;
  saveRecentPlace: (spot: Spot) => void;
  saveRecentlyViewed: (spot: Spot) => void;
  saveHome: (loc: SavedLocation) => void;
  removeHome: () => void;
  saveWork: (loc: SavedLocation) => void;
  removeWork: () => void;
  refreshRetention: () => void;
}

const UserRetentionContext = createContext<UserRetentionContextType | undefined>(undefined);

export function UserRetentionProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<RetentionSpotSummary[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<RetentionSpotSummary[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RetentionSpotSummary[]>([]);
  const [homeLocation, setHomeLocState] = useState<SavedLocation | null>(null);
  const [workLocation, setWorkLocState] = useState<SavedLocation | null>(null);

  const refreshRetention = useCallback(() => {
    setFavorites(getFavoriteSpots());
    setRecentPlaces(getRecentPlaces());
    setRecentlyViewed(getRecentlyViewed());
    setHomeLocState(getHomeLocation());
    setWorkLocState(getWorkLocation());
  }, []);

  useEffect(() => {
    recordVisit();
    refreshRetention();
  }, [refreshRetention]);

  const toggleFavorite = useCallback((spot: Spot) => {
    const result = toggleFavoriteSpot(spot);
    setFavorites(getFavoriteSpots());
    return result;
  }, []);

  const checkIsFavorite = useCallback((spotId: string) => {
    return isSpotFavorite(spotId);
  }, []);

  const saveRecentPlace = useCallback((spot: Spot) => {
    addRecentPlace(spot);
    setRecentPlaces(getRecentPlaces());
  }, []);

  const saveRecentlyViewed = useCallback((spot: Spot) => {
    addRecentlyViewed(spot);
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const saveHome = useCallback((loc: SavedLocation) => {
    setHomeLocation(loc);
    setHomeLocState(loc);
  }, []);

  const removeHome = useCallback(() => {
    clearHomeLocation();
    setHomeLocState(null);
  }, []);

  const saveWork = useCallback((loc: SavedLocation) => {
    setWorkLocation(loc);
    setWorkLocState(loc);
  }, []);

  const removeWork = useCallback(() => {
    clearWorkLocation();
    setWorkLocState(null);
  }, []);

  return (
    <UserRetentionContext.Provider
      value={{
        favorites,
        recentPlaces,
        recentlyViewed,
        homeLocation,
        workLocation,
        toggleFavorite,
        checkIsFavorite,
        saveRecentPlace,
        saveRecentlyViewed,
        saveHome,
        removeHome,
        saveWork,
        removeWork,
        refreshRetention,
      }}
    >
      {children}
    </UserRetentionContext.Provider>
  );
}

export function useUserRetention() {
  const context = useContext(UserRetentionContext);
  if (!context) {
    throw new Error('useUserRetention must be used within a UserRetentionProvider');
  }
  return context;
}
