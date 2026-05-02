import { PlusCircleIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceOfferingTermsOfServiceCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton, SelectField, NumberField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { FormGroup } from '../../FormGroup';

import { TOS_FORM_ID } from './constants';

const addAsOptions = [
  { label: translate('Markdown'), value: 'markdown' },
  { label: translate('External link'), value: 'external_link' },
];

export const AddTosDialog = reduxForm<{}, { resolve: { offering; refetch } }>({
  form: TOS_FORM_ID,
  initialValues: {
    add_as: 'markdown',
    grace_period_days: 60,
  },
})((props) => {
  const addAsValue = useSelector(
    (state: any) => state.form[TOS_FORM_ID]?.values?.add_as || 'markdown',
  );
  const requiresReconsentValue = useSelector(
    (state: any) =>
      state.form[TOS_FORM_ID]?.values?.requires_reconsent || false,
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const body: any = {
        offering: props.resolve.offering.url,
        version: formData.version,
        is_active: formData.is_active || false,
        requires_reconsent: formData.requires_reconsent || false,
      };

      if (formData.add_as === 'markdown') {
        body.terms_of_service = formData.terms_of_service;
      } else {
        body.terms_of_service_link = formData.terms_of_service_link;
      }

      if (formData.requires_reconsent && formData.grace_period_days) {
        body.grace_period_days = formData.grace_period_days;
      }

      return marketplaceOfferingTermsOfServiceCreate({ body });
    },
    successMessage: translate('Terms of service has been added successfully.'),
    errorMessage: translate('Unable to add Terms of Service.'),
    refetch: props.resolve.refetch,
  });

  return (
    <form
      onSubmit={props.handleSubmit((values) =>
        updateMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate('Add Terms of Service')}
        iconNode={<PlusCircleIcon weight="bold" />}
        footer={
          <div className="d-flex gap-3 justify-content-end mt-4">
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              className="btn btn-primary min-w-125px"
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Confirm')}
            />
          </div>
        }
      >
        <FormGroup label={translate('Version')} required={true}>
          <Field name="version" validate={required} component={StringField} />
        </FormGroup>

        <FormGroup label={translate('Add as')} required={true}>
          <Field
            name="add_as"
            component={SelectField}
            options={addAsOptions}
            simpleValue
          />
        </FormGroup>

        {addAsValue === 'markdown' ? (
          <FormGroup label={translate('Terms of Service')}>
            <div className="markdown-editor-wrapper">
              <Field name="terms_of_service" component={MarkdownEditor} />
            </div>
          </FormGroup>
        ) : (
          <FormGroup label={translate('External link')} required={true}>
            <Field
              name="terms_of_service_link"
              component={StringField}
              validate={required}
            />
          </FormGroup>
        )}

        <div className="mb-3">
          <Field
            name="is_active"
            component={AwesomeCheckboxField as any}
            label={translate('Is active')}
          />
        </div>

        <div className="mb-3">
          <Field
            name="requires_reconsent"
            component={AwesomeCheckboxField as any}
            label={translate('Requires re-consent')}
          />
        </div>

        {requiresReconsentValue && (
          <FormGroup
            label={translate('Grace period (days)')}
            help={translate(
              'Number of days before outdated consents are automatically revoked. Only applies when requires re-consent is enabled.',
            )}
            helpEnd
            description={translate(
              'After this period expires, user consents for outdated terms will be automatically revoked.',
            )}
          >
            <Field
              name="grace_period_days"
              component={NumberField}
              min={0}
              parse={(value) => (value === '' ? undefined : Number(value))}
            />
          </FormGroup>
        )}
      </ModalDialog>
    </form>
  );
});
