import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { createOfferingUsagePolicy } from '@waldur/customer/cost-policies/api';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

import { OFFERING_POLICY_FORM } from './PolicyCreateDialog';
import { OfferingUsagePolicyFormData } from './types';

const PolicyCreateDialog = lazyComponent(
  () => import('./PolicyCreateDialog'),
  'PolicyCreateDialog',
);

interface UsagePolicyCreateButtonProps {
  offering: Offering;
  refetch(): void;
}

export const UsagePolicyCreateButton = ({
  offering,
  refetch,
}: UsagePolicyCreateButtonProps) => {
  const dispatch = useDispatch();
  const openPolicyCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(PolicyCreateDialog, {
          size: 'lg',
          formId: OFFERING_POLICY_FORM,
          onSubmit: (formData: OfferingUsagePolicyFormData) => {
            return createOfferingUsagePolicy(formData)
              .then(() => {
                dispatch(closeModalDialog());
                refetch();
              })
              .catch((e) => {
                dispatch(
                  showErrorResponse(e, translate('Unable to create policy.')),
                );
                if (e.response && e.response.status === 400) {
                  throw new SubmissionError(e.response.data);
                }
              });
          },
          initialValues: {
            scope: offering.url,
            period: policyPeriodOptions.oneMonth.value,
            component_limits_set: [{}],
          },
          type: 'usage',
          offering: offering,
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
