import { FC } from 'react';
import { MigrationDetails } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ErrorMessageField } from '@waldur/resource/summary/ErrorMessageField';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const MigrationExpandableRow: FC<{
  row: MigrationDetails;
}> = ({ row }) => (
  <ExpandableContainer asTable>
    {row.mappings?.subnets?.length > 0 && (
      <Field
        label={translate('Subnets mapping')}
        value={
          <ul className="mb-0">
            {row.mappings.subnets.map((subnet, index) => (
              <li key={index}>
                {subnet.src_cidr}: {subnet.dst_cidr}
              </li>
            ))}
          </ul>
        }
      />
    )}

    {row.mappings?.volume_types?.length > 0 && (
      <Field
        label={translate('Volume types mapping')}
        value={
          <ul className="mb-0">
            {row.mappings.volume_types.map((volumeType, index) => (
              <li key={index}>
                {volumeType.src_type_uuid}: {volumeType.dst_type_uuid}
              </li>
            ))}
          </ul>
        }
      />
    )}

    <Field
      label={translate('Skip connection to extnet')}
      value={<BooleanBadge value={row.mappings?.skip_connection_extnet} />}
    />

    <Field
      label={translate('Copy ports connected to instances')}
      value={<BooleanBadge value={row.mappings?.sync_instance_ports} />}
    />

    <ErrorMessageField resource={row} />
  </ExpandableContainer>
);
