import { TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OrganizationGroup, organizationGroupsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse } from '@waldur/store/notify';

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
        { forDeletion: true },
      );
      setRemoving(true);
      await organizationGroupsDestroy({ path: { uuid: props.row.uuid } });
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
