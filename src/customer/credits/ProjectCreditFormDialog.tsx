import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector, connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { lessThanOrEqual, required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { getCustomer } from '@waldur/workspace/selectors';

import { OrganizationProjectSelectField } from '../team/OrganizationProjectSelectField';

import { getCustomerCredit } from './api';
import { ProjectCreditFormData } from './types';

interface ProjectCreditFormDialogProps {
  formId: string;
  onSubmit(formData: ProjectCreditFormData): void;
  initialValues: any;
}

export const ProjectCreditFormDialog = connect(
  (_, ownProps: ProjectCreditFormDialogProps) => ({
    form: ownProps.formId,
    initialValues: ownProps.initialValues,
  }),
)(
  reduxForm<ProjectCreditFormData, ProjectCreditFormDialogProps>({
    destroyOnUnmount: true,
  })((props) => {
    const customer = useSelector(getCustomer);

    const {
      data: organizationCredit,
      isLoading,
      error,
      refetch,
    } = useQuery(
      ['organizationCredits', customer?.uuid],
      () => getCustomerCredit(customer?.uuid),
      { staleTime: 60 * 1000 },
    );

    const isEdit = Boolean(props.initialValues);

    const valueFieldDescriptionData = {
      currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      credits: isLoading ? (
        <LoadingSpinnerIcon />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        organizationCredit?.value ?? 0
      ),
    };

    const exceeds = useMemo(
      () => lessThanOrEqual(Number(organizationCredit?.value ?? 0)),
      [organizationCredit],
    );

    return (
      <form onSubmit={props.handleSubmit(props.onSubmit)}>
        <MetronicModalDialog
          title={
            isEdit
              ? translate('Edit project credit')
              : translate('Add project credit')
          }
          subtitle={translate(
            "Sum of all project credits must not exceed the organization's total available credit.",
          )}
          footer={
            <>
              <CloseDialogButton className="min-w-125px" />
              <SubmitButton
                disabled={props.invalid || !props.dirty || !organizationCredit}
                submitting={props.submitting}
                label={isEdit ? translate('Edit') : translate('Confirm')}
                className="btn btn-primary min-w-125px"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting} className="size-lg">
            <OrganizationProjectSelectField disabled={isEdit} />
            <NumberField
              label={translate('Allocate credit ({currency})', {
                currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              })}
              name="value"
              placeholder="0"
              description={
                isEdit
                  ? translate(
                      'Previously saved credit value for this organization: {currency} {credits}',
                      valueFieldDescriptionData,
                      formatJsxTemplate,
                    )
                  : translate(
                      'Credits available for this organization: {currency} {credits}',
                      valueFieldDescriptionData,
                      formatJsxTemplate,
                    )
              }
              unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
              validate={[required, exceeds]}
              required
            />
            <AwesomeCheckboxField
              name="use_organisation_credit"
              label={translate(
                'Use organization credit after exceeding allocated amount',
              )}
              description={translate(
                "Choose if you want to use the organization's credits, or pay for any extra usage",
              )}
              hideLabel={true}
            />
            <Form.Group>
              <FieldError error={props.error} />
            </Form.Group>
          </FormContainer>
        </MetronicModalDialog>
      </form>
    );
  }),
);
