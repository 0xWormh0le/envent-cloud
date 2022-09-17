import React from 'react';
import {Route, Switch} from 'react-router-dom';

import GoogleMap from '../../../Maps/GoogleMap/index';
import VectorMap from '../../../Maps/VectorMap/index';
import MapEditorPage from '../../../Map/MapEditorPage'
import MapViewerPage from '../../../Map/MapViewerPage'

export default () => (
    <Switch>
        <Route path="/maps/google_map" component={GoogleMap}/>
        <Route path="/maps/vector_map" component={VectorMap}/>
    </Switch>
);
