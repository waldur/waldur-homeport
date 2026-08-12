import { FC, useMemo } from 'react';
import { ProviderHelpdesk } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import { useCreateHelpdesk, useUpdateHelpdesk } from '../api';
import { BACKEND_OPTIONS } from '../common/backend';
import { useRefreshWorkspaceCustomer } from '../common/useRefreshWorkspaceCustomer';

interface OwnProps {
  resolve: {
    serviceProviderUuid: string;
    helpdesk?: ProviderHelpdesk;
    refetch: () => void;
  };
}

// Covers backend type, notifications and active state. External backends
// (email/atlassian/zammad/smax) are selectable and run on the operator's global
// backend config; per-provider credential fields (their own URL/token) are a
// follow-up — see BACKEND_OPTIONS in ../common/backend.
export const HelpdeskSettingsForm: FC<OwnProps> = ({
  resolve: { serviceProviderUuid, helpdesk, refetch },
}) => {
  const isEdit = Boolean(helpdesk);
  const createMutation = useCreateHelpdesk(refetch);
  const updateMutation = useUpdateHelpdesk(refetch);
  const refreshWorkspaceCustomer = useRefreshWorkspaceCustomer();

  const handleSubmit = async (formData) => {
    const body = {
      backend_type: formData.backend_type?.value ?? formData.backend_type,
      notification_email: formData.notification_email || undefined,
      is_active: formData.is_active,
      notify_on_new_ticket: formData.notify_on_new_ticket,
      notify_on_comment: formData.notify_on_comment,
      notify_on_escalation: formData.notify_on_escalation,
      notify_on_sla_warning: formData.notify_on_sla_warning,
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ uuid: helpdesk!.uuid, body });
    } else {
      await createMutation.mutateAsync({
        service_provider: serviceProviderUuid,
        ...body,
      });
      // Surface the Helpdesk mode tab without a page reload once
      // has_active_helpdesk flips.
      await refreshWorkspaceCustomer();
    }
  };

  const fields = [
    {
      name: 'backend_type',
      label: translate('Backend type'),
      type: 'select',
      options: BACKEND_OPTIONS,
      required: true,
    },
    {
      name: 'notification_email',
      label: translate('Notification email'),
      type: 'string',
    },
    { name: 'is_active', label: translate('Active'), type: 'boolean' },
    {
      name: 'notify_on_new_ticket',
      label: translate('Notify on new ticket'),
      type: 'boolean',
    },
    {
      name: 'notify_on_comment',
      label: translate('Notify on customer comment'),
      type: 'boolean',
    },
    {
      name: 'notify_on_escalation',
      label: translate('Notify on escalation'),
      type: 'boolean',
    },
    {
      name: 'notify_on_sla_warning',
      label: translate('Notify on SLA warning'),
      type: 'boolean',
    },
  ];

  const initialValues = useMemo(
    () =>
      isEdit
        ? {
            // Selects render with simpleValue, so seed the scalar value (not the
            // option object) or the control shows blank on edit.
            backend_type: helpdesk!.backend_type,
            notification_email: helpdesk!.notification_email,
            is_active: helpdesk!.is_active,
            notify_on_new_ticket: helpdesk!.notify_on_new_ticket,
            notify_on_comment: helpdesk!.notify_on_comment,
            notify_on_escalation: helpdesk!.notify_on_escalation,
            notify_on_sla_warning: helpdesk!.notify_on_sla_warning,
          }
        : {
            backend_type: BACKEND_OPTIONS[0].value,
            is_active: true,
            notify_on_new_ticket: true,
            notify_on_comment: true,
            notify_on_escalation: true,
            notify_on_sla_warning: true,
          },
    [isEdit, helpdesk],
  );

  return (
    <ResourceActionDialog
      dialogTitle={
        isEdit ? translate('Edit helpdesk') : translate('Create helpdesk')
      }
      formFields={fields}
      initialValues={initialValues}
      submitForm={handleSubmit}
    />
  );
};
