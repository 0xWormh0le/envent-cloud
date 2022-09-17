import React from 'react';
import { Route, Switch } from 'react-router-dom';

import MapEditorPage from '../../../Map/MapEditorPage';
import MapViewerPage from '../../../Map/MapViewerPage';

export default () => (
  <Switch>
    <Route path="/wayfinder/editor/:id" component={MapEditorPage} />
    <Route path="/wayfinder/viewer/:id" component={MapViewerPage} />
  </Switch>
);
