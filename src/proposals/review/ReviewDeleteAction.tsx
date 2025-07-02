import { TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { proposalReviewsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse } from '@waldur/store/notify';

export const ReviewDeleteAction = (props) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the review for proposal {proposal_name}?',
          { proposal_name: <strong>{props.row.proposal_name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    setRemoving(true);
    try {
      await proposalReviewsDestroy({ path: { uuid: props.row.uuid } });
      props.refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove review.')));
    } finally {
      setRemoving(false);
    }
  }, [dispatch, setRemoving, props]);

  return (
    <ActionItem
      title={translate('Remove')}
      className="text-danger"
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      disabled={removing}
    />
  );
};
