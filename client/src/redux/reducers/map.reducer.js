import * as actionTypes from '../actions/types';

const INITIAL_STATE = {
  map: {},
  maps: [],
  processing: false,
  processed: false,
  error: null,
  defaultPath: '/', // Used as a default redirect path
  attemptedPath: null, // Used to redirect users to the page they visited before logging in
};

const mapReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.LOAD_MAPS:
    case actionTypes.LOAD_MAP:
    case actionTypes.ADD_MAP:
    case actionTypes.UPDATE_MAP:
      return {
        ...state, processed: false, processing: true, error: null,
      };
    case actionTypes.LOAD_MAPS_SUCCESS:
      console.log('-- LOAD_MAPS_SUCCESS : ', action.payload.maps);
      return {
        ...state,
        processing: false,
        processed: true,
        maps: action.payload.maps,
        defaultPath: '/',
      };
    case actionTypes.LOAD_MAP_SUCCESS:
      return {
        ...state,
        processing: false,
        processed: true,
        map: { ...action.payload.map },
      };
    case actionTypes.ADD_MAP_SUCCESS:
    case actionTypes.UPDATE_MAP_SUCCESS:
      return {
        ...state,
        processing: false,
        processed: true,
        map: { ...action.payload.map },
      };
    case actionTypes.LOAD_MAPS_FAIL:
    case actionTypes.LOAD_MAP_FAIL:
    case actionTypes.UPDATE_MAP_FAIL:
      return {
        ...state,
        processing: false,
        processed: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default mapReducer;
