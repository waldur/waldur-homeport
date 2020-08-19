import * as React from 'react';

import { translate } from '@waldur/i18n';
import { GrowthChart } from '@waldur/invoices/growth/GrowthChart';
import { GrowthFilter } from '@waldur/invoices/growth/GrowthFilter';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';

const getBreadcrumbs = (): BreadcrumbItem[] => [
  {
    label: translate('Support dashboard'),
    state: 'support.helpdesk',
  },
  {
    label: translate('Reporting'),
  },
];

export const GrowthContainer = () => {
  useTitle(translate('Growth'));
  useBreadcrumbsFn(getBreadcrumbs, []);
  return (
    <>
      <GrowthFilter />
      <GrowthChart />
    </>
  );
};
