import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  AdminAnnouncementRequest,
  adminAnnouncementsCreate,
  adminAnnouncementsUpdate,
} from 'waldur-js-client';

import { SelectField, SubmitButton } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@/navigation/header/announcements/queryKeys';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { AnnouncementTypeOptions } from '../utils';

interface AnnouncementFormProps {
  resolve: { announcement?; refetch };
}

export const AnnouncementForm: FC<AnnouncementFormProps> = ({ resolve }) => {
  const isEdit = Boolean(resolve.announcement?.uuid);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const initialValues = resolve?.announcement
    ? { ...resolve.announcement }
    : undefined;

  const onSubmit = async (values: AdminAnnouncementRequest) => {
    let action;
    if (isEdit) {
      action = adminAnnouncementsUpdate({
        path: {
          uuid: resolve.announcement.uuid,
        },
        body: values,
      });
    } else {
      action = adminAnnouncementsCreate({ body: values });
    }

    try {
      await action;
      resolve.refetch();
      // Invalidate React Query cache to update announcements in header
      queryClient.invalidateQueries({
        queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
      });
      showSuccess(
        isEdit
          ? translate('The announcement has been updated.')
          : translate('New announcement has been created.'),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update announcement.')
          : translate('Unable to create announcement.'),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit the announcement')
                : translate('Create new announcement')
            }
            closeButton
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Row>
              <FormGroup
                label={translate('Type')}
                required
                className="col-md-6"
              >
                <Field
                  component={SelectField as any}
                  name="type"
                  options={AnnouncementTypeOptions}
                  getOptionValue={(option) => option.value}
                  getOptionLabel={(option) => option.label}
                  simpleValue
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup
                label={translate('Active from')}
                required
                className="col-md-6"
              >
                <Field component={DateTimeField as any} name="active_from" />
              </FormGroup>
              <FormGroup
                label={translate('Active to')}
                required
                className="col-md-6"
              >
                <Field component={DateTimeField as any} name="active_to" />
              </FormGroup>
            </Row>

            <FormGroup label={translate('Announcement')} required>
              <Field component={MarkdownEditor as any} name="description" />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
