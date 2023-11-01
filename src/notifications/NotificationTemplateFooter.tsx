import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createNotificationTemplate, updateNotificationTemplate } from './api';
import { NotificationTemplateFormData } from './types';
import { serializeNotificationTemplate } from './utils';

export const NotificationTemplateFooter = ({
  handleSubmit,
  refetch,
  disabled,
  isUpdate,
}: {
  handleSubmit;
  refetch;
  disabled;
  isUpdate?;
}) => {
  const dispatch = useDispatch();
  const createTemplate = useCallback(
    async (formData: NotificationTemplateFormData) => {
      try {
        await createNotificationTemplate(
          serializeNotificationTemplate(formData),
        );
        await refetch();
        dispatch(
          showSuccess(translate('Broadcast template has been created.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to create a broadcast template.'),
          ),
        );
      }
    },
    [dispatch, refetch],
  );

  const updateTemplate = useCallback(
    async (formData: NotificationTemplateFormData) => {
      try {
        await updateNotificationTemplate(
          formData.uuid,
          serializeNotificationTemplate(formData),
        );
        await refetch();
        dispatch(
          showSuccess(translate('Broadcast template has been updated.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update a broadcast template.'),
          ),
        );
      }
    },
    [dispatch, refetch],
  );

  return (
    <Modal.Footer>
      <Button onClick={() => dispatch(closeModalDialog())} variant="secondary">
        <i className="fa fa-long-arrow-left" /> {translate('Back')}
      </Button>
      {!isUpdate ? (
        <Button
          disabled={disabled}
          className="ms-3"
          onClick={handleSubmit(createTemplate)}
        >
          <i className="fa fa-send" /> {translate('Create a template')}
        </Button>
      ) : (
        <Button
          disabled={disabled}
          className="ms-3"
          onClick={handleSubmit(updateTemplate)}
        >
          <i className="fa fa-send" /> {translate('Update a template')}
        </Button>
      )}
    </Modal.Footer>
  );
};
