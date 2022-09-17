import React, { PureComponent } from 'react';
import { Field, reduxForm } from 'redux-form';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import MailRuIcon from 'mdi-react/MailRuIcon';
import { Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {  SubmissionError } from 'redux-form';
import { compose } from 'redux';
import { getProcessing, getError } from '../../../redux/selectors';
import {
  signUp,
  unloadAuthPage,
} from '../../../redux/actions/authActions';
import requireAnonymous from '../../../hoc/requireAnonymous';
import { email, minLength, required } from './formValidator';


class RegisterForm extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
  };

  static defaultProps = {
    errorMessage: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
    };

    this.showPassword = this.showPassword.bind(this);
  }

  onSubmit = formValues => {
    console.log('-- formValues : ', formValues);
    return this.props.signUp(formValues).then(() => {
      if (this.props.errorMessage) {
        throw new SubmissionError({ _error: this.props.errorMessage });
      }
      this.props.history.push('/way/dashboard');
    });
  };

  showPassword(e) {
    e.preventDefault();
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  }

  render() {
    const { handleSubmit, errorMessage , error } = this.props;
    const { showPassword } = this.state;

    return (
      <form className="form" onSubmit={handleSubmit(this.onSubmit)}>
        <Alert
          color="danger"
          isOpen={!!errorMessage}
        >
          {error}
        </Alert>
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <Field
              name="username"
              component="input"
              type="text"
              placeholder="Name"
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">E-mail</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <MailRuIcon />
            </div>
            <Field
              name="email"
              component="input"
              type="email"
              placeholder="example@mail.com"
              required
            />
          </div>
        </div>
        <div className="form__form-group form__form-group--forgot">
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
              required
            />
            <button
              type="button"
              className={`form__form-group-button${showPassword ? ' active' : ''}`}
              onClick={e => this.showPassword(e)}
            ><EyeIcon />
            </button>
          </div>
        </div>
        <div className="account__btns register__btns">
          <Button type="submit" color="primary" className="account__btn">
            Sign Up
          </Button>
        </div>
      </form>
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
  errors.username = required(values.username) || minLength(4)(values.username);
  errors.email = required(values.email) || email(values.email);
  errors.password = required(values.password) || minLength(8)(values.password);
  return errors;
};


export default compose(
    requireAnonymous(),
    connect(maptStateToProps, { signUp, unloadAuthPage }),
    reduxForm({ form: 'register_form', validate })
)(RegisterForm);

