import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import themeReducer from './themeReducer';
import rtlReducer from './rtlReducer';
import sidebarReducer from './sidebarReducer';
import cryptoTableReducer from './cryptoTableReducer';
import newOrderTableReducer from './newOrderTableReducer';
import customizerReducer from './customizerReducer';
import todoReducer from './todoReducer';
import authReducer from './authReducer';
import mapReducer from './map.reducer';
import uploadReducer from './upload.reducer';


// export {
//   themeReducer,
//   rtlReducer,
//   sidebarReducer,
//   cryptoTableReducer,
//   newOrderTableReducer,
//   customizerReducer,
//   todoReducer,
//   authReducer,
// };

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  form: formReducer,
  auth: authReducer,
  map: mapReducer,
  upload: uploadReducer,
  theme: themeReducer,
  rtl: rtlReducer,
  sidebar: sidebarReducer,
  cryptoTable: cryptoTableReducer,
  newOrder: newOrderTableReducer,
  customizer: customizerReducer,
  todos: todoReducer,
  user: authReducer,
});

export default createRootReducer;
