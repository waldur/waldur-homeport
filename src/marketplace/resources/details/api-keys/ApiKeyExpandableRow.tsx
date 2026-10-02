import { FC } from 'react';

import { ExpandableContainer } from '@/table/ExpandableContainer';

import { UsageMeter } from './ApiKeyUsageMeter';
import { getComponentUsage } from './keyLimits';
import { ApiKeyRow, KeyComponent } from './types';

export const ApiKeyExpandableRow: FC<{
  row: ApiKeyRow;
  components: KeyComponent[];
  resourceLimits: Record<string, number>;
}> = ({ row, components, resourceLimits }) => (
  <ExpandableContainer>
    <div className="flex flex-col gap-y-4 lg:w-7/12">
      {components.map((component) => (
        <UsageMeter
          key={component.type}
          reading={getComponentUsage(row, component, resourceLimits)}
        />
      ))}
    </div>
  </ExpandableContainer>
);
