import { FC } from 'react';
import { Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  AdminAnnouncementRequest,
  adminAnnouncementsCreate,
  adminAnnouncementsUpdate,
} from 'waldur-js-client';

import { SubmitButton, SelectGroup, MarkdownGroup } from '@/form';
import { FormGroup } from '@/form';
import { DateTimeField } from '@/form/DateTimeField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@/navigation/header/announcements/queryKeys';

import { AnnouncementTypeOptions } from '../utils';

interface AnnouncementFormProps {
  resolve: { announcement?; refetch };
}

export const AnnouncementForm: FC<AnnouncementFormProps> = ({ resolve }) => {
  const isEdit = Boolean(resolve.announcement?.uuid);

  const initialValues = resolve?.announcement
    ? { ...resolve.announcement }
    : undefined;

  const onSubmitMutation = useManagedMutation<
    any,
    any,
    AdminAnnouncementRequest
  >({
    mutationFn: (values) =>
      isEdit
        ? adminAnnouncementsUpdate({
            path: { uuid: resolve.announcement.uuid },
            body: values,
          })
        : adminAnnouncementsCreate({ body: values }),

    successMessage: isEdit
      ? translate('The announcement has been updated.')
      : translate('New announcement has been created.'),

    errorMessage: isEdit
      ? translate('Unable to update announcement.')
      : translate('Unable to create announcement.'),

    refetch: resolve.refetch,

    invalidateQueries: [
      {
        queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
      },
    ],
  });

  return (
    <Form<AdminAnnouncementRequest>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit the announcement')
                : translate('Create new announcement')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Row>
              <SelectGroup
                name="type"
                options={AnnouncementTypeOptions}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                simpleValue
                label={translate('Type')}
                required
                className="col-md-6"
              />
            </Row>

            <Row>
              <FormGroup
                label={translate('Active from')}
                required
                className="col-md-6"
              >
                <Field component={DateTimeField} name="active_from" />
              </FormGroup>
              <FormGroup
                label={translate('Active to')}
                required
                className="col-md-6"
              >
                <Field component={DateTimeField} name="active_to" />
              </FormGroup>
            </Row>

            <MarkdownGroup
              name="description"
              label={translate('Announcement')}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
