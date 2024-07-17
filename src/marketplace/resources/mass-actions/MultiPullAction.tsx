import { GitPullRequest } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { pullInstance, pullTenant, pullVolume } from '@waldur/openstack/api';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const apiMethods = {
  [INSTANCE_TYPE]: pullInstance,
  [VOLUME_TYPE]: pullVolume,
  [TENANT_TYPE]: pullTenant,
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
        ['OK', 'Erred'].includes(resource.backend_metadata.state),
      ),
    [resources],
  );
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to pull {count} resources?', {
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
      title={translate('Pull')}
      action={callback}
      disabled={validResources.length !== rows.length}
      iconNode={<GitPullRequest />}
    />
  );
};
