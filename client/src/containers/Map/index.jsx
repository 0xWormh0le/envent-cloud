import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import WayMaps from './Maps';
import PropTypes from 'prop-types';
import { RTLProps } from '../../shared/prop-types/ReducerProps';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

const AllMaps = ({ t, rtl }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Wayfinder Maps</h3>
      </Col>
    </Row>
    <Row>
      <WayMaps />
    </Row>
  </Container>
);

AllMaps.propTypes = {
  t: PropTypes.func.isRequired,
  rtl: RTLProps.isRequired
};

export default compose(
  withTranslation('common'),
  connect(state => ({
    rtl: state.rtl
  }))
)(AllMaps);
