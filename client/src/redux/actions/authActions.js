import { replace } from 'connected-react-router';
import * as actionTypes from './types';

export const AUTHENTICATE = 'AUTHENTICATE';
export const AUTHENTICATE_ERROR_AUTH = 'AUTHENTICATE_ERROR_AUTH';

export function auth({ name, avatar }) {
  return {
    type: AUTHENTICATE,
    user: { name, avatar }
  };
}

export function authError(error) {
  return {
    type: AUTHENTICATE_ERROR_AUTH,
    error
  };
}

export const signUp = formValues => (dispatch, getState, { mernApi }) => {
  dispatch({ type: actionTypes.SIGN_UP });
  return mernApi.post('/auth/signup', formValues).then(
    () => {
      dispatch({ type: actionTypes.SIGN_UP_SUCCESS });
    },
    err => {
      // eslint-disable-next-line no-use-before-define
      dispatch(signUpFail(err.response.data.error));
    }
  );
};

const setAuthInfo = (authInfo, mernApi) => {
  mernApi.setAuthToken(authInfo.token);
  console.log('-- setAuthInfo : authInfo : ', authInfo.token);
  localStorage.setItem('authInfo', JSON.stringify(authInfo));
};

const clearAuthInfo = mernApi => {
  mernApi.setAuthToken('');
  localStorage.removeItem('authInfo');
};

export const setAttemptedPath = path => ({
  type: actionTypes.SET_ATTEMPTED_PATH,
  payload: path
});

const redirectAfterSignIn = (dispatch, getState) => {
  if (getState().auth.attemptedPath) {
    dispatch(replace(getState().auth.attemptedPath));
    dispatch(setAttemptedPath(null));
  } else {
    dispatch(replace(getState().auth.defaultPath));
  }
};

const signInHelper = (
  endpoint,
  payload,
  actionSuccess,
  actionFail,
  dispatch,
  getState,
  mernApi
) =>
  mernApi.post(endpoint, payload).then(
    response => {
      dispatch(actionSuccess(response.data));
      redirectAfterSignIn(dispatch, getState);
      setAuthInfo(response.data, mernApi);
    },
    err => {
      console.log('error', err);
      if (err.response) {
        dispatch(actionFail(err.response.data.error));
      } else {
        dispatch(actionFail('Server is not alive'));
      }
    }
  );

const signUpFail = payload => ({
  type: actionTypes.SIGN_UP_FAIL,
  payload
});

const signInSuccess = payload => ({
  type: actionTypes.SIGN_IN_SUCCESS,
  payload
});

const signInFail = payload => ({
  type: actionTypes.SIGN_IN_FAIL,
  payload
});

export const signIn = formValues => (dispatch, getState, { mernApi }) => {
  dispatch({ type: actionTypes.SIGN_IN });
  return signInHelper(
    '/auth/signin',
    formValues,
    signInSuccess,
    signInFail,
    dispatch,
    getState,
    mernApi
  );
};

const tryLocalSignInSuccess = payload => (dispatch, getState, { mernApi }) => {
  setAuthInfo(payload, mernApi);
  dispatch({
    type: actionTypes.TRY_LOCAL_SIGN_IN_SUCCESS,
    payload
  });
};

const tryLocalSignInFail = () => (dispatch, getState, { mernApi }) => {
  clearAuthInfo(mernApi);
  dispatch({ type: actionTypes.TRY_LOCAL_SIGN_IN_FAIL });
};

// eslint-disable-next-line consistent-return
export const tryLocalSignIn = () => (dispatch, getState, { mernApi }) => {
  console.log('trylocal sign');
  dispatch({ type: actionTypes.TRY_LOCAL_SIGN_IN });
  try {
    const authInfo = JSON.parse(localStorage.getItem('authInfo'));
    const now = Math.floor(Date.now() / 1000);
    if (!authInfo || (authInfo && authInfo.expiresAt <= now)) {
      dispatch(tryLocalSignInFail());
      return Promise.resolve();
    }
    // if token age > 30 days, then refresh token
    if (authInfo.expiresAt <= now + 30 * 24 * 60 * 60) {
      mernApi.setAuthToken(authInfo.token);
      return mernApi.post('auth/refresh-token').then(
        response => {
          authInfo.token = response.data.token;
          authInfo.expiresAt = response.data.expiresAt;
          dispatch(tryLocalSignInSuccess(authInfo));
          redirectAfterSignIn(dispatch, getState);
          setAuthInfo(authInfo, mernApi);
        },
        err => {
          console.log(err);
          dispatch(tryLocalSignInFail());
        }
      );
    }
    dispatch(tryLocalSignInSuccess(authInfo));
    redirectAfterSignIn(dispatch, getState);
    return Promise.resolve();
  } catch (err) {
    dispatch(tryLocalSignInFail(err));
  }
};

const verifyEmailFail = payload => ({
  type: actionTypes.VERIFY_EMAIL_FAIL,
  payload
});

const requestVerificationEmailFail = payload => ({
  type: actionTypes.REQUEST_VERIFICATION_EMAIL_FAIL,
  payload
});

export const signOut = () => (dispatch, getState, { mernApi }) => {
  dispatch({ type: actionTypes.SIGN_OUT });
  clearAuthInfo(mernApi);
  dispatch({ type: actionTypes.SIGN_OUT_SUCCESS });
};

export const verifyEmail = token => (dispatch, getState, { mernApi }) => {
  dispatch({ type: actionTypes.VERIFY_EMAIL });
  return mernApi.post(`/auth/verify-email/${token}`).then(
    () => {
      dispatch({ type: actionTypes.VERIFY_EMAIL_SUCCESS });
    },
    err => {
      dispatch(verifyEmailFail(err.response.data.error));
    }
  );
};

export const requestVerificationEmail = formValues => (
  dispatch,
  getState,
  { mernApi }
) => {
  dispatch({ type: actionTypes.REQUEST_VERIFICATION_EMAIL });
  return mernApi.post('/auth/send-token', formValues).then(
    () => {
      dispatch({ type: actionTypes.REQUEST_VERIFICATION_EMAIL_SUCCESS });
    },
    err => {
      dispatch(requestVerificationEmailFail(err.response.data.error));
    }
  );
};

const requestPasswordResetFail = payload => ({
  type: actionTypes.REQUEST_PASSWORD_RESET_FAIL,
  payload
});

export const requestPasswordReset = formValues => (
  dispatch,
  getState,
  { mernApi }
) => {
  dispatch({ type: actionTypes.REQUEST_PASSWORD_RESET });
  return mernApi.post('/auth/send-token', formValues).then(
    () => {
      dispatch({ type: actionTypes.REQUEST_PASSWORD_RESET_SUCCESS });
    },
    err => {
      dispatch(requestPasswordResetFail(err.response.data.error));
    }
  );
};

const resetPasswordFail = payload => ({
  type: actionTypes.RESET_PASSWORD_FAIL,
  payload
});

export const resetPassword = (formValues, token) => (
  dispatch,
  getState,
  { mernApi }
) => {
  dispatch({ type: actionTypes.RESET_PASSWORD });
  return mernApi.post(`/auth/reset-password/${token}`, formValues).then(
    () => {
      dispatch({ type: actionTypes.RESET_PASSWORD_SUCCESS });
    },
    err => dispatch(resetPasswordFail(err.response.data.error))
  );
};

export const unloadAuthPage = () => ({
  type: actionTypes.UNLOAD_AUTH_PAGE
});
