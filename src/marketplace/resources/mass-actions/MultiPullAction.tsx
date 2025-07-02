import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  openstackInstancesPull,
  openstackTenantsPull,
  openstackVolumesPull,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const apiMethods = {
  [INSTANCE_TYPE]: (uuid: string) => openstackInstancesPull({ path: { uuid } }),
  [VOLUME_TYPE]: (uuid: string) => openstackVolumesPull({ path: { uuid } }),
  [TENANT_TYPE]: (uuid: string) => openstackTenantsPull({ path: { uuid } }),
};

export const MultiPullAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const resources = useMemo(
    () =>
      rows.filter((resource) =>
        [INSTANCE_TYPE, VOLUME_TYPE, TENANT_TYPE].includes(
          resource.resource_type,
        ),
      ),
    [rows],
  );
  const validResources = useMemo(
    () =>
      resources.filter((resource) =>
        ['OK', 'ERRED'].includes(resource.backend_metadata.state),
      ),
    [resources],
  );
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to synchronise {count} resources?', {
          count: validResources.length,
        }),
      );
    } catch {
      return;
    }

    Promise.all(
      validResources.map((resource) => {
        apiMethods[resource.resource_type](resource.resource_uuid);
      }),
    ).then(() => {
      refetch();
    });
  }, [dispatch, validResources, refetch]);

  if (validResources.length === 0) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Synchronise')}
      action={callback}
      disabled={validResources.length !== rows.length}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
