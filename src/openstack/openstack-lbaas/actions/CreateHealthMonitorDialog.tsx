import { FC } from 'react';
import { OpenStackPool, openstackHealthMonitorsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { PROTOCOL_OPTIONS } from '../constants';

export const CreateHealthMonitorDialog: FC<
  ActionDialogProps<OpenStackPool>
> = ({ resolve: { resource, refetch } }) => {
  const createMutation = useManagedMutation({
    mutationFn: (formData: any) =>
      openstackHealthMonitorsCreate({
        body: {
          pool: resource.url,
          // Create only: an empty field leaves the serializer default in place
          // (blank name, delay 5, timeout 5, max_retries 3).
          // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default applies
          name: formData.name || undefined,
          type: formData.type,
          // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default applies
          delay: formData.delay ? Number(formData.delay) : undefined,
          // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default applies
          timeout: formData.timeout ? Number(formData.timeout) : undefined,
          // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default applies
          max_retries: formData.max_retries
            ? Number(formData.max_retries)
            : undefined,
        },
      }),
    successMessage: translate('Health monitor has been created.'),
    errorMessage: translate('Unable to create health monitor.'),
    invalidateQueries: [
      { queryKey: ['table', `pool-healthmonitors-${resource.uuid}`] },
    ],
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add health monitor')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Pool name')} name={resource.name} />
      }
      submitForm={async (values) => {
        try {
          await createMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      formFields={[
        { ...createLatinNameField(), required: false },
        {
          name: 'type',
          label: translate('Type'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
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
    />
  );
};
