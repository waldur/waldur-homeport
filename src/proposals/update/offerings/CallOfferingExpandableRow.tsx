import { FunctionComponent } from 'react';
import { RequestedOffering } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  findQuantityComponent,
  formatComponentQuantity,
  getComponentLabel,
} from '@/marketplace/common/componentQuantity';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const CallOfferingExpandableRow: FunctionComponent<{
  row: RequestedOffering;
}> = ({ row }) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('Plan')}
      value={row.plan_details?.name}
      hideIfEmpty={false}
    />

    {/* `typeof null` is also "object", and Object.entries(null) throws — an
        offering whose attributes store an explicit null took the row down. */}
    {row.attributes?.limits &&
      typeof row.attributes.limits === 'object' &&
      Object.entries(row.attributes.limits).map(
        ([key, value]: [string, string]) => (
          // Limits are keyed by component type: name each one as the offering
          // does, and state the unit its amount is counted in.
          <PropertyItem
            key={key}
            label={getComponentLabel(key, row.components)}
            value={formatComponentQuantity(
              value,
              findQuantityComponent(row.components, key),
            )}
          />
        ),
      )}
  </ExpandableContainer>
);
