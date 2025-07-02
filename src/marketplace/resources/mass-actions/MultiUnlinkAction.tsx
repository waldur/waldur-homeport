import { LinkBreakIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesUnlink } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiUnlinkAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate(
          'Are you sure you want to unlink {count} resources? Unlinking will only remove objects from the database, it will not trigger any cleanup',
          {
            count: rows.length,
          },
        ),
      );
    } catch {
      return;
    }
    Promise.all(
      rows.map((resource) =>
        marketplaceResourcesUnlink({ path: { uuid: resource.uuid } }),
      ),
    ).then(() => {
      refetch();
    });
  }, [dispatch, rows, refetch]);
  return (
    <ActionItem
      title={translate('Unlink')}
      action={callback}
      className="text-danger"
      staff
      iconNode={<LinkBreakIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
