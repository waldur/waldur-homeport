import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { userAgreementsPartialUpdate } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { SubmitButton } from '@waldur/form';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess } from '@waldur/store/notify';

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
    <Form
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
              <label className="form-label">{translate('Language')}</label>
              <p className="form-control-plaintext">
                {getLanguageLabel(resolve.initialValues.language)}
              </p>
            </div>
            <div className="mb-7">
              <label className="form-label">
                {
                  agreementTypeLabelMap[
                    resolve.initialValues.agreement_type.toLowerCase()
                  ]
                }
              </label>
              <Field name="content" component={MarkdownEditor as any} />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
