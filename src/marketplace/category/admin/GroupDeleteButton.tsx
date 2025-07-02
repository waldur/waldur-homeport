import { TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceCategoryGroupsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse } from '@waldur/store/notify';

interface GroupDeleteButtonProps {
  row: CategoryGroup;
  refetch;
}

export const GroupDeleteButton = (props: GroupDeleteButtonProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} category group?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await marketplaceCategoryGroupsDestroy({
        path: { uuid: props.row.uuid },
      });
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to remove category group.')),
      );
      setRemoving(false);
    }
  }, [dispatch, setRemoving, props]);

  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      disabled={removing}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
