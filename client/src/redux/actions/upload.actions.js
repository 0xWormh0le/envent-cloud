import * as actionTypes from './types';

const uploadFileSuccess = payload => ({
  type: actionTypes.UPLOAD_FILE_SUCCESS,
  payload,
});

const uploadFileFail = payload => ({
  type: actionTypes.UPLOAD_FILE_FAIL,
  payload,
});

export const uploadFile = formValues => (dispatch, getState, { mernApi }) => {
  dispatch({ type: actionTypes.UPLOAD_FILE });
  console.log('-- uploadFile formValues : ', formValues);
  const authInfo = JSON.parse(localStorage.getItem('authInfo'));
  const now = Math.floor(Date.now() / 1000);
  if (!authInfo || (authInfo && authInfo.expiresAt <= now)) {
    dispatch(uploadFileFail());
    return Promise.resolve();
  }
  mernApi.setAuthToken(authInfo.token);

  const formData = new FormData();
  formData.append('file', formValues);

  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  };

  return mernApi.post('/uploads', formData, config).then(
    (response) => {
      dispatch(uploadFileSuccess(response.data));
    },
    (err) => {
      dispatch(uploadFileFail(err.response.data.error));
    },
  );
};
