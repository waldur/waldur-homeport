import { pick } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { customerCreditsPartialUpdate } from 'waldur-js-client';

import { FormContainerFinal, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditCustomerCreditProps } from '../details/types';

import { CustomerAllocateCreditField } from './CustomerAllocateCreditField';
import { CustomerCreditOfferingsField } from './CustomerCreditOfferingsField';
import { MinimalConsumptionFields } from './MinimalConsumptionFields';

export const EditCreditFieldDialog: FC<{
  resolve: EditCustomerCreditProps;
}> = ({ resolve }) => {
  const initialValues = useMemo(
    () => pick(resolve.credit, resolve.name),
    [resolve.credit, resolve.name],
  );

  const submitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      customerCreditsPartialUpdate({
        path: { uuid: resolve.credit.uuid },
        body: {
          [resolve.name]:
            resolve.name === 'offerings'
              ? formData.offerings.map((offering) => offering.url)
              : formData[resolve.name],
        },
      }),
    successMessage: translate('Organization credit has been updated.'),
    errorMessage: translate('Organization credit could not be updated.'),
    invalidateQueries: [
      {
        queryKey: ['CustomerCreditData', resolve.credit.customer_uuid],
      },
    ],
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => submitMutation.mutateAsync(values)}
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
            <FormContainerFinal submitting={submitting}>
              {resolve.name === 'offerings' ? (
                <CustomerCreditOfferingsField />
              ) : resolve.name === 'value' ? (
                <CustomerAllocateCreditField />
              ) : (
                <MinimalConsumptionFields
                  initialValues={initialValues}
                  filterField={resolve.name}
                />
              )}
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
