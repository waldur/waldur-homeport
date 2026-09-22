import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import {
  findQuantityComponent,
  formatComponentQuantity,
  getComponentLabel,
} from '@/marketplace/common/componentQuantity';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

export const CallOfferingExpandableRow: FunctionComponent<{ row }> = ({
  row,
}) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Plan')}
      value={renderFieldOrDash(row.plan_details?.name)}
    />

    {/* `typeof null` is also "object", and Object.entries(null) throws — an
        offering whose attributes store an explicit null took the row down. */}
    {row.attributes?.limits &&
      typeof row.attributes.limits === 'object' &&
      Object.entries(row.attributes.limits).map(
        ([key, value]: [string, string]) => (
          // Limits are keyed by component type: name each one as the offering
          // does, and state the unit its amount is counted in.
          <Field
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
