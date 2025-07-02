import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';

import { OrganizationRoleSelectField } from '@waldur/customer/team/OrganizationRoleSelectField';
import { ProjectRoleSelectField } from '@waldur/customer/team/ProjectRoleSelectField';
import { SelectField } from '@waldur/form';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { getNativeNameVisible } from '@waldur/store/config';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getRoleFilterOptions, getUserStatusFilterOptions } from './utils';

import './UserFilter.scss';

interface UserFilterProps extends InjectedFormProps {
  submitting: boolean;
  nativeNameVisible: boolean;
}

const PureUserFilter: FunctionComponent<UserFilterProps> = () => {
  return (
    <>
      <TableFilterItem
        title={translate('Organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project role')}
        name="project_role"
        getValueLabel={(value) => value.description || value.name}
        instantApply={false}
      >
        <ProjectRoleSelectField />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Organization role')}
        name="organization_role"
        getValueLabel={(value) => value.description || value.name}
        instantApply={false}
      >
        <OrganizationRoleSelectField />
      </TableFilterItem>
      <TableFilterItem
        name="role"
        title={translate('Role')}
        instantApply={false}
      >
        <Field
          name="role"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              className="Select"
              placeholder={translate('Select role')}
              options={getRoleFilterOptions()}
              noUpdateOnBlur={true}
              isClearable={true}
              {...REACT_MULTI_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        name="is_active"
        title={translate('Status')}
        badgeValue={(value) =>
          getUserStatusFilterOptions().find((op) => op.value === value)?.label
        }
        ellipsis={false}
      >
        <Field
          name="is_active"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              className="Select"
              placeholder={translate('Select status')}
              options={getUserStatusFilterOptions()}
              noUpdateOnBlur={true}
              simpleValue={true}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const mapStateToProps = () => ({
  nativeNameVisible: getNativeNameVisible(),
});

const enhance = compose(
  reduxForm({
    form: 'userFilter',
    destroyOnUnmount: false,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
);

export const UserFilter = enhance(PureUserFilter);
