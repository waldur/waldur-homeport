import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { generateColors } from '@waldur/customer/divisions/utils';
import { translate } from '@waldur/i18n';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';

import { getComponentsAndUsages } from './api';

interface ResourceUsageTabsContainerProps {
  offeringUuid: string;
  marketplaceResourceUuid: string;
}

export const ResourceUsageTabsContainer = ({
  offeringUuid,
  marketplaceResourceUuid,
}: ResourceUsageTabsContainerProps) => {
  const { loading, error, value } = useAsync(
    () => getComponentsAndUsages(offeringUuid, marketplaceResourceUuid),
    [offeringUuid, marketplaceResourceUuid],
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : !value.components.length ? (
    <h3>
      {translate(
        'Marketplace offering does not have any usage-based components.',
      )}
    </h3>
  ) : (
    <ResourceUsageTabs
      components={value.components}
      usages={value.usages}
      colors={generateColors(value.components.length, {
        colorStart: 0.25,
        colorEnd: 0.65,
        useEndAsStart: true,
      })}
    />
  );
};
