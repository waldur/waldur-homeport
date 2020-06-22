import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { useTitle } from '@waldur/navigation/title';

import { getOffering, getCategory, getPlugins } from '../common/api';

import { OfferingDetails } from './OfferingDetails';
import { getTabs } from './OfferingTabs';
import { getBreadcrumbs } from './utils';

async function loadData(offering_uuid: string) {
  const offering = await getOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  const plugins = await getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  return { offering, tabs, limits };
}

export const OfferingDetailsPage: React.FC<{}> = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(() => loadData(offering_uuid), [
    offering_uuid,
  ]);

  useBreadcrumbsFn(() => (value ? getBreadcrumbs(value.offering) : []), [
    value,
  ]);

  useTitle(value ? value.offering.name : translate('Offering details'));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  return (
    <OfferingDetails
      offering={value.offering}
      tabs={value.tabs}
      limits={value.limits}
    />
  );
};
