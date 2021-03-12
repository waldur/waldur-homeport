import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { getOrganizationWorkspaceBreadcrumb } from '@waldur/navigation/breadcrumbs/utils';
import { useTitle } from '@waldur/navigation/title';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerResourcesContainer: FunctionComponent = () => {
  useBreadcrumbsFn(getOrganizationWorkspaceBreadcrumb, []);
  useTitle(translate('My resources'));
  return (
    <div className="ibox-content">
      <CustomerResourcesFilter />
      <CustomerResourcesList />
    </div>
  );
};
