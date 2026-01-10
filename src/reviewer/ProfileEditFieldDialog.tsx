import { useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import {
  reviewerProfilesMePartialUpdate,
  reviewerProfilesPartialUpdate,
  ReviewerProfile,
} from 'waldur-js-client';

import { SubmitButton, TextField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const processRequest = useCallback(
    async (values) => {
      try {
        const value = values[resolve.name] || null;
        if (resolve.isStaffEdit) {
          await reviewerProfilesPartialUpdate({
            path: { uuid: resolve.profile.uuid },
            body: { [resolve.name]: value },
          });
        } else {
          await reviewerProfilesMePartialUpdate({
            body: { [resolve.name]: value },
          });
        }
        showSuccess(translate('Profile updated successfully.'));
        closeDialog();
        resolve.refetch?.();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update profile.'));
      }
    },
    [resolve, closeDialog, showSuccess, showErrorResponse],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={{ [resolve.name]: resolve.profile[resolve.name] || '' }}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Submit')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {resolve.name === 'biography' ? (
              <FormGroup label={resolve.label}>
                <Field name="biography" component={TextField as any} rows={4} />
              </FormGroup>
            ) : resolve.name === 'orcid_id' ? (
              <FormGroup
                label={resolve.label}
                description={translate('Format: 0000-0000-0000-0000')}
              >
                <Field
                  name="orcid_id"
                  component={StringField as any}
                  placeholder="0000-0000-0000-0000"
                />
              </FormGroup>
            ) : (
              <FormGroup label={resolve.label}>
                <Field name={resolve.name} component={StringField as any} />
              </FormGroup>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
