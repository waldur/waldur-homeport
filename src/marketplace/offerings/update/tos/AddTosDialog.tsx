import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingTermsOfServiceCreate,
  OfferingTermsOfServiceCreateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton, SelectField, NumberField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { FormGroup } from '../../FormGroup';

interface AddTosFormData {
  version: string;
  add_as: string;
  terms_of_service?: string;
  terms_of_service_link?: string;
  is_active?: boolean;
  requires_reconsent?: boolean;
  grace_period_days?: number;
}

const addAsOptions = [
  { label: translate('Markdown'), value: 'markdown' },
  { label: translate('External link'), value: 'external_link' },
];

interface AddTosDialogProps {
  resolve: { offering; refetch };
}

export const AddTosDialog: FC<AddTosDialogProps> = ({ resolve }) => {
  const updateMutation = useManagedMutation<any, AddTosFormData, any>({
    mutationFn: (formData) => {
      const body: OfferingTermsOfServiceCreateRequest = {
        offering: resolve.offering.url,
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
    refetch: resolve.refetch,
  });

  return (
    <Form<AddTosFormData>
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={{
        add_as: 'markdown',
        grace_period_days: 60,
      }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add Terms of Service')}
            iconNode={<PlusCircleIcon weight="bold" />}
            footer={
              <div className="d-flex gap-3 justify-content-end mt-4">
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  className="btn btn-primary min-w-125px"
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                />
              </div>
            }
          >
            <FormGroup label={translate('Version')} required={true}>
              <Field
                name="version"
                validate={required}
                component={StringField}
              />
            </FormGroup>

            <FormGroup label={translate('Add as')} required={true}>
              <Field
                name="add_as"
                component={SelectField}
                options={addAsOptions}
                simpleValue
              />
            </FormGroup>

            {(values?.add_as || 'markdown') === 'markdown' ? (
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
                component={AwesomeCheckboxField}
                type="checkbox"
                label={translate('Is active')}
              />
            </div>

            <div className="mb-3">
              <Field
                name="requires_reconsent"
                component={AwesomeCheckboxField}
                type="checkbox"
                label={translate('Requires re-consent')}
              />
            </div>

            {values?.requires_reconsent && (
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
      )}
    />
  );
};
