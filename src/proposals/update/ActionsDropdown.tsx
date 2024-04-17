import { FC, useCallback } from 'react';
import { DropdownButton, SplitButton, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { updateCallState } from '../api';
import { Call } from '../types';
import { getCallStateActions } from '../utils';

interface ActionsDropdownProps {
  call: Call;
  refetch?(): void;
  className?: string;
}

export const ActionsDropdown: FC<ActionsDropdownProps> = ({
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

  return call.state === 'active' ? (
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
  ) : (
    <SplitButton
      variant="primary"
      title={translate('Activate')}
      onClick={() => editCallState('activate', translate('Activate'))}
      className={className}
      disabled={!hasRounds}
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
    </SplitButton>
  );
};
