import arrayMutators from 'final-form-arrays';
import { useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Notification,
  notificationMessagesTemplatesOverride,
  NotificationTemplateDetailSerializers,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { NotificationForm } from './NotificationForm';

function findDifferentTemplates(
  formTemplate: { templates: NotificationTemplateDetailSerializers[] },
  initTemplate: { templates: NotificationTemplateDetailSerializers[] },
) {
  const formTemplates = formTemplate.templates;
  const initTemplates = initTemplate.templates;

  return formTemplates.filter((template1) => {
    const matchingTemplate2 = initTemplates.find(
      (template2) => template2.content === template1.content,
    );
    return !matchingTemplate2;
  });
}

export const NotificationUpdateDialog = ({
  resolve,
}: {
  resolve: { notification: Notification; refetch };
}) => {
  const dispatch = useDispatch();

  const normalizedTemplates = useMemo(
    () =>
      resolve.notification.templates.map((t) => ({
        ...t,
        content: t.content ?? t.original_content ?? '',
      })),
    [resolve.notification.templates],
  );

  const onSubmit = useCallback(
    async (formData) => {
      const templatesToUpdate = findDifferentTemplates(formData, {
        templates: normalizedTemplates,
      });

      if (templatesToUpdate.length === 0) {
        dispatch(closeModalDialog());
        return;
      }

      for (const template of templatesToUpdate) {
        try {
          await notificationMessagesTemplatesOverride({
            path: { uuid: template.uuid },
            body: {
              content: template.content,
            },
          });
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update a notification.')),
          );
          return;
        }
      }
      await resolve.refetch();
      dispatch(showSuccess(translate('Notification has been updated.')));
      dispatch(closeModalDialog());
    },
    [dispatch, resolve, normalizedTemplates],
  );

  // @ts-ignore
  const contextSchema = resolve.notification.context_schema;
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ templates: normalizedTemplates }}
      mutators={{
        ...arrayMutators,
      }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update notification template')}
            subtitle={resolve.notification.description}
            footer={
              <SubmitButton
                submitting={submitting}
                disabled={pristine}
                label={translate('Save')}
              />
            }
          >
            <NotificationForm schema={contextSchema} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
