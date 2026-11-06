import { FC } from 'react';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { UsageMeter } from './ApiKeyUsageMeter';
import { getComponentReadings, ResourceSpendingLimits } from './keyLimits';
import { ApiKeyRow, KeyComponent } from './types';

// The description in full, which the table cell clamps, then the usage of each
// component. Without key management there is no usage: pass no components.
export const ApiKeyExpandableRow: FC<{
  row: ApiKeyRow;
  components: KeyComponent[];
  resourceLimits: ResourceSpendingLimits;
}> = ({ row, components, resourceLimits }) => (
  <ExpandableContainer>
    <div className="flex flex-col gap-y-4 lg:w-7/12">
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Description')}
          value={row.description}
          valueClass="whitespace-pre-line break-words"
        />
      </PropertyList>
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
