import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { generateColors } from '@waldur/customer/divisions/utils';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceMetaInfo } from '@waldur/marketplace/resources/usage/ResourceMetaInfo';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';

import { getComponentsAndUsages } from './api';

interface ResourceUsageTabsContainerProps {
  resource: Resource;
  hideHeader?: boolean;
}

export const ResourceUsageTabsContainer: FunctionComponent<ResourceUsageTabsContainerProps> =
  ({ resource, hideHeader }) => {
    const { loading, error, value } = useAsync(
      () =>
        getComponentsAndUsages(resource.offering_uuid, resource.resource_uuid),
      [resource],
    );
    return loading ? (
      <LoadingSpinner />
    ) : error ? (
      <>{translate('Unable to load data')}</>
    ) : !value.components.length ? (
      <h3>{translate('Offering does not have any usage-based components.')}</h3>
    ) : (
      <>
        {!hideHeader && <ResourceMetaInfo resource={resource} />}
        <ResourceUsageTabs
          components={value.components}
          usages={value.usages}
          colors={generateColors(value.components.length, {
            colorStart: 0.25,
            colorEnd: 0.65,
            useEndAsStart: true,
          })}
        />
      </>
    );
  };
