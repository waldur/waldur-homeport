import { FunctionComponent, useMemo } from 'react';
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
  users?: any[];
}

export const ResourceUsageTabsContainer: FunctionComponent<
  ResourceUsageTabsContainerProps
> = ({ resource, months, hideHeader, displayMode, offering, users }) => {
  const { loading, error, value } = useAsync(
    () =>
      getComponentsAndUsages(
        resource.resource_uuid,
        offering,
        months,
        resource.offering_uuid,
      ),
    [resource, months],
  );

  const userUsages = useMemo(
    () =>
      users?.length && value?.userUsages
        ? value.userUsages.filter((usage) =>
            users.some(
              (user) => usage.username === user.offering_user_username,
            ),
          )
        : value?.userUsages,
    [value, users],
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
        userUsages={userUsages}
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
