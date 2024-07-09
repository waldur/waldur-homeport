import { Trash } from '@phosphor-icons/react';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { removeAccessSubnet } from './api';
import { AccessSubnet } from './types';

interface AccessSubnetDeleteButtonProps {
  row: AccessSubnet;
  refetch;
}

export const AccessSubnetDeleteButton = (
  props: AccessSubnetDeleteButtonProps,
) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {inet} access subnet?',
          { inet: <strong>{props.row.inet}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    setRemoving(true);
    try {
      await removeAccessSubnet(props.row.uuid);
      props.refetch();
      dispatch(showSuccess(translate('Access subnet has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to remove access subnet.')),
      );
      setRemoving(false);
    }
  }, [dispatch, props]);

  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      pending={removing}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
