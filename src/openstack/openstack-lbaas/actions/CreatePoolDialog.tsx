import { FC } from 'react';
import { openstackPoolsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { PROTOCOL_OPTIONS } from '../constants';

export const CreatePoolDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const createMutation = useManagedMutation({
    mutationFn: (formData: any) =>
      openstackPoolsCreate({
        body: {
          name: formData.name,
          load_balancer: resource.url,
          protocol: formData.protocol,
        },
      }),
    successMessage: translate('Pool has been created.'),
    errorMessage: translate('Unable to create pool.'),
    invalidateQueries: [
      { queryKey: ['table', `loadbalancer-pools-${resource.uuid}`] },
    ],
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create pool')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Load balancer name')}
          name={resource.name}
        />
      }
      submitForm={async (values) => {
        try {
          await createMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      formFields={[
        createLatinNameField(),
        {
          name: 'protocol',
          label: translate('Protocol'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
      ]}
    />
  );
};
