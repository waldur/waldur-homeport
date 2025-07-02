import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  openstackRoutersAddRouterInterface,
  openstackPortsList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

const selector = formValueSelector(RESOURCE_ACTION_FORM);
const typeSelector = (state: RootState): string => selector(state, 'type');

const typeChoices = [
  { value: 'subnet', label: translate('Subnet') },
  { value: 'port', label: translate('Port') },
];

export const AddRouterInterfaceDialog = ({ resolve: { router } }) => {
  const dispatch = useDispatch();
  const type = useSelector(typeSelector);

  const query = useQuery({
    queryKey: ['AddRouterInterface', router.tenant_uuid],

    queryFn: async () => {
      const subnets = (
        await openstackSubnetsList({
          query: { tenant_uuid: router.tenant_uuid },
        })
      ).data;
      const ports = (
        await openstackPortsList({
          query: {
            tenant_uuid: router.tenant_uuid,
            has_device_owner: false,
            exclude_subnet_uuids: (router?.ports || [])
              .map((port) => port.subnet_uuid)
              .join(','),
          },
        })
      ).data;
      return { subnets, ports };
    },
  });

  const fields = useMemo(
    () =>
      query.data
        ? [
            {
              name: 'type',
              label: translate('Type'),
              type: 'radio',
              required: true,
              choices: typeChoices,
              direction: 'horizontal',
            },
            {
              name: 'resource',
              label:
                type === 'subnet'
                  ? translate('Select subnet')
                  : translate('Select existing port'),
              type: 'select',
              required: true,
              options:
                type === 'subnet'
                  ? query.data.subnets.map((subnet) => ({
                      value: subnet.url,
                      label: `${subnet.name} (${subnet.cidr})`,
                    }))
                  : query.data.ports.map((port) => {
                      const ips = port.fixed_ips?.length
                        ? port.fixed_ips.map((fip) => fip.ip_address).join(', ')
                        : '—';
                      const mac = port.mac_address || '—';
                      const nameOrUuid = port.name || port.uuid;
                      return {
                        value: port.url,
                        label: `${ips} (${mac}) / ${nameOrUuid}`.trim(),
                      };
                    }),
            },
          ]
        : [],
    [type, query.data],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add router interface')}
      formFields={fields}
      loading={query.isLoading}
      error={query.error}
      initialValues={{ type: typeChoices[0].value, resource: '' }}
      submitForm={async (formData) => {
        try {
          const body =
            formData.type === 'subnet'
              ? { subnet: formData.resource }
              : { port: formData.resource };
          await openstackRoutersAddRouterInterface({
            path: { uuid: router.uuid },
            body,
          });
          dispatch(showSuccess(translate('Router interface was added.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to add router interface.')),
          );
        }
      }}
    />
  );
};
