import { Form } from 'react-bootstrap';
import { Field, Form as ReactFinalForm } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { userAgreementsPartialUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();

  const onSubmit = async (formValues) => {
    await userAgreementsPartialUpdate({
      path: { uuid: formValues.uuid },
      body: formValues,
    });
    await resolve.refetch();
    dispatch(showSuccess(translate('User agreement was updated')));
    dispatch(closeModalDialog());
  };

  return (
    <ReactFinalForm
      onSubmit={onSubmit}
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
            <div className="mb-7">
              <Form.Label>
                {
                  agreementTypeLabelMap[
                    resolve.initialValues.agreement_type.toLowerCase()
                  ]
                }
              </Form.Label>
              <Field name="content" component={MarkdownEditor as any} />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
