import { createSelector } from 'reselect';

export const getMapState = state => state.map;

export const getMapProcessing = createSelector(
  getMapState,
  map => map.processing,
);

export const getMapProcessed = createSelector(
  getMapState,
  map => map.processed,
);

export const getMapError = createSelector(getMapState, map => map.error);

export const getMaps = createSelector(
  getMapState,
  map => map.maps,
);

export const getMap = createSelector(
  getMapState,
  map => map.map,
);
