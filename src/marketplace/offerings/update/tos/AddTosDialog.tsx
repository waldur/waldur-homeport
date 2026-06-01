import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingTermsOfServiceCreate,
  OfferingTermsOfServiceCreateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  MarkdownGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
            <StringGroup
              name="version"
              validate={required}
              label={translate('Version')}
              required={true}
            />

            <SelectGroup
              name="add_as"
              options={addAsOptions}
              simpleValue
              label={translate('Add as')}
              required={true}
            />

            {(values?.add_as || 'markdown') === 'markdown' ? (
              <MarkdownGroup
                name="terms_of_service"
                label={translate('Terms of Service')}
              />
            ) : (
              <StringGroup
                name="terms_of_service_link"
                validate={required}
                label={translate('External link')}
                required={true}
              />
            )}

            <BooleanGroup name="is_active" label={translate('Is active')} />

            <BooleanGroup
              name="requires_reconsent"
              label={translate('Requires re-consent')}
            />

            {values?.requires_reconsent && (
              <NumberGroup
                name="grace_period_days"
                min={0}
                parse={(value) => (value === '' ? undefined : Number(value))}
                label={translate('Grace period (days)')}
                help={translate(
                  'Number of days before outdated consents are automatically revoked. Only applies when requires re-consent is enabled.',
                )}
                helpEnd
                description={translate(
                  'After this period expires, user consents for outdated terms will be automatically revoked.',
                )}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
