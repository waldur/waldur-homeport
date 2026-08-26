import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  OpenStackHealthMonitor,
  openstackHealthMonitorsDestroy,
  openstackHealthMonitorsPartialUpdate,
  openstackHealthMonitorsPull,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
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

const EditHealthMonitorDialog: FC<
  ActionDialogProps<OpenStackHealthMonitor>
> = ({ resolve: { resource, refetch } }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackHealthMonitorsPartialUpdate({
          path: { uuid: resource.uuid },
          body: {
            name: formData.name,
            delay: formData.delay ? Number(formData.delay) : undefined,
            timeout: formData.timeout ? Number(formData.timeout) : undefined,
            max_retries: formData.max_retries
              ? Number(formData.max_retries)
              : undefined,
          },
        });
        showSuccess(translate('Health monitor has been updated.'));
        closeDialog();
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update health monitor.'));
      }
    },
    [closeDialog, refetch, resource, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit health monitor')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Health monitor name')}
          name={resource.name}
        />
      }
      submitForm={submitForm}
      formFields={[
        { ...createNameField(), required: false },
        {
          name: 'delay',
          label: translate('Delay (seconds)'),
          type: 'integer',
          minValue: 1,
          required: false,
        },
        {
          name: 'timeout',
          label: translate('Timeout (seconds)'),
          type: 'integer',
          minValue: 1,
          required: false,
        },
        {
          name: 'max_retries',
          label: translate('Max retries'),
          type: 'integer',
          minValue: 1,
          maxValue: 10,
          required: false,
        },
      ]}
      initialValues={{
        name: resource.name,
        delay: resource.delay,
        timeout: resource.timeout,
        max_retries: resource.max_retries,
      }}
    />
  );
};

const EditHealthMonitorDialogLazy = lazyComponent(() =>
  Promise.resolve({ default: EditHealthMonitorDialog }),
);

const DestroyHealthMonitorButton: FC<{
  resource: OpenStackHealthMonitor;
  refetch?(): void;
}> = ({ resource, refetch }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const destroy = async () => {
    try {
      await confirm(
        translate('Remove health monitor'),
        translate('Are you sure you want to remove this health monitor?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackHealthMonitorsDestroy({ path: { uuid: resource.uuid } });
      showSuccess(translate('Health monitor was removed.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove health monitor.'));
    }
  };

  return (
    <ActionItem
      title={translate('Remove health monitor')}
      action={destroy}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};

interface HealthMonitorRowActionsProps {
  row: OpenStackHealthMonitor;
  fetch(): void;
}

export const HealthMonitorRowActions: FC<HealthMonitorRowActionsProps> = ({
  row,
  fetch,
}) => (
  <ActionsDropdownComponent>
    <DialogActionItem
      title={translate('Edit')}
      modalComponent={EditHealthMonitorDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <PullActionItem
      apiMethod={(uuid) => openstackHealthMonitorsPull({ path: { uuid } })}
      resource={row}
      refetch={fetch}
    />
    <DestroyHealthMonitorButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);
