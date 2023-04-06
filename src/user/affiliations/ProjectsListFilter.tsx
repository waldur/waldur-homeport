import React from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProjectsListFilter = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
      ellipsis={false}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
  </>
);

export const ProjectsListFilter = reduxForm({
  form: 'affiliationProjectsListFilter',
  destroyOnUnmount: false,
})(PureProjectsListFilter) as React.ComponentType;
