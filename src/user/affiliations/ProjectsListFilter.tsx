import React from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProjectsListFilter = () => (
  <TableFilterFormContainer form={'affiliationProjectsListFilter'}>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
      ellipsis={false}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
  </TableFilterFormContainer>
);

export const ProjectsListFilter = reduxForm({
  form: 'affiliationProjectsListFilter',
  destroyOnUnmount: false,
})(PureProjectsListFilter) as React.ComponentType;
