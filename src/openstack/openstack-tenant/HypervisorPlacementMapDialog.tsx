import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { openstackInstancesList } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { createFetcher, fetchAll } from '@waldur/table/api';

import { HypervisorPlacementMapContent } from './HypervisorPlacementMapContent';

interface Props {
  resolve: {
    tenantUuid: string;
  };
}

export const HypervisorPlacementMapDialog: FC<Props> = ({ resolve }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hypervisor-placement-map', resolve.tenantUuid],
    queryFn: () =>
      fetchAll(createFetcher(openstackInstancesList), {
        tableKey: 'hypervisor-placement-map',
        currentPage: 1,
        pageSize: 50,
        filter: {
          tenant_uuid: resolve.tenantUuid,
          field: [
            'uuid',
            'name',
            'cores',
            'ram',
            'hypervisor_hostname',
            'server_group',
            'runtime_state',
            'project_name',
            'customer_name',
          ],
        },
      }),
    staleTime: 30_000,
  });

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
      ) : !data?.length ? (
        <NoResult
          title={translate('No instances found')}
          message={translate(
            'There are no instances in this tenant to display.',
          )}
          noAction
        />
      ) : (
        <HypervisorPlacementMapContent instances={data} />
      )}
    </ModalDialog>
  );
};
