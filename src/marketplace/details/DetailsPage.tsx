import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getPublicOffering, getCategory, getPlugins } from '../common/api';

import { OfferingDetails } from './OfferingDetails';
import { getTabs } from './OfferingTabs';
import { getBreadcrumbs } from './utils';

async function loadData(offering_uuid: string, customer: Customer) {
  const offering = customer?.uuid
    ? await getPublicOffering(offering_uuid, {
        params: {
          allowed_customer_uuid: customer.uuid,
        },
      })
    : await getPublicOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  const plugins = await getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  return { offering, tabs, limits };
}

export const OfferingDetailsPage: React.FC = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();
  const customer = useSelector(getCustomer);

  const router = useRouter();

  const { loading, value, error } = useAsync(
    () => loadData(offering_uuid, customer),
    [offering_uuid, customer],
  );

  useBreadcrumbsFn(
    () => (value ? getBreadcrumbs(value.offering) : []),
    [value],
  );

  useTitle(value ? value.offering.name : translate('Offering details'));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (value.offering.state !== 'Active') {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  return (
    <OfferingDetails
      offering={value.offering}
      tabs={value.tabs}
      limits={value.limits}
    />
  );
};
