import React, { PureComponent } from 'react';
import { Field, reduxForm, Form } from 'redux-form';
import { connect } from 'react-redux';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import renderCheckBoxField from '../form/CheckBox';

import { SubmissionError } from 'redux-form';
import { compose } from 'redux';
import { getProcessing, getError } from '../../../redux/selectors';
import { signIn, unloadAuthPage } from '../../../redux/actions/authActions';
import requireAnonymous from '../../../hoc/requireAnonymous';
import { email, minLength, required } from './formValidator';

class LogInForm extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    errorMsg: PropTypes.string,
    fieldUser: PropTypes.string,
    typeFieldUser: PropTypes.string,
    form: PropTypes.string.isRequired
  };

  static defaultProps = {
    errorMessage: '',
    errorMsg: '',
    fieldUser: 'Username',
    typeFieldUser: 'text'
  };

  constructor() {
    super();
    this.state = {
      showPassword: false
    };

    this.showPassword = this.showPassword.bind(this);
  }

  showPassword(e) {
    e.preventDefault();
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  }

  onSubmit = formValues => {
    console.log('-- formValues : ', formValues);
    return this.props.signIn(formValues).then(() => {
      if (this.props.errorMessage) {
        throw new SubmissionError({ _error: this.props.errorMessage });
      }
    });
  };

  render() {
    const {
      handleSubmit,
      errorMessage,
      errorMsg,
      fieldUser,
      typeFieldUser,
      form,
      pristine,
      reset,
      submitting,
      valid,
      error
    } = this.props;
    const { showPassword } = this.state;

    return (
      <Form className="form login-form" onSubmit={handleSubmit(this.onSubmit)}>
        <Alert color="danger" isOpen={!!error || !!errorMsg}>
          {error}
          {errorMsg}
        </Alert>
        <div className="form__form-group">
          <span className="form__form-group-label">{fieldUser}</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <Field
              name="email"
              component="input"
              type={typeFieldUser}
              placeholder={fieldUser}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon />
            </div>
            <Field
              name="password"
              component="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
            />
            <button
              type="button"
              className={`form__form-group-button${
                showPassword ? ' active' : ''
              }`}
              onClick={e => this.showPassword(e)}
            >
              <EyeIcon />
            </button>
            <div className="account__forgot-password">
              <a href="/">Forgot a password?</a>
            </div>
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group form__form-group-field">
            <Field
              // name={`remember_me-${form}`}
              name={`remember_me`}
              component={renderCheckBoxField}
              label="Remember me"
            />
          </div>
        </div>
        <div className="account__btns">
          {form === 'modal_login' ? (
            <Button
              className="account__btn"
              submit="true"
              disabled={pristine || submitting || !valid}
              type="submit"
              color="primary"
            >
              Sign In
            </Button>
          ) : (
            <Link className="account__btn btn btn-primary" to="/dashboard">
              Sign In
            </Link>
          )}

          <Link className="btn btn-outline-primary account__btn" to="/register">
            Create Account
          </Link>
        </div>
      </Form>
    );
  }

  componentWillUnmount() {
    this.props.unloadAuthPage();
  }
}

const maptStateToProps = state => {
  return {
    isProcessing: getProcessing(state),
    errorMessage: getError(state)
  };
};

const validate = values => {
  const errors = {};
  errors.email = required(values.email) || email(values.email);
  errors.password = required(values.password) || minLength(6)(values.password);
  return errors;
};

export default compose(
  requireAnonymous(),
  connect(maptStateToProps, {
    signIn,
    unloadAuthPage
  }),
  reduxForm({ form: 'signIn', validate })
)(LogInForm);
