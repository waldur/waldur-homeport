import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { generateColors } from '@waldur/core/generateColors';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ResourceMetaInfo } from '@waldur/marketplace/resources/usage/ResourceMetaInfo';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';

import { getComponentsAndUsages } from './api';

interface ResourceUsageTabsContainerProps {
  resource: {
    resource_uuid: string;
    offering_uuid: string;
    customer_name?: string;
    project_name?: string;
    backend_id?: string;
  };
  months?: number;
  hideHeader?: boolean;
  displayMode?: 'chart' | 'table';
  offering?: any;
}

export const ResourceUsageTabsContainer: FunctionComponent<
  ResourceUsageTabsContainerProps
> = ({ resource, months, hideHeader, displayMode, offering }) => {
  const { loading, error, value } = useAsync(
    () => getComponentsAndUsages(resource.resource_uuid, offering, months),
    [resource, months],
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>
      {translate('Unable to load data')}
      <br />
      {error.message}
    </>
  ) : !value.components.length ? (
    <h3>{translate('Offering does not have any usage-based components.')}</h3>
  ) : (
    <>
      {!hideHeader && <ResourceMetaInfo resource={resource} />}
      <ResourceUsageTabs
        components={value.components}
        usages={value.usages}
        months={months}
        colors={generateColors(value.components.length, {
          colorStart: 0.25,
          colorEnd: 0.65,
          useEndAsStart: true,
        })}
        displayMode={displayMode}
      />
    </>
  );
};
