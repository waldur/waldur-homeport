import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

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
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} category group?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    setRemoving(true);
    removeCategoryGroup(props.row.uuid)
      .then(() => {
        props.refetch();
      })
      .catch((e) => {
        dispatch(
          showErrorResponse(e, translate('Unable to remove category group.')),
        );
        setRemoving(false);
      });
  }, [dispatch, setRemoving, props]);

  return (
    <ActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="danger"
      icon={removing ? 'fa fa-spinner fa-spin' : 'fa fa-trash'}
      disabled={removing}
    />
  );
};
