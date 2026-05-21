import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  type ArrowCustomerMapping,
  adminArrowCustomerMappingsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
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
    ? (submitMutation.error as any).response?.data?.detail ||
      (submitMutation.error as any).message ||
      translate('Failed to update mapping')
    : null;

  return (
    <ModalDialog title={translate('Edit Customer Mapping')}>
      <Form<FormValues>
        onSubmit={(values) => submitMutation.mutateAsync(values)}
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
            <FormGroup
              label={translate('Arrow Reference')}
              description={translate(
                'The Arrow customer reference (e.g., XSP123456)',
              )}
              required
            >
              <Field
                name="arrow_reference"
                component={StringField}
                validate={required}
              />
            </FormGroup>

            <FormGroup
              label={translate('Arrow Company Name')}
              description={translate('Optional company name for display')}
            >
              <Field name="arrow_company_name" component={StringField} />
            </FormGroup>

            <FormGroup
              label={translate('Waldur Organization')}
              description={translate(
                'The Waldur organization to map this Arrow customer to',
              )}
              required
            >
              <Field
                name="waldur_customer"
                component={Select}
                validate={required}
                placeholder={translate('Select organization...')}
                loadOptions={(query, prevOptions, page) =>
                  organizationAutocomplete(query, prevOptions, page, {
                    field: ['name', 'uuid'],
                    o: 'name',
                  })
                }
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.uuid}
                noOptionsMessage={() => translate('No organizations')}
              />
            </FormGroup>

            <FormGroup>
              <Field
                name="is_active"
                component={AwesomeCheckboxField}
                label={translate('Active')}
              />
            </FormGroup>

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
