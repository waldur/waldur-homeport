import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { StringField, FormContainer, SelectField } from '@waldur/form-react';
import { withTranslation, TranslateProps, translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';

import './UserFilter.scss';

interface UserFilterProps extends TranslateProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter = (props: UserFilterProps) => (
  <form className="form-inline" id="user-filter">
    <FormContainer
      labelClass="m-r-md"
      controlClass="m-r-md"
      submitting={props.submitting}>
      <StringField
        label={props.translate('Full name')}
        name="full_name"
        noUpdateOnBlur={true}
      />
      {props.nativeNameVisible && (
        <StringField
          label={props.translate('Native name')}
          name="native_name"
          noUpdateOnBlur={true}
        />
      )}
      <StringField
        label={props.translate('ID code')}
        name="civil_number"
        noUpdateOnBlur={true}
      />
      <StringField
        label={props.translate('Organization')}
        name="organization"
        noUpdateOnBlur={true}
      />
      <StringField
        label={props.translate('Email')}
        name="email"
        noUpdateOnBlur={true}
      />
      <SelectField
        label={props.translate('Role')}
        name="role"
        placeholder={props.translate('Select role')}
        options={[
          {
            name: translate('Staff'),
            value: 'is_staff',
          },
          {
            name: translate('Support'),
            value: 'is_support',
          },
        ]}
        labelKey="name"
        valueKey="value"
        multi={true}
        noUpdateOnBlur={true}
      />
      <SelectField
        label={props.translate('Status')}
        name="status"
        placeholder={props.translate('Select status')}
        options={[
          {
            name: translate('Any'),
            value: undefined,
          },
          {
            name: translate('Active'),
            value: true,
          },
          {
            name: translate('Disabled'),
            value: false,
          },
        ]}
        labelKey="name"
        valueKey="value"
        noUpdateOnBlur={true}
      />
    </FormContainer>
  </form>
);

const mapStateToProps = state => ({
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  reduxForm({form: 'userFilter'}),
  connect(mapStateToProps),
  withTranslation,
);

export const UserFilter = enhance(PureUserFilter);
