import { FunctionComponent, useMemo } from 'react';
import {
  ComponentUsage,
  ComponentUserUsage,
  OfferingComponent,
} from 'waldur-js-client';

import { generateColors } from '@/core/generateColors';
import { ResourceMetaInfo } from '@/marketplace/resources/usage/ResourceMetaInfo';
import { ResourceUsageTabs } from '@/marketplace/resources/usage/ResourceUsageTabs';

interface ResourceUsageTabsContainerProps {
  resource: {
    name?: string;
    resource_uuid?: string;
    offering_uuid?: string;
    customer_name?: string;
    project_name?: string;
    backend_id?: string;
  };
  data: {
    components: OfferingComponent[];
    usages: ComponentUsage[];
    userUsages: ComponentUserUsage[];
  };
  months?: number;
  hideHeader?: boolean;
  displayMode?: 'chart' | 'table';
  users?: any[];
}

export const ResourceUsageTabsContainer: FunctionComponent<
  ResourceUsageTabsContainerProps
> = ({ resource, data, months, hideHeader, displayMode, users }) => {
  const userUsages = useMemo(() => {
    const records =
      users?.length && data?.userUsages
        ? data.userUsages.filter((usage) =>
            users.some(
              (user) => usage.username === user.offering_user_username,
            ),
          )
        : data?.userUsages;
    return (records || []).sort((a, b) => a.username.localeCompare(b.username));
  }, [data, users]);

  return (
    <>
      {!hideHeader && <ResourceMetaInfo resource={resource} />}
      <ResourceUsageTabs
        resource={resource}
        components={data.components}
        usages={data.usages}
        userUsages={userUsages}
        months={months}
        colors={generateColors(data.components.length, {
          colorStart: 0.25,
          colorEnd: 0.65,
          useEndAsStart: true,
        })}
        displayMode={displayMode}
      />
    </>
  );
};
