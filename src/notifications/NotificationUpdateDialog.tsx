import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { overrideNotificationTemplate } from '@waldur/notifications/api';
import { NotificationForm } from '@waldur/notifications/NotificationForm';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const enhance = reduxForm<any, any>({
  form: 'NotificationUpdateForm',
});

function findDifferentTemplates(formTemplate, initTemplate) {
  const formTemplates = formTemplate.templates;
  const initTemplates = initTemplate.templates;

  return formTemplates.filter((template1) => {
    const matchingTemplate2 = initTemplates.find(
      (template2) => template2.content === template1.content,
    );
    return !matchingTemplate2;
  });
}

export const NotificationUpdateDialog = connect<{}, {}, any>((_, ownProps) => ({
  initialValues: { templates: ownProps.resolve.notification.templates },
}))(
  enhance(({ submitting, resolve, handleSubmit }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData) => {
        const templatesToUpdate = findDifferentTemplates(formData, {
          templates: resolve.notification.templates,
        });

        for (const template of templatesToUpdate) {
          try {
            await overrideNotificationTemplate(template.url, {
              content: template.content,
            });
            await resolve.refetch();
            dispatch(showSuccess(translate('Notification has been updated.')));
            dispatch(closeModalDialog());
          } catch (e) {
            dispatch(
              showErrorResponse(
                e,
                translate('Unable to update a notification.'),
              ),
            );
          }
        }
      },
      [dispatch, resolve],
    );

    return (
      <ModalDialog title={translate('Update a notification')}>
        <form onSubmit={handleSubmit(callback)}>
          <NotificationForm submitting={submitting} />
        </form>
      </ModalDialog>
    );
  }),
);
