import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SelectField } from '@waldur/form';
import { DebouncedStringField } from '@waldur/form/DebouncedStringField';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import './UserFilter.scss';

interface UserFilterProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter: FunctionComponent<UserFilterProps> = (props) => (
  <form className="form-inline" id="user-filter">
    <FormContainer
      labelClass="me-3"
      controlClass="me-3"
      submitting={props.submitting}
      clearOnUnmount={false}
    >
      <DebouncedStringField
        label={translate('Full name')}
        name="full_name"
        noUpdateOnBlur={true}
      />
      {props.nativeNameVisible && (
        <DebouncedStringField
          label={translate('Native name')}
          name="native_name"
          noUpdateOnBlur={true}
        />
      )}
      <DebouncedStringField
        label={translate('ID code')}
        name="civil_number"
        noUpdateOnBlur={true}
      />
      <DebouncedStringField
        label={translate('Username')}
        name="username"
        noUpdateOnBlur={true}
      />
      <DebouncedStringField
        label={translate('Organization')}
        name="organization"
        noUpdateOnBlur={true}
      />
      <DebouncedStringField
        label={translate('Email')}
        name="email"
        noUpdateOnBlur={true}
      />
      <SelectField
        className="Select"
        label={translate('Role')}
        name="role"
        placeholder={translate('Select role')}
        options={[
          {
            label: translate('Staff'),
            value: 'is_staff',
          },
          {
            label: translate('Support'),
            value: 'is_support',
          },
        ]}
        isMulti={true}
        noUpdateOnBlur={true}
        isClearable={true}
      />
      <SelectField
        className="Select"
        label={translate('Status')}
        name="status"
        placeholder={translate('Select status')}
        options={[
          {
            label: translate('Any'),
            value: undefined,
          },
          {
            label: translate('Active'),
            value: true,
          },
          {
            label: translate('Disabled'),
            value: false,
          },
        ]}
        noUpdateOnBlur={true}
        simpleValue={true}
        isClearable={true}
      />
    </FormContainer>
  </form>
);

const mapStateToProps = (state: RootState) => ({
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  reduxForm({ form: 'userFilter', destroyOnUnmount: false }),
  connect(mapStateToProps),
);

export const UserFilter = enhance(PureUserFilter);
