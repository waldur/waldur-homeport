import { Form } from 'react-bootstrap';
import { Form as ReactFinalForm } from 'react-final-form';
import { userAgreementsPartialUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { MarkdownGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface UserAgreementsEditDialogOwnProps {
  resolve: {
    initialValues;
    refetch(): void;
  };
}

const agreementTypeLabelMap = {
  pp: translate('Privacy policy'),
  tos: translate('Terms of service'),
};

const getLanguageLabel = (code: string) => {
  if (!code) return translate('Default');
  const lang = ENV.languageChoices.find((l) => l.code === code);
  return lang?.label || code;
};

export const UserAgreementsEditDialog = ({
  resolve,
}: UserAgreementsEditDialogOwnProps) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) =>
      userAgreementsPartialUpdate({
        path: { uuid: formValues.uuid },
        body: formValues,
      }),
    successMessage: translate('User agreement was updated'),
    refetch: resolve.refetch,
  });

  return (
    <ReactFinalForm
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={resolve.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit user agreement')}
            footer={
              <SubmitButton submitting={submitting} label={translate('Save')} />
            }
          >
            <div className="mb-7">
              <Form.Label>{translate('Language')}</Form.Label>
              <p className="form-control-plaintext">
                {getLanguageLabel(resolve.initialValues.language)}
              </p>
            </div>
            <MarkdownGroup
              name="content"
              label={
                agreementTypeLabelMap[
                  resolve.initialValues.agreement_type.toLowerCase()
                ]
              }
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
