import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';

import {
  getInitialValues,
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getRoleFilterOptions } from './utils';

import './UserFilter.scss';

interface UserFilterProps extends InjectedFormProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter: FunctionComponent<UserFilterProps> = ({ form }) => {
  useReinitializeFilterFromUrl(form);

  return (
    <>
      <TableFilterItem
        title={translate('Organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete />
      </TableFilterItem>
      <TableFilterItem name="role" title={translate('Role')}>
        <Field
          name="role"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              className="Select"
              placeholder={translate('Select role')}
              options={getRoleFilterOptions()}
              isMulti={true}
              noUpdateOnBlur={true}
              isClearable={true}
            />
          )}
        ></Field>
      </TableFilterItem>
      <TableFilterItem name="status" title={translate('Status')}>
        <Field
          name="status"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              className="Select"
              placeholder={translate('Select status')}
              options={[
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
};

const mapStateToProps = (state: RootState) => ({
  nativeNameVisible: getNativeNameVisible(state),
});

const enhance = compose(
  reduxForm({
    form: 'userFilter',
    onChange: syncFiltersToURL,
    destroyOnUnmount: true,
    initialValues: getInitialValues(),
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
);

export const UserFilter = enhance(PureUserFilter);
