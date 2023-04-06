import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { SelectField } from '@waldur/form';
import { DebouncedStringField } from '@waldur/form/DebouncedStringField';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import './UserFilter.scss';

interface UserFilterProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter: FunctionComponent<UserFilterProps> = (props) => (
  <>
    <TableFilterItem title={translate('Full name')}>
      <Field
        name="full_name"
        component={(fieldProps) => (
          <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
        )}
      ></Field>
    </TableFilterItem>
    {props.nativeNameVisible && (
      <TableFilterItem title={translate('Native name')}>
        <Field
          name="native_name"
          component={(fieldProps) => (
            <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
          )}
        ></Field>
      </TableFilterItem>
    )}
    <TableFilterItem title={translate('ID code')} name="civil_number">
      <Field
        name="civil_number"
        component={(fieldProps) => (
          <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
        )}
      ></Field>
    </TableFilterItem>
    <TableFilterItem title={translate('Username')}>
      <Field
        name="username"
        component={(fieldProps) => (
          <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
        )}
      ></Field>
    </TableFilterItem>
    <TableFilterItem title={translate('Organization')}>
      <Field
        name="organization"
        component={(fieldProps) => (
          <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
        )}
      ></Field>
    </TableFilterItem>
    <TableFilterItem title={translate('Email')}>
      <Field
        name="email"
        component={(fieldProps) => (
          <DebouncedStringField {...fieldProps} noUpdateOnBlur={true} />
        )}
      ></Field>
    </TableFilterItem>
    <TableFilterItem title={translate('Role')}>
      <Field
        name="role"
        component={(fieldProps) => (
          <SelectField
            {...fieldProps}
            className="Select"
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
        )}
      ></Field>
    </TableFilterItem>
    <TableFilterItem title={translate('Status')}>
      <Field
        name="status"
        component={(fieldProps) => (
          <SelectField
            {...fieldProps}
            className="Select"
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
        )}
      ></Field>
    </TableFilterItem>
  </>
);

const mapStateToProps = (state: RootState) => ({
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  reduxForm({ form: 'userFilter', destroyOnUnmount: false }),
  connect(mapStateToProps),
);

export const UserFilter = enhance(PureUserFilter);
