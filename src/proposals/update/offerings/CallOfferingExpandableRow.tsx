import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
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

    {typeof row.attributes?.limits === 'object' &&
      Object.entries(row.attributes.limits).map(
        ([key, value]: [string, string]) => (
          <Field key={key} label={key} value={value} />
        ),
      )}
  </ExpandableContainer>
);
