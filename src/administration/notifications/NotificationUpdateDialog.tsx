import arrayMutators from 'final-form-arrays';
import { useCallback } from 'react';
import { Accordion } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { notificationMessagesTemplatesOverride } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NotificationForm } from './NotificationForm';

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

export const NotificationUpdateDialog = ({ resolve }) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData) => {
      const templatesToUpdate = findDifferentTemplates(formData, {
        templates: resolve.notification.templates,
      });

      for (const template of templatesToUpdate) {
        try {
          await notificationMessagesTemplatesOverride({
            path: { uuid: template.uuid },
            body: {
              content: template.content,
            },
          });
          await resolve.refetch();
          dispatch(showSuccess(translate('Notification has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update a notification.')),
          );
        }
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ templates: resolve.notification.templates }}
      mutators={{
        ...arrayMutators,
      }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update a notification')}
            subtitle={resolve.notification.description}
            footer={
              <SubmitButton
                submitting={submitting}
                disabled={pristine}
                label={translate('Save')}
              />
            }
          >
            <Accordion defaultActiveKey="0">
              <NotificationForm submitting={submitting} />
              {Object.keys(resolve.notification.context_fields).length > 0 && (
                <Accordion.Item eventKey="context">
                  <Accordion.Header>
                    {translate('Context fields')}
                  </Accordion.Header>
                  <Accordion.Body>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>{translate('Name')}</th>
                          <th>{translate('Description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(
                          resolve.notification.context_fields as Record<
                            string,
                            string
                          >,
                        ).map(([name, description]) => (
                          <tr key={name}>
                            <td>{name}</td>
                            <td>{description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Accordion.Body>
                </Accordion.Item>
              )}
            </Accordion>
          </ModalDialog>
        </form>
      )}
    />
  );
};
