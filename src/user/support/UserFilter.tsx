import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { StringField, FormContainer, SelectField } from '@waldur/form';
import { withTranslation, TranslateProps, translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import './UserFilter.scss';

interface UserFilterProps extends TranslateProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter: FunctionComponent<UserFilterProps> = (props) => (
  <form className="form-inline" id="user-filter">
    <FormContainer
      labelClass="m-r-md"
      controlClass="m-r-md"
      submitting={props.submitting}
    >
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
        className="Select"
        label={props.translate('Role')}
        name="role"
        placeholder={props.translate('Select role')}
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
        label={props.translate('Status')}
        name="status"
        placeholder={props.translate('Select status')}
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
  reduxForm({ form: 'userFilter' }),
  connect(mapStateToProps),
  withTranslation,
);

export const UserFilter = enhance(PureUserFilter);
