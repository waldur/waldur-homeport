import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CreateCustomerCreditRequest,
  customerCreditsCreate,
  customerCreditsUpdate,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { CreditFormError } from './CreditFormError';
import { CustomerAllocateCreditField } from './CustomerAllocateCreditField';
import { CustomerCreditOfferingsField } from './CustomerCreditOfferingsField';
import { MinimalConsumptionFields } from './MinimalConsumptionFields';
import { OrganizationCostChart } from './OrganizationCostChart';
import { OrganizationSelectField } from './OrganizationSelectField';
import { CustomerCreditFormData } from './types';
import { getCreditInitialValues } from './utils';

interface CustomerCreditDialogProps {
  resolve: {
    credit?: any;
    refetch?(): void;
  };
}

export const CustomerCreditDialog: FC<CustomerCreditDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.credit);

  const initialValues = useMemo(() => {
    if (isEdit) {
      return {
        customer: {
          uuid: resolve.credit.customer_uuid,
          name: resolve.credit.customer_name,
          url: resolve.credit.customer,
        },
        offerings: resolve.credit.offerings,
        ...getCreditInitialValues(resolve.credit),
      };
    }
    return {};
  }, [resolve.credit, isEdit]);

  const submitMutation = useManagedMutation({
    mutationFn: (formData: CustomerCreditFormData) => {
      const body: CreateCustomerCreditRequest = {
        ...formData,
        customer: formData.customer.url,
        value: formData.value,
        offerings: formData.offerings
          ? formData.offerings.map((offering) => offering.url)
          : undefined,
      };
      return isEdit
        ? customerCreditsUpdate({
            path: { uuid: resolve.credit.uuid },
            body,
          })
        : customerCreditsCreate({ body });
    },
    successMessage: isEdit
      ? translate('Credit has been updated.')
      : translate('Credit has been created.'),
    errorMessage: isEdit
      ? translate('Unable to edit the credit')
      : translate('Unable to create a credit'),
    refetch: resolve.refetch,
  });

  return (
    <Form<CustomerCreditFormData>
      initialValues={initialValues}
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit credit')
                : translate('Add allocation credit')
            }
            subtitle={
              isEdit
                ? translate(
                    'Assign a credit limit for this organization and group of offerings.',
                  )
                : translate(
                    'Assign a credit limit within selected organization. Select the offerings that will use the allocated credits, ensuring the total does not exceed the available organizational credit.',
                  )
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={isEdit ? translate('Confirm') : translate('Create')}
                  className="btn btn-primary min-w-125px"
                  data-testid="submit-button"
                />
              </>
            }
          >
            <div className="size-lg">
              <OrganizationSelectField isDisabled={isEdit} />
              {isEdit && <OrganizationCostChart />}
              <CustomerCreditOfferingsField />
              <CustomerAllocateCreditField />
              <MinimalConsumptionFields initialValues={resolve.credit} />
              <CreditFormError />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
