import { TrashIcon } from '@phosphor-icons/react';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AccessSubnet, accessSubnetsDestroy } from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
        { forDeletion: true },
      );
    } catch {
      return;
    }
    setRemoving(true);
    try {
      await accessSubnetsDestroy({ path: { uuid: props.row.uuid } });
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
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      disabled={removing}
      iconNode={<TrashIcon />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
