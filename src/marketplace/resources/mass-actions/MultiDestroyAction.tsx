import { Trash } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { terminateResource } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MultiDestroyAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const validResources = useMemo(
    () => rows.filter((resource) => ['OK', 'Erred'].includes(resource.state)),
    [rows],
  );
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to destroy {count} resources?', {
          count: validResources.length,
        }),
      );
    } catch {
      return;
    }

    Promise.all(
      validResources.map((resource) => terminateResource(resource.uuid)),
    ).then(() => {
      refetch();
    });
  }, [dispatch, validResources, refetch]);

  return (
    <ActionItem
      title={translate('Destroy')}
      action={callback}
      disabled={validResources.length !== rows.length}
      iconNode={<Trash />}
      className="text-danger"
    />
  );
};
