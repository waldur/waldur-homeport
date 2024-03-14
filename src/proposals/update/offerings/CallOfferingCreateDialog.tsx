import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createCallOffering } from '@waldur/proposals/api';
import { CallOfferingFormData, ProposalCall } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { CallOfferingCreateForm } from './CallOfferingCreateForm';

interface CallOfferingCreateDialogProps {
  resolve: {
    call: ProposalCall;
    refetch(): void;
  };
}

export const CallOfferingCreateDialog: FC<CallOfferingCreateDialogProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const createRound = useCallback(
    (formData: CallOfferingFormData, _dispatch, formProps) => {
      const updated_plan_url = fixURL(
        `/marketplace-plans/${formData.plan.uuid}/`,
      );
      const payload = {
        offering: formData.offering.url,
        description: formData.description,
        plan: updated_plan_url,
        attributes: formData.limits
          ? {
              limits: formData.limits,
            }
          : {},
      };
      return createCallOffering(props.resolve.call.uuid, payload)
        .then(() => {
          dispatch(
            showSuccess(translate('Offering request has been submitted.')),
          );
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [dispatch, props.resolve],
  );
  return (
    <CallOfferingCreateForm
      onSubmit={createRound}
      data={{ call: props.resolve.call }}
    />
  );
};
