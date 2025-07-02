import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  OpenStackRouter,
  openstackRoutersRemoveRouterInterface,
} from 'waldur-js-client';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { showErrorResponse, showInfo, showSuccess } from '@waldur/store/notify';

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
          const mac = port.mac_address || '—';
          const subnet = port.subnet_name || '—';
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
  const dispatch = useDispatch();

  const removeInterface = async () => {
    let port = null;
    try {
      await waitForConfirmation(
        dispatch,
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
      dispatch(showInfo(translate('Please select a port to remove.')));
      return;
    }

    try {
      await openstackRoutersRemoveRouterInterface({
        path: { uuid: resource.uuid },
        body: { port: port.value },
      });
      dispatch(showSuccess(translate('Router interface was removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to remove router interface.')),
      );
    }
  };
  return (
    <ActionItem
      title={translate('Remove router interface')}
      action={removeInterface}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
