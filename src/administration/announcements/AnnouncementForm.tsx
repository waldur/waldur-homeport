import { useQueryClient } from '@tanstack/react-query';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import {
  AdminAnnouncementRequest,
  adminAnnouncementsCreate,
  adminAnnouncementsUpdate,
} from 'waldur-js-client';

import { FormContainer, SelectField, SubmitButton } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@waldur/navigation/header/announcements/queryKeys';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { AnnouncementTypeOptions } from '../utils';

export const AnnouncementForm = connect<
  {},
  {},
  { resolve: { announcement?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.announcement
    ? { ...ownProps.resolve.announcement }
    : undefined,
}))(
  reduxForm<AdminAnnouncementRequest, { resolve: { announcement?; refetch } }>({
    form: 'AdminAnnouncementForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.announcement?.uuid);
    const queryClient = useQueryClient();

    const processRequest = async (
      values: AdminAnnouncementRequest,
      dispatch,
    ) => {
      let action;
      if (isEdit) {
        action = adminAnnouncementsUpdate({
          path: {
            uuid: props.resolve.announcement.uuid,
          },
          body: values,
        });
      } else {
        action = adminAnnouncementsCreate({ body: values });
      }

      try {
        await action;
        props.resolve.refetch();
        // Invalidate React Query cache to update announcements in header
        queryClient.invalidateQueries({
          queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
        });
        dispatch(
          showSuccess(
            isEdit
              ? translate('The announcement has been updated.')
              : translate('New announcement has been created.'),
          ),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            isEdit
              ? translate('Unable to update announcement.')
              : translate('Unable to create announcement.'),
          ),
        );
        if (e.response && e.response.status === 400) {
          throw new SubmissionError(e.response.data);
        }
      }
    };

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit the announcement')
              : translate('Create new announcement')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <SelectField
              label={translate('Type')}
              name="type"
              options={AnnouncementTypeOptions}
              required
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              simpleValue
              className="col-md-6"
            />

            <DateTimeField
              label={translate('Active from')}
              name="active_from"
              required
            />

            <DateTimeField
              label={translate('Active to')}
              name="active_to"
              required
            />

            <MarkdownEditor
              label={translate('Announcement')}
              name="description"
              required
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
