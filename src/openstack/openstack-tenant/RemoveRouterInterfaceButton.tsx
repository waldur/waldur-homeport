import {
  OpenStackRouter,
  openstackRoutersRemoveRouterInterface,
} from 'waldur-js-client';

import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';

const BodyComponent = (router, setOption) => {
  return (
    <div>
      <p>{translate('Please select the port that you want to remove.')}</p>
      <Select
        required={true}
        options={router.ports.map((port) => {
          const ips = port.fixed_ips?.length
            ? port.fixed_ips.map((fip) => fip.ip_address).join(', ')
            : '—';
          const mac = renderFieldOrDash(port.mac_address);
          const subnet = renderFieldOrDash(port.subnet_name);
          return {
            value: port.url,
            label: `${ips} (${mac}) / ${subnet}`.trim(),
          };
        })}
        onChange={setOption}
      />
    </div>
  );
};

export const RemoveRouterInterfaceButton: ActionItemType<OpenStackRouter> = ({
  resource,
}) => {
  const { confirm } = useModal();
  const { showInfo } = useNotify();

  const { mutate, isPending = false } = useManagedMutation<any, any, any>({
    mutationFn: (port) =>
      openstackRoutersRemoveRouterInterface({
        path: { uuid: resource.uuid },
        body: { port: port.value },
      }),
    successMessage: translate('Router interface was removed.'),
    errorMessage: translate('Unable to remove router interface.'),
  });

  const removeInterface = async () => {
    let port = null;
    try {
      await confirm(
        translate('Remove router interface'),
        BodyComponent(resource, (value) => {
          port = value;
        }),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    if (!port) {
      showInfo(translate('Please select a port to remove.'));
      return;
    }
    mutate(port);
  };
  return (
    <RemovalActionItem
      title={translate('Remove router interface')}
      action={removeInterface}
      disabled={isPending}
    />
  );
};
