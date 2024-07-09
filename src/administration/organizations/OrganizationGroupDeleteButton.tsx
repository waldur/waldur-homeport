import { Trash } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { removeOrganizationGroup } from './api';

interface OrganizationGroupDeleteButtonProps {
  row: OrganizationGroup;
  refetch;
}

export const OrganizationGroupDeleteButton = (
  props: OrganizationGroupDeleteButtonProps,
) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {name} organization group?',
          { name: <strong>{props.row.name}</strong> },
          formatJsxTemplate,
        ),
      );
      setRemoving(true);
      await removeOrganizationGroup(props.row.uuid);
      props.refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to remove organization group.'),
        ),
      );
    }
    setRemoving(false);
  }, [dispatch, setRemoving, props]);
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="danger"
      iconNode={<Trash />}
      pending={removing}
      size="sm"
    />
  );
};
