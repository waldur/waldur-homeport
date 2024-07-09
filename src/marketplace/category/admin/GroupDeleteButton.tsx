import { Trash } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { removeCategoryGroup } from './api';

interface GroupDeleteButtonProps {
  row: CategoryGroup;
  refetch;
}

export const GroupDeleteButton = (props: GroupDeleteButtonProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      const confirmed = await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} category group?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
      );

      if (!confirmed) return;

      setRemoving(true);
      await removeCategoryGroup(props.row.uuid);
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to remove category group.')),
      );
      setRemoving(false);
    }
  }, [dispatch, setRemoving, props]);

  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      iconNode={<Trash />}
      pending={removing}
      size="sm"
    />
  );
};
