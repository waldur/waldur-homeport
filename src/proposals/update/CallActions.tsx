import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  proposalProtectedCallsActivate,
  proposalProtectedCallsArchive,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

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
  const { confirm } = useModal();

  const { showErrorResponse, showSuccess } = useNotify();

  const hasRounds = call.rounds.length > 0;

  const editCallState = useCallback(
    async (state, label: string) => {
      try {
        await confirm(
          translate('Confirmation'),
          translate('Are you sure you want to {action} this call?', {
            action: label.toLowerCase(),
          }),
        );
        if (state === 'activate') {
          proposalProtectedCallsActivate({ path: { uuid: call.uuid } });
        } else if (state === 'archive') {
          proposalProtectedCallsArchive({ path: { uuid: call.uuid } });
        }
        showSuccess(translate('Call state updated.'));
        refetch();
      } catch (er) {
        if (!er) return;
        showErrorResponse(er, translate('Unable to update call state.'));
      }
    },
    [call, refetch],
  );

  const tooltipMessage = !hasRounds
    ? translate('Call must have a round to be activated')
    : null;

  if (call.state === 'draft') {
    return (
      <ActionDropdownButton title={translate('Actions')} className={className}>
        {getCallStateActions()
          .filter((state) => state.value !== call.state)
          .map((state, i) => {
            const isDisabled = state.action === 'activate' && !hasRounds;

            return (
              <Tip
                key={state.value}
                label={state.action === 'activate' ? tooltipMessage : null}
                id={`tooltip-${state.value}`}
                placement="top"
              >
                <Dropdown.Item
                  eventKey={i + 1}
                  onClick={() => editCallState(state.action, state.label)}
                  disabled={isDisabled}
                >
                  {state.label}
                </Dropdown.Item>
              </Tip>
            );
          })}
      </ActionDropdownButton>
    );
  }

  if (call.state === 'archived') {
    return (
      <ActionButton
        title={translate('Activate')}
        variant="primary"
        action={() => editCallState('activate', translate('Activate'))}
        className={className}
        disabled={!hasRounds}
        disabledReason={translate('Call must have a round to be activated')}
      />
    );
  }

  return (
    <ActionButton
      title={translate('Archive')}
      variant="primary"
      action={() => editCallState('archive', translate('Archive'))}
      className={className}
    />
  );
};
