import { FC } from 'react';
import { CallResourceTemplate } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: CallResourceTemplate;
}

export const ResourceTemplateExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('Termination date')}
      value={(row.attributes as any).end_date}
    />

    <PropertyItem
      label={translate('QoS')}
      value={(row.attributes as any).qos}
    />

    <PropertyItem
      label={translate('Partition')}
      value={(row.attributes as any).partition}
    />

    <PropertyItem label={translate('Description')} value={row.description} />

    <PropertyItem
      label={translate('Additional information')}
      value={(row.attributes as any).additional_info}
    />
  </ExpandableContainer>
);
