import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { closeModalDialog } from '@waldur/modal/actions';
import { createCallRound } from '@waldur/proposals/api';
import { CallRoundFormData, ProposalCall } from '@waldur/proposals/types';

import { CallRoundCreateForm } from './CallRoundCreateForm';

interface CallRoundCreateDialogProps {
  resolve: {
    call: ProposalCall;
    refetch(): void;
  };
}

export const CallRoundCreateDialog: FC<CallRoundCreateDialogProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const createRound = useCallback(
    (formData: CallRoundFormData, _dispatch, formProps) => {
      return createCallRound(props.resolve.call.uuid, formData).then(() => {
        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
      });
    },
    [dispatch, props.resolve],
  );
  return (
    <CallRoundCreateForm
      onSubmit={createRound}
      initialValues={{ timezone: DateTime.local().zoneName }}
    />
  );
};
