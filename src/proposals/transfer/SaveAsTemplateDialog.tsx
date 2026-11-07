import { FC } from 'react';
import { Form } from 'react-final-form';
import { proposalProtectedCallsSaveAsTemplate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { Call } from '../types';

interface SaveAsTemplateDialogProps {
  resolve: { call: Pick<Call, 'uuid' | 'name' | 'description'> };
}

interface FormValues {
  name: string;
  description?: string;
}

export const SaveAsTemplateDialog: FC<SaveAsTemplateDialogProps> = ({
  resolve,
}) => {
  const { showRedirectMessage: showWarning } = useNotify();
  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const response = await proposalProtectedCallsSaveAsTemplate({
        path: { uuid: resolve.call.uuid },
        body: { name: values.name, description: values.description ?? '' },
      });
      if (response.data.warnings.length) {
        showWarning(
          translate('A call created from the template will leave out'),
          response.data.warnings.join(' '),
        );
      }
      return response;
    },
    successMessage: translate(
      'Saved as an unpublished call template. Publish it under Administration to offer it to call managers.',
    ),
    errorMessage: translate('Unable to save the call as a template.'),
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        name: resolve.call.name,
        description: resolve.call.description,
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Save as template')}
            subtitle={translate(
              "Save the call's settings and workflow, with the questions of its forms, as a call template. Rounds, offerings, documents and people are left out.",
            )}
            footer={
              <>
                <div className="min-w-[150px]">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-full"
                  />
                </div>
                <div className="min-w-[150px]">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    invalid={invalid}
                    label={translate('Save')}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            <StringGroup
              name="name"
              validate={required}
              label={translate('Template name')}
              required
              maxLength={150}
            />
            <TextGroup
              name="description"
              label={translate('Description')}
              description={translate(
                'Shown to call managers choosing a template.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
