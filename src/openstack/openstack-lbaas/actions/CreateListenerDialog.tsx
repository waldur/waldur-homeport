import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackListenersCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { fetchListStart } from '@/table/actions';

import { PROTOCOL_OPTIONS } from '../constants';
import { poolAutocomplete } from '../poolAutocomplete';

const getPoolUrl = (pool: any): string | null => {
  if (!pool) return null;
  if (typeof pool === 'object' && pool.uuid) {
    return `${ENV.apiEndpoint}api/openstack-pools/${pool.uuid}/`;
  }
  return pool;
};

export const CreateListenerDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const createMutation = useManagedMutation({
    mutationFn: (formData: any) =>
      openstackListenersCreate({
        body: {
          name: formData.name || undefined,
          load_balancer: resource.url,
          protocol: formData.protocol,
          protocol_port: Number(formData.protocol_port),
          default_pool: getPoolUrl(formData.default_pool),
        },
      }),
    successMessage: translate('Listener has been created.'),
    errorMessage: translate('Unable to create listener.'),
    onSuccess: () => {
      dispatch(
        fetchListStart(
          `loadbalancer-listeners-${resource.uuid}`,
          undefined,
          true,
        ),
      );
    },
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create listener')}
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
          name: 'protocol',
          label: translate('Protocol'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
        {
          name: 'protocol_port',
          label: translate('Port'),
          type: 'integer',
          minValue: 1,
          maxValue: 65535,
          required: true,
        },
        {
          name: 'default_pool',
          label: translate('Default pool'),
          type: 'async_select',
          placeholder: translate('Select pool...'),
          loadOptions: poolAutocomplete(resource.uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) => option.name,
          noOptionsMessage: () => translate('No pools'),
          isClearable: true,
          required: false,
        },
      ]}
    />
  );
};
