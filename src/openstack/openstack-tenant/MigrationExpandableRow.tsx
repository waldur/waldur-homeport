import { FC } from 'react';
import { MigrationDetails } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ErrorMessageField } from '@/resource/summary/ErrorMessageField';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const MigrationExpandableRow: FC<{
  row: MigrationDetails;
}> = ({ row }) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('Subnets mapping')}
      value={propVal.list(
        row.mappings?.subnets?.map(
          (subnet) => `${subnet.src_cidr} → ${subnet.dst_cidr}`,
        ),
        { display: 'stack' },
      )}
      hideIfEmpty
    />

    <PropertyItem
      label={translate('Volume types mapping')}
      value={propVal.list(
        row.mappings?.volume_types?.map(
          (volumeType) =>
            `${volumeType.src_type_uuid} → ${volumeType.dst_type_uuid}`,
        ),
        { display: 'stack' },
      )}
      hideIfEmpty
    />

    <PropertyItem
      label={translate('Skip connection to extnet')}
      value={propVal.boolean(row.mappings?.skip_connection_extnet, {
        display: 'badge',
      })}
    />

    <PropertyItem
      label={translate('Copy ports connected to instances')}
      value={propVal.boolean(row.mappings?.sync_instance_ports, {
        display: 'badge',
      })}
    />

    <ErrorMessageField resource={row} />
  </ExpandableContainer>
);
