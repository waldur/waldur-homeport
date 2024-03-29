import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { removeCategory } from './api';

interface CategoryDeleteButtonProps {
  row: Category;
  refetch;
}

export const CategoryDeleteButton = (props: CategoryDeleteButtonProps) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {title} category?',
          { title: <strong>{props.row.title}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    setRemoving(true);
    removeCategory(props.row.uuid)
      .then(() => {
        props.refetch();
      })
      .catch((e) => {
        dispatch(showErrorResponse(e, translate('Unable to remove category.')));
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
