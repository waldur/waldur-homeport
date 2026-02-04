import { CloudXIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderResourcesSetAsErred } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/marketplace/resources/actions/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiSetErredAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.SET_AS_ERRED,
          ),
      ),
    [rows],
  );

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to set {count} resources to erred?', {
          count: permittedResources.length,
        }),
      );
    } catch {
      return;
    }
    Promise.all(
      permittedResources.map((resource) =>
        marketplaceProviderResourcesSetAsErred({
          path: { uuid: resource.uuid },
        }),
      ),
    ).then(() => {
      refetch();
    });
  }, [dispatch, permittedResources, refetch]);

  if (permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Set erred')}
      action={callback}
      className="text-danger"
      iconNode={<CloudXIcon weight="bold" />}
      iconColor="danger"
      staff
      disabled={permittedResources.length !== rows.length}
    />
  );
};
