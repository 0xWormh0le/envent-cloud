import * as actionTypes from '../actions/types';

const INITIAL_STATE = {
  upload: {},
  processing: false,
  processed: false,
  error: null,
  defaultPath: '/', // Used as a default redirect path
  attemptedPath: null, // Used to redirect users to the page they visited before logging in
};

const mapReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.UPLOAD_FILE:
      return {
        ...state, processed: false, processing: true, error: null,
      };
    case actionTypes.UPLOAD_FILE_SUCCESS:
      console.log('-- UPLOAD_FILE_SUCCESS : ', action.payload.upload);
      return {
        ...state,
        processing: false,
        processed: true,
        upload: action.payload.upload,
        defaultPath: '/',
      };
    case actionTypes.UPLOAD_FILE_FAIL:
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
