import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { RTLProps } from '../../shared/prop-types/ReducerProps';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

const Advertising = ({ t, rtl }) => (
  <Container className="dashboard">
    <Row>
      <Col md={12}>
        <h3 className="page-title">Advertising</h3>
      </Col>
    </Row>
    <Row>Hello, World</Row>
  </Container>
);

Advertising.propTypes = {
  t: PropTypes.func.isRequired,
  rtl: RTLProps.isRequired
};

export default compose(
  withTranslation('common'),
  connect(state => ({
    rtl: state.rtl
  }))
)(Advertising);
