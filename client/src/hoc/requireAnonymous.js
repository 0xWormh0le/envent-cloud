import React from 'react';
import { connect } from 'react-redux';
import { getIsSignedIn, getDefaultPath } from '../redux/selectors';

import {withRouter} from 'react-router-dom';

/**
 * If user already logged in, redirect to default path.
 *
 * @param {Component} WrappedComponent The component to be wrapped
 */
const requireAnonymous = () => (WrappedComponent) => {
  class ComposedComponent extends React.Component {
    componentDidMount() {
      this.shouldNavigateAway();
    }

    componentDidUpdate() {
      this.shouldNavigateAway();
    }

    shouldNavigateAway = () => {
      if (this.props.isSignedIn) {
        console.log(this.props);
        this.props.history.replace(this.props.defaultPath);
      }
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapStateToProps = state => ({
    isSignedIn: getIsSignedIn(state),
    defaultPath: getDefaultPath(state),
  });

  return connect(mapStateToProps)(withRouter(ComposedComponent));
};

export default requireAnonymous;
