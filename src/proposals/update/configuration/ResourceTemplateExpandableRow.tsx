import { FC } from 'react';
import { CallResourceTemplate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: CallResourceTemplate;
}

export const ResourceTemplateExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Termination date')}
      value={(row.attributes as any).end_date}
    />

    <Field label={translate('Description')} value={row.description} />

    <Field
      label={translate('Additional information')}
      value={(row.attributes as any).additional_info}
    />
  </ExpandableContainer>
);
