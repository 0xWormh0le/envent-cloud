import React from 'react';
import { Route } from 'react-router-dom';
import Layout from '../../../Layout/index';
import Documentation from './Documentation';
import Account from './Account';
import Advertising from '../../../Advertising';
import CreateAdvert from '../../../Advertising/create';
import Forms from './Forms';
import DefaultDashboard from '../../../Dashboards/Default/index';
import requireRole from '../../../../hoc/requireRole';

import AllMaps from '../../../Map';
import WayFinder from './WayFinder';

export default () => (
  <div>
    <Layout />
    <div className="container__wrap">
      {/* CMS */}
      <Route exact path="/" component={DefaultDashboard} />
      <Route exact path="/dashboard" component={DefaultDashboard} />
      <Route path="/account" component={Account} />
      <Route path="/forms" component={Forms} />
      <Route path="/documentation" component={Documentation} />

      {/* Way finder */}
      <Route path="/wayfinder/maps" component={AllMaps} />
      <Route path="/wayfinder/tenants" component={AllMaps} />
      <Route path="/wayfinder/categories" component={AllMaps} />
      <Route path="/wayfinder" component={WayFinder} />

      {/* Advertising */}
      <Route path="/advertising/view" component={Advertising} />
      <Route path="/advertising/create" component={CreateAdvert} />
      <Route path="/advertising/pending" component={Advertising} />
    </div>
  </div>
);
