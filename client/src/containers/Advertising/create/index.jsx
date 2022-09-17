import React, { PureComponent } from 'react';
import { Card, CardBody, Col, Row, Button, ButtonToolbar } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import renderFileInputField from '../../../shared/components/form/FileInput';
import CheckboxTree from 'react-checkbox-tree';
import renderDatePickerField from '../../../shared/components/form/DatePicker';
import CalendarBlankIcon from 'mdi-react/CalendarBlankIcon';
import renderTimePickerField from '../../../shared/components/form/TimePicker';
import AvTimerIcon from 'mdi-react/AvTimerIcon';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faSquare,
  faChevronRight,
  faChevronDown,
  faPlusSquare,
  faMinusSquare,
  faFolder,
  faFolderOpen,
  faFile
} from '@fortawesome/free-solid-svg-icons';
import renderDropZoneField from '../../../shared/components/form/DropZone';

const nodes = [
  {
    value: 'AMP-Macquaire',
    label: 'AMP Macquaire',
    children: [
      { value: 'kiosk1', label: 'kiosk1' },
      { value: 'kiosk2', label: 'kiosk2' }
    ]
  },
  {
    value: 'AMP-Pacfair',
    label: 'AMP Pacfair',
    children: [
      { value: 'kiosk1', label: 'kiosk1' },
      { value: 'kiosk2', label: 'kiosk2' }
    ]
  }
];

class CreateAdvert extends PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired
  };

  state = {
    checked: [],
    expanded: []
  };

  constructor() {
    super();
    this.state = {
      showPassword: false
    };
  }

  showPassword = e => {
    e.preventDefault();
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  };

  render() {
    const { handleSubmit, reset, t } = this.props;
    const { showPassword } = this.state;

    return (
      <Col md={12} xlg={12}>
        <form className="form" onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <div className="card__title">
                <h5 className="bold-text">Create Advertisement</h5>
              </div>
              <Row>
                <Col lg="6">
                  <div className="form__form-group">
                    <span className="form__form-group-label">Name*</span>
                    <div className="form__form-group-field">
                      <Field
                        name="AdName"
                        component="input"
                        type="text"
                        placeholder="Advertisement Name"
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Screens*</span>
                    <div className="form__form-group-field">
                      <CheckboxTree
                        nodes={nodes}
                        checked={this.state.checked}
                        expanded={this.state.expanded}
                        onCheck={checked => this.setState({ checked })}
                        onExpand={expanded => this.setState({ expanded })}
                        icons={{
                          check: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-check"
                              icon={faCheckSquare}
                            />
                          ),
                          uncheck: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-uncheck"
                              icon={faSquare}
                            />
                          ),
                          halfCheck: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-half-check"
                              icon={faCheckSquare}
                            />
                          ),
                          expandClose: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-expand-close"
                              icon={faChevronRight}
                            />
                          ),
                          expandOpen: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-expand-open"
                              icon={faChevronDown}
                            />
                          ),
                          expandAll: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-expand-all"
                              icon={faPlusSquare}
                            />
                          ),
                          collapseAll: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-collapse-all"
                              icon={faMinusSquare}
                            />
                          ),
                          parentClose: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-parent-close"
                              icon={faFolder}
                            />
                          ),
                          parentOpen: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-parent-open"
                              icon={faFolderOpen}
                            />
                          ),
                          leaf: (
                            <FontAwesomeIcon
                              className="rct-icon rct-icon-leaf-close"
                              icon={faFile}
                            />
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Start Date*</span>
                    <div className="form__form-group-field">
                      <Field
                        name="start_date"
                        component={renderDatePickerField}
                      />
                      <div className="form__form-group-icon">
                        <CalendarBlankIcon />
                      </div>
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">End Date*</span>
                    <div className="form__form-group-field">
                      <Field
                        name="end_date"
                        component={renderDatePickerField}
                      />
                      <div className="form__form-group-icon">
                        <CalendarBlankIcon />
                      </div>
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Start time</span>
                    <div className="form__form-group-field">
                      <Field
                        name="start_time"
                        component={renderTimePickerField}
                      />
                      <div className="form__form-group-icon">
                        <AvTimerIcon />
                      </div>
                    </div>
                    <p className="wizard__description">
                      Optional: Daily start time
                    </p>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">End Time</span>
                    <div className="form__form-group-field">
                      <Field
                        name="end_time"
                        component={renderTimePickerField}
                      />
                      <div className="form__form-group-icon">
                        <AvTimerIcon />
                      </div>
                    </div>
                    <p className="wizard__description">
                      Optional: Daily end time
                    </p>
                  </div>
                </Col>
                <Col lg="6">
                  <div className="form__form-group">
                    <span className="form__form-group-label">
                      Upload media*
                    </span>
                    <div className="form__form-group-field">
                      <Field
                        name="files"
                        component={renderDropZoneField}
                        customHeight
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col lg="12">
                  <ButtonToolbar className="form__button-toolbar">
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                    <Button type="button" onClick={reset}>
                      Cancel
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
      </Col>
    );
  }
}

export default reduxForm({
  form: 'vertical_form' // a unique identifier for this form
})(withTranslation('common')(CreateAdvert));
