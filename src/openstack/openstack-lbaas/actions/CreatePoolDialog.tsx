import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackPoolsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { fetchListStart } from '@/table/actions';

import { PROTOCOL_OPTIONS } from '../constants';

export const CreatePoolDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

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
    onSuccess: () => {
      dispatch(
        fetchListStart(`loadbalancer-pools-${resource.uuid}`, undefined, true),
      );
    },
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create pool')}
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
