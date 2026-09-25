import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  adminAnnouncementsCreate,
  ChangelogUpgradeReport,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton, TextGroup } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@/navigation/header/announcements/queryKeys';
import { useNotify } from '@/store/notify';

interface ScheduleUpgradeDialogProps {
  resolve: {
    latestVersion: string;
    // Prefilled announcement text and type, built by the backend from every
    // pending changelog entry.
    announcement: string;
    announcementType: ChangelogUpgradeReport['announcement_type'];
  };
}

export const ScheduleUpgradeDialog: FC<ScheduleUpgradeDialogProps> = ({
  resolve: { latestVersion, announcement, announcementType },
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const queryClient = useQueryClient();

  const initialValues = {
    type: announcementType,
    description: announcement,
  };

  // The API rejects a window whose end isn't after its start; say so here
  // instead of letting the submit fail with a 400.
  const validate = (values) =>
    values.active_from &&
    values.active_to &&
    new Date(values.active_to) <= new Date(values.active_from)
      ? { active_to: translate('The end must be after the start.') }
      : {};

  const onSubmit = async (values) => {
    try {
      await adminAnnouncementsCreate({
        body: {
          type: values.type,
          description: values.description,
          active_from: values.active_from,
          active_to: values.active_to,
        },
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
      });
      showSuccess(translate('Upgrade announcement has been scheduled.'));
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to create announcement.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Schedule upgrade to {version}', {
              version: latestVersion,
            })}
            closeButton
            footer={
              <SubmitButton
                disabled={invalid}
                disabledReason={translate(
                  'Set a maintenance window that ends after it starts.',
                )}
                submitting={submitting}
                label={translate('Create announcement')}
              />
            }
          >
            <p className="text-muted mb-4">
              {translate(
                'This creates a maintenance announcement visible to all users, informing them about the scheduled upgrade window.',
              )}
            </p>

            <Row>
              <FormGroup
                label={translate('Maintenance window start')}
                required
                className="col-md-6"
              >
                <Field
                  component={DateTimeField as any}
                  name="active_from"
                  validate={required}
                />
              </FormGroup>
              <FormGroup
                label={translate('Maintenance window end')}
                required
                className="col-md-6"
              >
                <Field
                  component={DateTimeField as any}
                  name="active_to"
                  validate={required}
                />
              </FormGroup>
            </Row>

            <TextGroup
              name="description"
              label={translate('Announcement text')}
              rows={12}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
