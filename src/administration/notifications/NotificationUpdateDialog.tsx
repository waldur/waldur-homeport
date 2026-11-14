import arrayMutators from 'final-form-arrays';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  Notification,
  notificationMessagesTemplatesOverride,
  NotificationTemplateDetailSerializers,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { NotificationForm } from './NotificationForm';

function findDifferentTemplates(
  formTemplates: NotificationTemplateDetailSerializers[],
  baseTemplates: NotificationTemplateDetailSerializers[],
) {
  return formTemplates.filter((formTemplate) => {
    const base = baseTemplates.find((t) => t.uuid === formTemplate.uuid);
    return base && formTemplate.content !== base.content;
  });
}

export const NotificationUpdateDialog = ({
  resolve,
}: {
  resolve: { notification: Notification; refetch };
}) => {
  const normalizedTemplates = useMemo(
    () =>
      resolve.notification.templates.map((t) => ({
        ...t,
        content: t.content ?? t.original_content ?? '',
      })),
    [resolve.notification.templates],
  );

  const { mutateAsync } = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      const templatesToUpdate = findDifferentTemplates(
        formData.templates,
        normalizedTemplates,
      );

      if (templatesToUpdate.length === 0) {
        return;
      }

      for (const template of templatesToUpdate) {
        await notificationMessagesTemplatesOverride({
          path: { uuid: template.uuid },
          body: {
            content: template.content,
          },
        });
      }
    },
    refetch: resolve.refetch,
    successMessage: translate('Notification has been updated.'),
    errorMessage: translate('Unable to update a notification.'),
  });

  const contextSchema = resolve.notification.context_schema;
  return (
    <Form
      onSubmit={(values) => mutateAsync(values)}
      initialValues={{ templates: normalizedTemplates }}
      mutators={{
        ...arrayMutators,
      }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update notification template')}
            subtitle={resolve.notification.description}
            bodyClassName="h-[500px] overflow-auto"
            footer={
              <>
                <CloseDialogButton className="min-w-[150px]" />
                <SubmitButton
                  submitting={submitting}
                  disabled={pristine}
                  label={translate('Confirm')}
                  className="min-w-[150px]"
                />
              </>
            }
          >
            <NotificationForm schema={contextSchema} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
