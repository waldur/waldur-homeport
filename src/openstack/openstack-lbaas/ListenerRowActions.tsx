import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { openstackListenersPull } from 'waldur-js-client';
import {
  OpenStackListener,
  openstackListenersDestroy,
  openstackListenersPartialUpdate,
  openstackPoolsRetrieve,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { ActionItem } from '@/resource/actions/ActionItem';
import { createNameField } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { poolAutocomplete } from './poolAutocomplete';

const getPoolUrl = (pool: any): string | null => {
  if (!pool) return null;
  if (typeof pool === 'object' && pool.uuid) {
    return `${ENV.apiEndpoint}api/openstack-pools/${pool.uuid}/`;
  }
  return pool;
};

const EditListenerDialog: FC<ActionDialogProps<OpenStackListener>> = ({
  resolve: { resource, refetch },
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const poolUuid = resource.default_pool
    ? getUUID(resource.default_pool)
    : null;

  const { data: currentPool, isLoading: isLoadingPool } = useQuery({
    queryKey: ['pool-for-listener-edit', poolUuid],
    queryFn: () =>
      openstackPoolsRetrieve({
        path: { uuid: poolUuid },
        query: { field: ['uuid', 'name'] },
      }).then((res) => res.data),
    enabled: Boolean(poolUuid),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const initialValues = useMemo(
    () => ({
      name: resource.name,
      default_pool: currentPool ?? null,
    }),
    [resource.name, currentPool],
  );

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackListenersPartialUpdate({
          path: { uuid: resource.uuid },
          body: {
            name: formData.name,
            default_pool: getPoolUrl(formData.default_pool),
          },
        });
        showSuccess(translate('Listener has been updated.'));
        closeDialog();
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update listener.'));
      }
    },
    [closeDialog, refetch, resource, showErrorResponse, showSuccess],
  );

  if (isLoadingPool) return <LoadingSpinner />;

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit listener')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Listener name')}
          name={resource.name}
        />
      }
      submitForm={submitForm}
      formFields={[
        createNameField(),
        {
          name: 'default_pool',
          label: translate('Default pool'),
          type: 'async_select',
          placeholder: translate('Select pool...'),
          loadOptions: poolAutocomplete(resource.load_balancer_uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) => option.name,
          noOptionsMessage: () => translate('No pools'),
          isClearable: true,
          required: false,
        },
      ]}
      initialValues={initialValues}
    />
  );
};

const EditListenerDialogLazy = lazyComponent(() =>
  Promise.resolve({ default: EditListenerDialog }),
);

const DestroyListenerButton: FC<{
  resource: OpenStackListener;
  refetch?(): void;
}> = ({ resource, refetch }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const destroy = async () => {
    try {
      await confirm(
        translate('Remove listener'),
        translate('Are you sure you want to remove this listener?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackListenersDestroy({ path: { uuid: resource.uuid } });
      showSuccess(translate('Listener was removed.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove listener.'));
    }
  };

  return (
    <ActionItem
      title={translate('Remove listener')}
      action={destroy}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};

interface ListenerRowActionsProps {
  row: OpenStackListener;
  fetch(): void;
}

export const ListenerRowActions: FC<ListenerRowActionsProps> = ({
  row,
  fetch,
}) => (
  <ActionsDropdownComponent>
    <DialogActionItem
      title={translate('Edit')}
      modalComponent={EditListenerDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <PullActionItem
      apiMethod={(uuid) => openstackListenersPull({ path: { uuid } })}
      resource={row}
      refetch={fetch}
    />
    <DestroyListenerButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);
