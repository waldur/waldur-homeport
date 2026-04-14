import { XIcon, ShieldIcon, UserMinusIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ConflictOfInterest,
  conflictsOfInterestDismiss,
  conflictsOfInterestRecuse,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

const WaiveCOIDialog = lazyComponent(() =>
  import('./WaiveCOIDialog').then((module) => ({
    default: module.WaiveCOIDialog,
  })),
);

interface COIRowActionsProps {
  row: ConflictOfInterest;
  fetch: () => void;
}

export const COIRowActions: FC<COIRowActionsProps> = ({ row, fetch }) => {
  const dispatch = useDispatch();
  const [isDismissing, setIsDismissing] = useState(false);
  const [isRecusing, setIsRecusing] = useState(false);

  const handleDismiss = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Dismiss conflict of interest'),
        <div>
          <p>
            {translate(
              'You are about to dismiss this detected conflict of interest.',
            )}
          </p>
          <div className="bg-light-success rounded p-3 mb-3">
            <strong className="d-block mb-2">
              {translate('What happens next:')}
            </strong>
            <ul className="mb-0 ps-3">
              <li>
                {translate(
                  'The conflict will be marked as a false positive and removed from active review.',
                )}
              </li>
              <li>
                {translate(
                  'The reviewer can continue reviewing this proposal without restrictions.',
                )}
              </li>
              <li>
                {translate('This decision will be logged for audit purposes.')}
              </li>
            </ul>
          </div>
          <div className="text-muted small">
            <strong>{translate('Reviewer')}:</strong> {row.reviewer_name}
            <br />
            <strong>{translate('Proposal')}:</strong> {row.proposal_name}
            <br />
            <strong>{translate('Conflict type')}:</strong>{' '}
            {row.coi_type_display}
          </div>
        </div>,
        {
          positiveButton: translate('Dismiss conflict'),
          positiveButtonVariant: 'success',
          type: 'success',
        },
      );
    } catch {
      return; // User cancelled
    }

    setIsDismissing(true);
    try {
      await conflictsOfInterestDismiss({
        path: { uuid: row.uuid },
        body: { status: 'dismissed' },
      });
      dispatch(showSuccess(translate('Conflict of interest dismissed.')));
      fetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Failed to dismiss conflict.')),
      );
    } finally {
      setIsDismissing(false);
    }
  }, [row, dispatch, fetch]);

  const handleRecuse = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Recuse reviewer'),
        <div>
          <p>
            {translate(
              'You are about to remove this reviewer from reviewing the proposal.',
            )}
          </p>
          <div className="bg-light-danger rounded p-3 mb-3">
            <strong className="d-block mb-2">
              {translate('What happens next:')}
            </strong>
            <ul className="mb-0 ps-3">
              <li>
                {translate(
                  'The reviewer will be permanently removed from this proposal.',
                )}
              </li>
              <li>
                {translate(
                  'Any existing review or scores from this reviewer will be discarded.',
                )}
              </li>
              <li>
                {translate(
                  'You may need to assign a replacement reviewer to maintain review coverage.',
                )}
              </li>
            </ul>
          </div>
          <div className="text-muted small">
            <strong>{translate('Reviewer')}:</strong> {row.reviewer_name}
            <br />
            <strong>{translate('Proposal')}:</strong> {row.proposal_name}
            <br />
            <strong>{translate('Conflict type')}:</strong>{' '}
            {row.coi_type_display}
          </div>
        </div>,
        {
          positiveButton: translate('Recuse reviewer'),
          positiveButtonVariant: 'danger',
          type: 'danger',
        },
      );
    } catch {
      return; // User cancelled
    }

    setIsRecusing(true);
    try {
      await conflictsOfInterestRecuse({
        path: { uuid: row.uuid },
        body: { status: 'recused' },
      });
      dispatch(showSuccess(translate('Reviewer recused from proposal.')));
      fetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Failed to recuse reviewer.')),
      );
    } finally {
      setIsRecusing(false);
    }
  }, [row, dispatch, fetch]);

  const handleWaive = useCallback(() => {
    dispatch(
      openModalDialog(WaiveCOIDialog, {
        resolve: { coi: row, fetch },
        size: 'lg',
      }),
    );
  }, [row, fetch, dispatch]);

  // Don't show actions if already reviewed (not pending)
  if (row.status !== 'pending') {
    return null;
  }

  const isLoading = isDismissing || isRecusing;

  return (
    <ActionsDropdownComponent title={translate('Actions')}>
      <ActionItem
        title={isDismissing ? translate('Dismissing...') : translate('Dismiss')}
        action={handleDismiss}
        iconNode={<XIcon weight="bold" />}
        disabled={isLoading}
      />
      <ActionItem
        title={translate('Waive')}
        action={handleWaive}
        iconNode={<ShieldIcon weight="bold" />}
        iconColor="warning"
        className="text-warning"
        disabled={isLoading}
      />
      <ActionItem
        title={isRecusing ? translate('Recusing...') : translate('Recuse')}
        action={handleRecuse}
        iconNode={<UserMinusIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
        disabled={isLoading}
      />
    </ActionsDropdownComponent>
  );
};
