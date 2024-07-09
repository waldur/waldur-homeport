import { Trash } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

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
