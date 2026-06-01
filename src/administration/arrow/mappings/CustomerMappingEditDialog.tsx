import { useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  type ArrowCustomerMapping,
  adminArrowCustomerMappingsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, BooleanGroup, StringGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import { arrowQueryKeys } from '../api';

interface CustomerMappingEditDialogProps {
  resolve: {
    mapping: ArrowCustomerMapping;
    refetch: () => void;
  };
}

interface FormValues {
  arrow_reference: string;
  arrow_company_name?: string;
  waldur_customer: { uuid: string; name: string };
  is_active: boolean;
}

export const CustomerMappingEditDialog = ({
  resolve,
}: CustomerMappingEditDialogProps) => {
  const { closeDialog } = useModal();
  const { mapping, refetch } = resolve;

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid'],
        o: 'name',
      }),
    [],
  );

  const submitMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      adminArrowCustomerMappingsPartialUpdate({
        path: { uuid: mapping.uuid },
        body: {
          arrow_reference: values.arrow_reference,
          arrow_company_name: values.arrow_company_name,
          waldur_customer: values.waldur_customer.uuid,
          is_active: values.is_active,
        },
      }),

    successMessage: translate('Customer mapping updated'),
    refetch,

    invalidateQueries: [
      {
        queryKey: arrowQueryKeys.customerMappings(),
      },
    ],
  });

  const mutationError = submitMutation.error
    ? submitMutation.error.response?.data?.detail ||
      submitMutation.error.message ||
      translate('Failed to update mapping')
    : null;

  return (
    <ModalDialog title={translate('Edit Customer Mapping')}>
      <Form<FormValues>
        onSubmit={(values) =>
          submitMutation.mutateAsync(values).catch(() => {
            // Error is handled by useManagedMutation and displayed in the dialog
          })
        }
        initialValues={{
          arrow_reference: mapping.arrow_reference,
          arrow_company_name: mapping.arrow_company_name,
          waldur_customer: {
            uuid: mapping.waldur_customer_uuid,
            name: mapping.waldur_customer_name,
          },
          is_active: mapping.is_active,
        }}
        render={({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <StringGroup
              name="arrow_reference"
              validate={required}
              label={translate('Arrow Reference')}
              description={translate(
                'The Arrow customer reference (e.g., XSP123456)',
              )}
              required
            />

            <StringGroup
              name="arrow_company_name"
              label={translate('Arrow Company Name')}
              description={translate('Optional company name for display')}
            />

            <AsyncSelectGroup
              name="waldur_customer"
              label={translate('Waldur Organization')}
              description={translate(
                'The Waldur organization to map this Arrow customer to',
              )}
              required
              validate={required}
              placeholder={translate('Select organization...')}
              loadOptions={loadOrganizations}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              noOptionsMessage={() => translate('No organizations')}
            />

            <BooleanGroup name="is_active" label={translate('Active')} />

            {mutationError && (
              <Alert variant="danger" className="mb-4">
                {mutationError}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <ActionButton
                action={closeDialog}
                variant="secondary"
                title={translate('Cancel')}
              />
              <SubmitButton
                submitting={submitMutation.isPending}
                disabled={invalid}
                label={translate('Save')}
              />
            </div>
          </form>
        )}
      />
    </ModalDialog>
  );
};
