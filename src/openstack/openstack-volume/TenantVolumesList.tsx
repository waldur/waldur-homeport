import { FunctionComponent, useMemo } from 'react';
import { OpenStackVolume, OpenstackVolumesListData } from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { AddResourceButton } from '@waldur/marketplace/resources/actions/AddResourceButton';
import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { VOLUME_TYPE } from '../constants';

import { formatInstance } from './OpenStackVolumeSummary';

export const TenantVolumesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackVolumesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstack-volumes',
    fetchData: createFetcher('openstack-volumes'),
    filter,
    queryField: 'name',
  });

  return (
    <Table<OpenStackVolume>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          copyField: (row) => row.name,
        },
        {
          title: translate('Size'),
          render: ({ row }) => formatFilesize(row.size),
        },
        {
          title: translate('Bootable'),
          render: ({ row }) => <BooleanField value={row.bootable} />,
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type_name || 'N/A',
        },
        {
          title: translate('Attached to'),
          render: ({ row }) => formatInstance(row),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      hasQuery={true}
      tableActions={
        <AddResourceButton
          resource={resourceScope}
          offeringType={VOLUME_TYPE}
        />
      }
      title={translate('Volumes')}
      verboseName={translate('volumes')}
      showPageSizeSelector
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      rowActions={({ row }) => (
        <ModalActionsRouter
          url={row.url}
          name={row.name}
          offering_type={VOLUME_TYPE}
          refetch={props.fetch}
        />
      )}
    />
  );
};
