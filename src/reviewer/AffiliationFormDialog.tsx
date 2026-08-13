import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  AffiliationTypeEnum,
  nestedReviewerProfileAffiliationsCreate,
  nestedReviewerProfileAffiliationsPartialUpdate,
  ReviewerAffiliationRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  DateGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const AFFILIATION_TYPE_OPTIONS = [
  { value: 'employment', label: translate('Employment') },
  { value: 'education', label: translate('Education') },
  { value: 'visiting', label: translate('Visiting') },
  { value: 'honorary', label: translate('Honorary') },
  { value: 'consulting', label: translate('Consulting') },
];

interface AffiliationFormDialogProps {
  resolve: {
    profile: { uuid: string };
    refetch: () => void;
    affiliation?: any;
  };
}

export const AffiliationFormDialog = ({
  resolve,
}: AffiliationFormDialogProps) => {
  const isEdit = Boolean(resolve.affiliation);

  const initialValues = isEdit
    ? {
        organization_name: resolve.affiliation.organization_name,
        organization_identifier: resolve.affiliation.organization_identifier,
        department: resolve.affiliation.department,
        position_title: resolve.affiliation.position_title,
        start_date: resolve.affiliation.start_date,
        end_date: resolve.affiliation.end_date,
        is_primary: resolve.affiliation.is_primary,
        affiliation_type: AFFILIATION_TYPE_OPTIONS.find(
          (opt) => opt.value === resolve.affiliation.affiliation_type,
        ),
      }
    : {
        affiliation_type: AFFILIATION_TYPE_OPTIONS[0],
      };

  const { mutateAsync, isPending } = useManagedMutation<any, any, any>({
    mutationFn: (formValues) => {
      const body: ReviewerAffiliationRequest = {
        organization_name: formValues.organization_name,
        // Blank string, not undefined: an undefined value is dropped from the
        // JSON body, so clearing the field would silently keep the old value.
        organization_identifier: formValues.organization_identifier || '',
        department: formValues.department || '',
        position_title: formValues.position_title,
        start_date: formValues.start_date,
        end_date: formValues.end_date || null,
        is_primary: formValues.is_primary || false,
        affiliation_type: formValues.affiliation_type
          ?.value as AffiliationTypeEnum,
      };

      return isEdit
        ? nestedReviewerProfileAffiliationsPartialUpdate({
            path: {
              reviewer_profile_uuid: resolve.profile.uuid,
              uuid: resolve.affiliation.uuid,
            },
            body,
          })
        : nestedReviewerProfileAffiliationsCreate({
            path: { reviewer_profile_uuid: resolve.profile.uuid },
            body,
          });
    },
    successMessage: isEdit
      ? translate('Affiliation has been updated.')
      : translate('Affiliation has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update affiliation.')
      : translate('Unable to add affiliation.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(formData) => mutateAsync(formData)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit affiliation')
                : translate('Add affiliation')
            }
            subtitle={translate(
              'Add your institutional affiliations for conflict of interest detection.',
            )}
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor={isEdit ? 'warning' : 'success'}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={isPending}
                  disabled={invalid}
                  label={isEdit ? translate('Update') : translate('Add')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <StringGroup
              name="organization_name"
              label={translate('Organization name')}
              validate={required}
            />

            <StringGroup
              name="organization_identifier"
              label={translate('Organization identifier')}
              description={translate(
                'ROR, GRID, or other external identifier (optional)',
              )}
            />

            <StringGroup name="department" label={translate('Department')} />

            <StringGroup
              name="position_title"
              label={translate('Position title')}
              validate={required}
            />

            <SelectGroup
              name="affiliation_type"
              label={translate('Affiliation type')}
              options={AFFILIATION_TYPE_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              isClearable={false}
              validate={required}
            />

            <DateGroup
              name="start_date"
              label={translate('Start date')}
              validate={required}
            />

            <DateGroup
              name="end_date"
              label={translate('End date')}
              description={translate('Leave empty for current affiliation')}
            />

            <BooleanGroup
              name="is_primary"
              label={translate('This is my primary affiliation')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
