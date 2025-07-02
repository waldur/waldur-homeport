import React from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { REACT_MULTI_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProjectsListFilter = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(option) => option.name}
      instantApply={false}
    >
      <OrganizationAutocomplete
        reactSelectProps={{ ...REACT_MULTI_SELECT_TABLE_FILTER }}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Conceal finished projects')}
      name="conceal_finished_projects"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="conceal_finished_projects"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Conceal finished projects')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const ProjectsListFilter = reduxForm({
  form: 'affiliationProjectsListFilter',
  destroyOnUnmount: false,
})(PureProjectsListFilter) as React.ComponentType;
