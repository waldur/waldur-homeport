import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

export const CallOfferingExpandableRow: FunctionComponent<{ row }> = ({
  row,
}) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Plan')}
      value={renderFieldOrDash(row.plan?.name)}
    />
    {typeof row.attributes?.limits === 'object' &&
      Object.entries(row.attributes.limits).map(
        ([key, value]: [string, string]) => (
          <Field key={key} label={key} value={value} />
        ),
      )}
  </ExpandableContainer>
);
