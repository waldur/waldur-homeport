import { Resource, OfferingComponent } from 'waldur-js-client';

import { ResourceDisplayLimits } from '../types';

import {
  getResourceComponentEntries,
  ResourceComponentItem,
} from './ResourceComponentItem';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: Pick<
    Resource,
    'name' | 'current_usages' | 'limits' | 'limit_usage'
  > &
    Partial<Pick<Resource, 'spending_limit_status'>> &
    ResourceDisplayLimits;
  components: OfferingComponent[];
}) => {
  const entries = getResourceComponentEntries(resource, components);
  if (entries.length <= 2) {
    return (
      <div
        className={
          entries.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3'
            : 'grid grid-cols-1 gap-x-5 gap-y-3'
        }
      >
        {entries.map((entry) => (
          <div key={entry.key}>
            <ResourceComponentItem
              expanded
              stacked={entries.length === 2}
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-x-5">
        {entries.slice(0, 4).map((entry) => (
          <div key={entry.key}>
            <ResourceComponentItem
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
            />
          </div>
        ))}
      </div>
      {entries.length > 4 && (
        <div className="grow flex items-end mt-4">
          <ResourceShowMoreComponents
            resource={resource}
            components={components}
          />
        </div>
      )}
    </>
  );
};
