import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { getOrganizationWorkspaceBreadcrumb } from '@waldur/navigation/breadcrumbs/utils';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer: FunctionComponent = () => {
  useBreadcrumbsFn(getOrganizationWorkspaceBreadcrumb, []);
  useTitle(translate('My offerings'));
  useSidebarKey('marketplace-services');
  return (
    <div className="ibox-content">
      <MyOfferingsFilter />
      <MyOfferingsList />
    </div>
  );
};
