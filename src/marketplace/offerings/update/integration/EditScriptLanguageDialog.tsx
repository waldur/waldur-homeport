import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  MergedSecretOptionsRequest,
} from 'waldur-js-client';

import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ScriptEditorProps } from './types';

interface EditScriptLanguageDialogProps {
  resolve: ScriptEditorProps;
}

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
  {
    label: 'Ansible Playbook',
    value: 'ansible',
  },
];

export const EditScriptLanguageDialog: FC<EditScriptLanguageDialogProps> = ({
  resolve,
}) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: resolve.offering.uuid },
        body: {
          secret_options: {
            ...resolve.offering.secret_options,
            [resolve.type]: formData.language,
          } as MergedSecretOptionsRequest,
        },
      }),
    successMessage: translate('Script language has been updated successfully.'),
    errorMessage: translate('Unable to update script language.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={{
        language: resolve.offering.secret_options[resolve.type],
      }}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.label}
            subtitle={translate(
              "Select the language to be used for the offering {name}'s custom scripts",
              { name: resolve.offering.name },
            )}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <SelectGroup
              name="language"
              label={resolve.label}
              options={PROGRAMMING_LANGUAGE_CHOICES}
              simpleValue={true}
              required={true}
              isClearable={false}
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
