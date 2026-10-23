import { FC } from 'react';

import { ExpandableContainer } from '@/table/ExpandableContainer';

import { UsageMeter } from './ApiKeyUsageMeter';
import { getComponentReadings, ResourceSpendingLimits } from './keyLimits';
import { ApiKeyRow, KeyComponent } from './types';

export const ApiKeyExpandableRow: FC<{
  row: ApiKeyRow;
  components: KeyComponent[];
  resourceLimits: ResourceSpendingLimits;
}> = ({ row, components, resourceLimits }) => (
  <ExpandableContainer>
    <div className="flex flex-col gap-y-4 lg:w-7/12">
      {components.flatMap((component) =>
        getComponentReadings(row, component, resourceLimits).map((reading) => (
          <UsageMeter
            key={`${component.type}-${reading.period ?? 'month'}`}
            reading={reading}
          />
        )),
      )}
    </div>
  </ExpandableContainer>
);
