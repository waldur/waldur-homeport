import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm, SubmissionError } from 'redux-form';

import { $state } from '@waldur/core/services';
import { CancelButton } from '@waldur/form-react/CancelButton';
import { FieldError } from '@waldur/form-react/FieldError';
import { FormContainer } from '@waldur/form-react/FormContainer';
import { StringField } from '@waldur/form-react/StringField';
import { SubmitButton } from '@waldur/form-react/SubmitButton';
import { TextField } from '@waldur/form-react/TextField';
import { HelpLink } from '@waldur/help/HelpLink';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { showSuccess } from '@waldur/store/coreSaga';

import { createKey } from './api';

interface DispatchProps {
  showSuccess: (message: string) => void;
}

class PureKeyCreateForm extends React.Component<DispatchProps & TranslateProps & InjectedFormProps> {
  createKey = async (values: {name: string, public_key: string}) => {
    let data = {...values};
    try {
      if (!values.name) {
        const name = this.extractNameFromKey(values.public_key);
        data = {...values, name};
        this.props.change('name', name);
      }
      await createKey(data);
      this.props.showSuccess(this.props.translate('The key has been created.'));
      $state.go('profile.keys');
    } catch (response) {
      throw new SubmissionError({
        _error: response.data.public_key ?
          response.data.public_key : this.props.translate('Unable to create key.'),
      });
    }
  }

  extractNameFromKey(publicKey: string) {
    if (publicKey) {
      const key = publicKey.split(' ');
      if (key.length === 3 && key[2]) {
        return key[2].trim();
      }
    }
    return '';
  }

  render() {
    const props = this.props;
    return (
      <form
        onSubmit={props.handleSubmit(this.createKey)}
        className="form-horizontal col-sm-10 col-xs-12">
        <FormContainer
          submitting={props.submitting}
          labelClass="col-sm-3"
          controlClass="col-sm-7">
          <StringField
            label={props.translate('Key name')}
            name="name"
          />
          <TextField
            label={
              <>
                <HelpLink type="keys" name="ssh">
                  <i className="fa fa-question-circle"/>
                </HelpLink>
                {' '}
                {props.translate('Public key')}
              </>
            }
            name="public_key"
            required={true}
          />
        </FormContainer>
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-9">
            <FieldError error={props.error}/>
            <SubmitButton
              className="btn btn-primary m-r-sm m-b-sm m-t-sm"
              submitting={props.submitting}
              label={props.translate('Add key')}
            />
            <CancelButton
              onClick={() => $state.go('profile.keys')}
              label={props.translate('Cancel')}
            />
          </div>
        </div>
      </form>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  showSuccess: (message: string) => dispatch(showSuccess(message)),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  reduxForm({form: 'keyCreate'}),
  withTranslation,
);

export const KeyCreateForm = enhance(PureKeyCreateForm);

export default connectAngularComponent(KeyCreateForm);
