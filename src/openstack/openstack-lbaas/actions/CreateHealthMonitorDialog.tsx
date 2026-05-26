import { FC } from 'react';
import { OpenStackPool, openstackHealthMonitorsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
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
          name: formData.name || undefined,
          type: formData.type,
          delay: formData.delay ? Number(formData.delay) : undefined,
          timeout: formData.timeout ? Number(formData.timeout) : undefined,
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
