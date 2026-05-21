import { useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { projectCreditsPartialUpdate } from 'waldur-js-client';

import { MinimalConsumptionFields } from '@/customer/credits/MinimalConsumptionFields';
import { ProjectAllocateCreditField } from '@/customer/credits/ProjectAllocateCreditField';
import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditProjectCreditProps } from '../types';

export const EditCreditFieldDialog: FC<{
  resolve: EditProjectCreditProps;
}> = ({ resolve }) => {
  const queryClient = useQueryClient();

  const initialValues = useMemo(
    () => pick(resolve.credit, resolve.name),
    [resolve.credit, resolve.name],
  );

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      projectCreditsPartialUpdate({
        path: { uuid: resolve.credit.uuid },
        body: {
          [resolve.name]: formData[resolve.name],
        },
      }),
    successMessage: translate('Project credit has been updated.'),
    errorMessage: translate('Project credit could not be updated.'),
    onSuccess: (credit) => {
      queryClient.setQueryData(
        ['ProjectCreditData', resolve.credit.project_uuid],
        credit.data,
      );
    },
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormContainer submitting={submitting}>
              {resolve.name === 'value' ? (
                <ProjectAllocateCreditField
                  organizationCredit={resolve.credit.customer_credit}
                  isEdit={true}
                />
              ) : (
                <MinimalConsumptionFields
                  initialValues={initialValues}
                  filterField={resolve.name}
                />
              )}
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
