import { useCallback, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { Select } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { useUpdateCustomerMapping } from '../api';

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
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const updateMapping = useUpdateCustomerMapping();
  const { mapping, refetch } = resolve;

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      try {
        await updateMapping.mutateAsync({
          uuid: mapping.uuid,
          data: {
            arrow_reference: values.arrow_reference,
            arrow_company_name: values.arrow_company_name,
            waldur_customer: values.waldur_customer.uuid,
            is_active: values.is_active,
          },
        });
        dispatch(showSuccess(translate('Customer mapping updated')));
        refetch();
        dispatch(closeModalDialog());
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to update mapping'),
        );
      }
    },
    [updateMapping, mapping.uuid, dispatch, refetch],
  );

  const handleClose = useCallback(() => {
    dispatch(closeModalDialog());
  }, [dispatch]);

  return (
    <ModalDialog title={translate('Edit Customer Mapping')}>
      <Form
        onSubmit={handleSubmit}
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
                component={StringField as any}
                validate={required}
              />
            </FormGroup>

            <FormGroup
              label={translate('Arrow Company Name')}
              description={translate('Optional company name for display')}
            >
              <Field name="arrow_company_name" component={StringField as any} />
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
                component={Select as any}
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
                component={AwesomeCheckboxField as any}
                label={translate('Active')}
              />
            </FormGroup>

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <ActionButton
                action={handleClose}
                variant="secondary"
                title={translate('Cancel')}
              />
              <SubmitButton
                submitting={updateMapping.isPending}
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
