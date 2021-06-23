import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { getOrganizationWorkspaceBreadcrumb } from '@waldur/navigation/breadcrumbs/utils';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerResourcesContainer: FunctionComponent = () => {
  useBreadcrumbsFn(getOrganizationWorkspaceBreadcrumb, []);
  useTitle(translate('My resources'));
  useSidebarKey('marketplace-services');
  return (
    <div className="ibox-content">
      <CustomerResourcesFilter />
      <CustomerResourcesList />
    </div>
  );
};
