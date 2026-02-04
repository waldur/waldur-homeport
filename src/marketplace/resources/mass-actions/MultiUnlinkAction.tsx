import { LinkBreakIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesUnlink } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/marketplace/resources/actions/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiUnlinkAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          resource.state === 'Erred' &&
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.UNLINK,
          ),
      ),
    [rows],
  );

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate(
          'Are you sure you want to unlink {count} resources? Unlinking will only remove objects from the database, it will not trigger any cleanup',
          {
            count: permittedResources.length,
          },
        ),
      );
    } catch {
      return;
    }
    Promise.all(
      permittedResources.map((resource) =>
        marketplaceResourcesUnlink({ path: { uuid: resource.uuid } }),
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
      title={translate('Unlink')}
      action={callback}
      className="text-danger"
      staff
      iconNode={<LinkBreakIcon weight="bold" />}
      iconColor="danger"
      disabled={permittedResources.length !== rows.length}
    />
  );
};
