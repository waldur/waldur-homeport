import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  OpenStackInstance,
  openstackInstancesRetrieve,
  Resource,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import {
  HypervisorPlacementMapContent,
  PlacementInstance,
} from './HypervisorPlacementMapContent';

interface Props {
  resolve: {
    rows: Resource[];
  };
}

const SPARSE_FIELDS: Array<
  | 'uuid'
  | 'name'
  | 'cores'
  | 'ram'
  | 'hypervisor_hostname'
  | 'server_group'
  | 'runtime_state'
  | 'project_name'
  | 'customer_name'
> = [
  'uuid',
  'name',
  'cores',
  'ram',
  'hypervisor_hostname',
  'server_group',
  'runtime_state',
  'project_name',
  'customer_name',
];

export const PlacementMapBatchDialog: FC<Props> = ({ resolve }) => {
  // Build lookup from resource_uuid → offering_name
  const offeringByUuid = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of resolve.rows) {
      if (row.resource_uuid && row.offering_name) {
        map.set(row.resource_uuid, row.offering_name);
      }
    }
    return map;
  }, [resolve.rows]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'placement-map-batch',
      resolve.rows.map((r) => r.resource_uuid).sort(),
    ],
    queryFn: () =>
      Promise.all(
        resolve.rows.map((row) =>
          openstackInstancesRetrieve({
            path: { uuid: row.resource_uuid },
            query: { field: SPARSE_FIELDS },
          }).then((res) => res.data as OpenStackInstance),
        ),
      ),
    staleTime: 30_000,
  });

  // Enrich instances with offering_name from Resource rows
  const enriched: PlacementInstance[] | undefined = useMemo(
    () =>
      data?.map((inst) => ({
        ...inst,
        offering_name: offeringByUuid.get(inst.uuid) || undefined,
      })),
    [data, offeringByUuid],
  );

  return (
    <ModalDialog
      title={translate('Hypervisor placement map')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="alert alert-danger">
          {translate('Failed to load instances.')}
        </div>
      ) : !enriched?.length ? (
        <NoResult
          title={translate('No instances found')}
          message={translate('There are no instances to display.')}
          noAction
        />
      ) : (
        <HypervisorPlacementMapContent instances={enriched} />
      )}
    </ModalDialog>
  );
};
