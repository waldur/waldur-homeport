import { FC, useCallback } from 'react';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { updateCallState } from '../api';
import { Call } from '../types';
import { getCallStateActions } from '../utils';

interface CallActionsProps {
  call: Call;
  refetch?(): void;
  className?: string;
}

export const CallActions: FC<CallActionsProps> = ({
  call,
  refetch,
  className,
}) => {
  const dispatch = useDispatch();

  const editCallState = useCallback(
    async (state, label: string) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to {action} this call?', {
            action: label.toLowerCase(),
          }),
        );
        await updateCallState(state, call.uuid);
        dispatch(showSuccess(translate('Call state updated.')));
        refetch();
      } catch (er) {
        if (!er) return;
        dispatch(
          showErrorResponse(er, translate('Unable to update call state.')),
        );
      }
    },
    [dispatch, call, refetch],
  );

  const hasRounds = call.rounds.length > 0;

  return call.state === 'draft' ? (
    <DropdownButton
      variant="light"
      title={translate('Actions')}
      className={className}
    >
      {getCallStateActions()
        .filter((state) => state.value !== call.state)
        .map((state, i) => (
          <Dropdown.Item
            key={state.value}
            eventKey={i + 1}
            onClick={() => editCallState(state.action, state.label)}
          >
            {state.label}
          </Dropdown.Item>
        ))}
    </DropdownButton>
  ) : call.state === 'archived' ? (
    <Button
      variant="primary"
      onClick={() => editCallState('activate', translate('Activate'))}
      className={className}
      disabled={!hasRounds}
    >
      {translate('Activate')}
    </Button>
  ) : (
    <Button
      variant="primary"
      onClick={() => editCallState('archive', translate('Archive'))}
      className={className}
    >
      {translate('Archive')}
    </Button>
  );
};
