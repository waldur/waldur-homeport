import { useQuery } from '@tanstack/react-query';
import { Accordion, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FieldError, FormContainer, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { useCustomerCostChart } from '../dashboard/utils';

import {
  useCustomerAllocateCreditField,
  useCustomerCreditOfferingsField,
  useMinimalConsumptionFields,
} from './constants';
import { CustomerCreditFormData } from './types';

interface CreditFormDialogProps {
  submitFn(formData: CustomerCreditFormData): void;
}

export const CreditFormDialog = reduxForm<
  CustomerCreditFormData,
  CreditFormDialogProps
>({
  destroyOnUnmount: true,
})((props) => {
  const isEdit = Boolean(props.initialValues);

  const customer = useSelector((state) =>
    formValueSelector(props.form)(state, 'customer'),
  );
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customerDashboardCharts', customer?.uuid, true],
    queryFn: () => (isEdit && customer ? useCustomerCostChart(customer) : null),
    staleTime: 5 * 60 * 1000,
  });
  const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
    props.form,
    props.initialValues,
  );
  const OFFERING_FIELD = useCustomerCreditOfferingsField();
  const ALLOCATE_CREDIT_FIELD = useCustomerAllocateCreditField();

  return (
    <form onSubmit={props.handleSubmit(props.submitFn)}>
      <ModalDialog
        title={
          isEdit ? translate('Edit credit') : translate('Add allocation credit')
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
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={isEdit ? translate('Confirm') : translate('Create')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting} className="size-lg">
          <AsyncSelectField
            name="customer"
            label={translate('Organization')}
            validate={required}
            required
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page, {
                field: ['name', 'uuid', 'url'],
              })
            }
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            noOptionsMessage={() => translate('No organizations')}
            isDisabled={isEdit}
          />

          {isEdit && (
            <Accordion className="mb-7">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="fw-bolder">
                    {translate('Organization invoice history')}
                    {isLoading && <LoadingSpinnerIcon className="ms-2" />}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  {error ? (
                    <LoadingErred loadData={refetch} />
                  ) : data?.options ? (
                    <>
                      <div className="fw-bold text-muted text-end">
                        {translate('Total for the year')}
                        {': '}
                        {defaultCurrency(data.chart.total)}
                      </div>
                      <EChart options={data.options} height="150px" />
                    </>
                  ) : null}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
          {OFFERING_FIELD}
          {ALLOCATE_CREDIT_FIELD}
          {CONSUMPTION_FIELDS}
          <Form.Group>
            <FieldError error={props.error} />
          </Form.Group>
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
