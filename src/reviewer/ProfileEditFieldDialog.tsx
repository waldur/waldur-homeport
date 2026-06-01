import { Form } from 'react-final-form';
import {
  reviewerProfilesMePartialUpdate,
  reviewerProfilesPartialUpdate,
  ReviewerProfile,
} from 'waldur-js-client';

import { SubmitButton, TextGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ProfileEditFieldDialogProps {
  resolve: {
    profile: ReviewerProfile;
    name: 'biography' | 'alternative_names' | 'orcid_id';
    label: string;
    refetch?: () => void;
    isStaffEdit?: boolean;
  };
}

export const ProfileEditFieldDialog: React.FC<ProfileEditFieldDialogProps> = ({
  resolve,
}) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (values) => {
      const value = values[resolve.name] || null;
      if (resolve.isStaffEdit) {
        return reviewerProfilesPartialUpdate({
          path: { uuid: resolve.profile.uuid },
          body: { [resolve.name]: value },
        });
      } else {
        return reviewerProfilesMePartialUpdate({
          body: { [resolve.name]: value },
        });
      }
    },
    successMessage: translate('Profile updated successfully.'),
    errorMessage: translate('Unable to update profile.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={{ [resolve.name]: resolve.profile[resolve.name] || '' }}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            {resolve.name === 'biography' ? (
              <TextGroup name="biography" rows={4} label={resolve.label} />
            ) : resolve.name === 'orcid_id' ? (
              <StringGroup
                name="orcid_id"
                placeholder="0000-0000-0000-0000"
                label={resolve.label}
                description={translate('Format: 0000-0000-0000-0000')}
              />
            ) : (
              <StringGroup name={resolve.name} label={resolve.label} />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
