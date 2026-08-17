import { FunctionComponent, useMemo } from 'react';
import {
  ComponentUsage,
  ComponentUserUsage,
  OfferingComponent,
  Resource,
} from 'waldur-js-client';

import { generateColors } from 'waldur-design-tokens';

import { ResourceMetaInfo } from '@/marketplace/resources/usage/ResourceMetaInfo';
import { ResourceUsageTabs } from '@/marketplace/resources/usage/ResourceUsageTabs';

interface ResourceUsageTabsContainerProps {
  resource: Pick<
    Resource,
    'name' | 'uuid' | 'customer_name' | 'project_name' | 'backend_id'
  >;
  data: {
    components: OfferingComponent[];
    usages: Pick<ComponentUsage, 'billing_period' | 'type' | 'usage'>[];
    userUsages: Pick<
      ComponentUserUsage,
      'username' | 'component_type' | 'billing_period'
    >[];
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
