import * as actionTypes from './types';

const loadMapsSuccess = payload => ({
  type: actionTypes.LOAD_MAPS_SUCCESS,
  payload
});

const loadMapsFail = payload => ({
  type: actionTypes.LOAD_MAPS_FAIL,
  payload
});

export const loadMaps = () => (dispatch, getState, { mernApi }) => {
  console.log('-- loadMaps start');
  dispatch({ type: actionTypes.LOAD_MAPS });

  return mernApi.get('/maps').then(
    response => {
      console.log('-- mernApi maps : ', response.data);
      dispatch(loadMapsSuccess(response.data));
    },
    err => {
      dispatch(loadMapsFail(err.response.data.error));
    }
  );
};

const loadMapSuccess = payload => ({
  type: actionTypes.LOAD_MAP_SUCCESS,
  payload
});

const loadMapFail = payload => ({
  type: actionTypes.LOAD_MAP_FAIL,
  payload
});

export const loadMap = formValues => (dispatch, getState, { mernApi }) => {
  console.log('-- loadMap formValues : ', formValues);
  dispatch({ type: actionTypes.LOAD_MAP });

  return mernApi.get(`/maps/${formValues.id}`).then(
    response => {
      console.log('-- loadMap response.data : ', response.data);
      dispatch(loadMapSuccess(response.data));
    },
    err => {
      dispatch(loadMapFail(err.response.data.error));
    }
  );
};

const addMapSuccess = payload => ({
  type: actionTypes.ADD_MAP_SUCCESS,
  payload
});

const addMapFail = payload => ({
  type: actionTypes.ADD_MAP_FAIL,
  payload
});

export const addMap = formValues => (dispatch, getState, { mernApi }) => {
  console.log('-- addMap start formValues : ', formValues);
  dispatch({ type: actionTypes.ADD_MAP });

  return mernApi.post('/maps/addMap', formValues).then(
    response => {
      console.log('-- mernApi maps : ', response.data);
      dispatch(addMapSuccess(response.data));
    },
    err => {
      dispatch(addMapFail(err.response.data.error));
    }
  );
};

const updateMapSuccess = payload => ({
  type: actionTypes.UPDATE_MAP_SUCCESS,
  payload
});

const updateMapFail = payload => ({
  type: actionTypes.UPDATE_MAP_FAIL,
  payload
});

export const updateMap = map => (dispatch, getState, { mernApi }) => {
  console.log('-- updateMap map : ', map);
  dispatch({ type: actionTypes.UPDATE_MAP });

  console.log('-- mapDta : ', JSON.stringify(map.mapData));
  const formValues = {
    mapName: map.mapName,
    mapSVG: map.mapSVG,
    mapData: JSON.stringify(map.mapData)
  };

  return mernApi.post(`/maps/updateMap/${map._id}`, formValues).then(
    response => {
      dispatch(updateMapSuccess(response.data));
    },
    err => {
      dispatch(updateMapFail(err.response.data.error));
    }
  );
};
