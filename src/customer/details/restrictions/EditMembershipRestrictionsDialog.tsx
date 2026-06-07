import { FC } from 'react';
import { Form } from 'react-final-form';
import { customersPartialUpdate } from 'waldur-js-client';

import { fieldConfig, RestrictionField } from '@/core/restrictions';
import { SubmitButton, CommaSeparatedListGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useSetCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { getInitialValues } from './EditMembershipRestrictionsDialog.helpers';

interface FormData {
  value: string[] | string;
}

interface EditMembershipRestrictionsDialogProps {
  resolve: {
    customer: Customer;
    field: RestrictionField;
  };
}

export const EditMembershipRestrictionsDialog: FC<
  EditMembershipRestrictionsDialogProps
> = ({ resolve }) => {
  const setCurrentCustomer = useSetCustomer();
  const { closeDialog } = useModal();

  const { field } = resolve;
  const config = fieldConfig[field];

  const { mutate, isPending } = useManagedMutation<Customer, any, FormData>({
    mutationFn: (values) => {
      // Ensure value is always an array (defensive check)
      let arrayValue: string[];
      if (Array.isArray(values.value)) {
        arrayValue = values.value.filter(Boolean);
      } else if (typeof values.value === 'string') {
        arrayValue = (values.value as string)
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        arrayValue = [];
      }

      return customersPartialUpdate({
        path: { uuid: resolve.customer.uuid },
        body: {
          [field]: arrayValue,
        },
      }).then((response) => response.data);
    },
    successMessage: translate('Membership restrictions updated successfully.'),
    errorMessage: translate('Failed to update membership restrictions.'),
    onSuccess: (customer) => {
      setCurrentCustomer(customer);
    },
  });

  return (
    <Form<FormData>
      onSubmit={mutate}
      initialValues={getInitialValues(resolve.customer, field)}
      render={({ handleSubmit, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={config.title}
            footer={
              <>
                <button
                  type="button"
                  className="btn btn-secondary flex-equal"
                  onClick={() => closeDialog()}
                >
                  {translate('Cancel')}
                </button>
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={isPending}
                  label={translate('Save')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <div className="size-sm">
              <CommaSeparatedListGroup
                name="value"
                label={config.label}
                placeholder={config.placeholder}
                description={config.description}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
