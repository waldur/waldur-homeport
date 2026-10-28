import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  AdminAnnouncementRequest,
  adminAnnouncementsCreate,
  adminAnnouncementsUpdate,
} from 'waldur-js-client';

import {
  DateTimeGroup,
  MarkdownGroup,
  SelectGroup,
  SubmitButton,
} from '@/form';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <SelectGroup
                name="type"
                options={AnnouncementTypeOptions}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                simpleValue
                label={translate('Type')}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <DateTimeGroup
                label={translate('Active from')}
                required
                name="active_from"
              />
              <DateTimeGroup
                label={translate('Active to')}
                required
                name="active_to"
              />
            </div>

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
